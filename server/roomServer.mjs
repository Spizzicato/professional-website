// Relay server for the graph game rooms. It keeps one Yjs document per room and
// forwards sync/awareness messages between the clients connected to that room.
// Run it alongside `next dev` with `npm run rooms`.

import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

// message tags defined by the y-websocket protocol
const messageSync = 0;
const messageAwareness = 1;

// Fly.io sets PORT; local dev uses ROOM_SERVER_PORT or 1234
const port = Number.parseInt(
	process.env.PORT ?? process.env.ROOM_SERVER_PORT ?? "1234",
	10,
);
const host = process.env.HOST ?? "0.0.0.0";
const pingInterval = 30000;

const roomIdPattern = /^[a-zA-Z0-9_-]{1,64}$/;

const rooms = new Map();

function send(socket, message) {
	if (socket.readyState !== socket.OPEN) {
		socket.close();
		return;
	}

	try {
		socket.send(message);
	}
	catch {
		socket.close();
	}
}

function broadcast(room, message, exclude) {
	for (const socket of room.sockets.keys()) {
		if (socket === exclude) continue;
		send(socket, message);
	}
}

function createRoom(name) {
	const doc = new Y.Doc();
	const awareness = new awarenessProtocol.Awareness(doc);
	awareness.setLocalState(null);

	const room = { name, doc, awareness, sockets: new Map() };

	doc.on("update", (update, origin) => {
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, messageSync);
		syncProtocol.writeUpdate(encoder, update);
		broadcast(room, encoding.toUint8Array(encoder), origin);
	});

	awareness.on("update", ({ added, updated, removed }, origin) => {
		// remember which clients a socket speaks for so we can retract them when it drops
		const controlledIds = room.sockets.get(origin);
		if (controlledIds) {
			for (const clientId of added)
				controlledIds.add(clientId);
			for (const clientId of removed)
				controlledIds.delete(clientId);
		}

		const changed = added.concat(updated, removed);
		if (changed.length === 0) return;

		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, messageAwareness);
		encoding.writeVarUint8Array(
			encoder,
			awarenessProtocol.encodeAwarenessUpdate(awareness, changed),
		);
		broadcast(room, encoding.toUint8Array(encoder), origin);
	});

	rooms.set(name, room);
	return room;
}

function getRoom(name) {
	return rooms.get(name) ?? createRoom(name);
}

function handleMessage(room, socket, data) {
	const decoder = decoding.createDecoder(new Uint8Array(data));
	const messageType = decoding.readVarUint(decoder);

	if (messageType === messageSync) {
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, messageSync);
		syncProtocol.readSyncMessage(decoder, encoder, room.doc, socket);

		// only the tag was written, so there is nothing to reply with
		if (encoding.length(encoder) <= 1) return;

		send(socket, encoding.toUint8Array(encoder));
	}
	else if (messageType === messageAwareness) {
		awarenessProtocol.applyAwarenessUpdate(
			room.awareness,
			decoding.readVarUint8Array(decoder),
			socket,
		);
	}
}

function closeRoomIfUnused(room) {
	if (room.sockets.size > 0) return;

	// keep graphs people built, but do not hoard documents for rooms nobody used
	if (room.doc.getMap("nodes").size > 0) return;

	room.awareness.destroy();
	room.doc.destroy();
	rooms.delete(room.name);
}

function setupConnection(socket, room) {
	socket.binaryType = "arraybuffer";
	room.sockets.set(socket, new Set());

	let alive = true;
	const keepAlive = setInterval(() => {
		// a socket that missed the previous ping is gone even if the OS has not noticed
		if (!alive) {
			socket.terminate();
			return;
		}

		alive = false;

		try {
			socket.ping();
		}
		catch {
			socket.terminate();
		}
	}, pingInterval);

	socket.on("pong", () => {
		alive = true;
	});

	socket.on("message", (data) => {
		try {
			handleMessage(room, socket, data);
		}
		catch (error) {
			console.error(`[${room.name}] dropped a malformed message`, error);
		}
	});

	socket.on("close", () => {
		clearInterval(keepAlive);
		awarenessProtocol.removeAwarenessStates(
			room.awareness,
			Array.from(room.sockets.get(socket) ?? []),
			null,
		);
		room.sockets.delete(socket);
		closeRoomIfUnused(room);
	});

	// ask the client for whatever it has that we do not
	const syncEncoder = encoding.createEncoder();
	encoding.writeVarUint(syncEncoder, messageSync);
	syncProtocol.writeSyncStep1(syncEncoder, room.doc);
	send(socket, encoding.toUint8Array(syncEncoder));

	const states = room.awareness.getStates();
	if (states.size > 0) {
		const awarenessEncoder = encoding.createEncoder();
		encoding.writeVarUint(awarenessEncoder, messageAwareness);
		encoding.writeVarUint8Array(
			awarenessEncoder,
			awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(states.keys())),
		);
		send(socket, encoding.toUint8Array(awarenessEncoder));
	}
}

const server = createServer((request, response) => {
	response.writeHead(200, { "Content-Type": "text/plain" });
	response.end(`graph game rooms: ${rooms.size}`);
});

const webSocketServer = new WebSocketServer({ server });

webSocketServer.on("connection", (socket, request) => {
	const roomId = new URL(request.url ?? "/", "http://localhost").pathname.slice(1);

	if (!roomIdPattern.test(roomId)) {
		socket.close(1008, "invalid room id");
		return;
	}

	setupConnection(socket, getRoom(roomId));
});

server.listen(port, host, () => {
	console.log(`> Graph game rooms listening on http://${host}:${port}`);
});