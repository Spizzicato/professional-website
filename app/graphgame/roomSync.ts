import * as THREE from "three";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import GraphNode from "./node";
import GraphEdge from "./edge";
import { nearestGridPoint } from "./helpers";



export type RoomStatus = "offline" | "connecting" | "connected";

export interface SharedNodeState { x: number; y: number; }

export interface SharedEdgeState { a: string; b: string; }

export interface RoomSnapshot {
	nodes: Set<GraphNode>;
	edges: Map<string, Map<string, GraphEdge>>;
}

export interface RoomCallbacks {
	onGraphChanged: (snapshot: RoomSnapshot) => void;
	onStatusChanged: (status: RoomStatus) => void;
	onSynced: () => void;
}



// fixed ids so that two clients seeding the same empty room 
// land on the same graph instead of two overlapping copies of it
const seedNodeIds = ["seed-a", "seed-b"];
const seedPositions = [new THREE.Vector3(18, 16, 0), new THREE.Vector3(30, 16, 0)];

let doc: Y.Doc | undefined;
let provider: WebsocketProvider | undefined;
let callbacks: RoomCallbacks | undefined;
let synced = false;
let connectionFailed = false;

const nodesById = new Map<string, GraphNode>();
const edgesByKey = new Map<string, GraphEdge>();



function roomServerUrl() {
	const configured = process.env.NEXT_PUBLIC_ROOM_SERVER_URL;
	if (configured) return configured;
	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${window.location.hostname}:1234`;
}

// both endpoints name the edge the same way
// so two people drawing the same edge at once write one entry rather than two
export const edgeKey = (aId: string, bId: string) => aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;

const sharedNodes = () => doc!.getMap<SharedNodeState>("nodes");

const sharedEdges = () => doc!.getMap<SharedEdgeState>("edges");

function reconcile() {
	if (!doc) return;

	const nodeStates = sharedNodes();
	const edgeStates = sharedEdges();

	for (const [id, state] of nodeStates.entries()) {
		let node = nodesById.get(id);

		if (!node) {
			node = new GraphNode(id, new THREE.Vector3(state.x, state.y, 0));
			nodesById.set(id, node);
		}

		node.targetPosition.set(state.x, state.y, 0);
	}

	for (const [id, node] of nodesById) {
		if (nodeStates.has(id)) continue;
		nodesById.delete(id);
		node.synth.dispose();
	}

	for (const node of nodesById.values()) node.neighbors.clear();

	const edges = new Map<string, Map<string, GraphEdge>>();
	const dangling: string[] = [];

	for (const [key, state] of edgeStates.entries()) {
		const a = nodesById.get(state.a);
		const b = nodesById.get(state.b);

		// one peer can delete a node while another connects it
		// this leaves an edge pointing at nothing once the two edits merge
		if (!a || !b) {
			dangling.push(key);
			continue;
		}

		let edge = edgesByKey.get(key);

		if (!edge) {
			edge = new GraphEdge(key, a, b);
			edgesByKey.set(key, edge);
		}

		a.neighbors.add(b);
		b.neighbors.add(a);

		const aEdges = edges.get(a.id) ?? new Map<string, GraphEdge>();
		aEdges.set(b.id, edge);
		edges.set(a.id, aEdges);

		const bEdges = edges.get(b.id) ?? new Map<string, GraphEdge>();
		bEdges.set(a.id, edge);
		edges.set(b.id, bEdges);
	}

	for (const [key, edge] of edgesByKey) {
		if (edges.get(edge.a.id)?.get(edge.b.id) === edge) continue;

		edge.deleted = true;
		edgesByKey.delete(key);
	}

	callbacks?.onGraphChanged({ nodes: new Set(nodesById.values()), edges });

	// wait for the first sync 
	// so that we never mistake a document we have not received yet for a node someone deleted
	if (synced && dangling.length > 0) {
		doc.transact(() => {
			for (const key of dangling) sharedEdges().delete(key);
		});
	}
}

export function connectRoom(roomId: string, roomCallbacks: RoomCallbacks) {
	disconnectRoom();

	callbacks = roomCallbacks;
	doc = new Y.Doc();

	sharedNodes().observe(reconcile);
	sharedEdges().observe(reconcile);

	provider = new WebsocketProvider(roomServerUrl(), roomId, doc);

	// claim a slot in awareness so peers can count each other
	provider.awareness.setLocalState({ joinedAt: Date.now() });

	provider.on("status", ({ status }: { status: string }) => {
		if (status === "connected") {
			connectionFailed = false;
			callbacks?.onStatusChanged("connected");
			return;
		}

		// the provider retries on a timer, so report "connecting" only while we
		// still have reason to expect it to work instead of flapping every attempt
		if (status === "connecting" && !connectionFailed) {
			callbacks?.onStatusChanged("connecting");
			return;
		}

		connectionFailed = true;
		callbacks?.onStatusChanged("offline");
	});

	provider.on("sync", (isSynced: boolean) => {
		// reconnects sync again, but the room is only new to us once
		if (!isSynced || synced) return;

		synced = true;
		callbacks?.onSynced();
	});

	// edits made before the first sync still apply locally and merge on connect
	reconcile();
}

export function disconnectRoom() {
	provider?.destroy();
	doc?.destroy();

	provider = undefined;
	doc = undefined;
	callbacks = undefined;
	synced = false;
	connectionFailed = false;

	for (const node of nodesById.values()) node.synth.dispose();
	nodesById.clear();

	for (const edge of edgesByKey.values()) edge.deleted = true;
	edgesByKey.clear();
}

export const roomIsEmpty = () => !!doc && sharedNodes().size === 0;

export const peerCount = () => provider?.awareness.getStates().size ?? 1;

export function seedRoom() {
	doc?.transact(() => {
		const nodes = sharedNodes();
		if (nodes.size > 0) return;

		seedNodeIds.forEach((id, index) => {
			nodes.set(id, { x: seedPositions[index].x, y: seedPositions[index].y });
		});

		sharedEdges().set(edgeKey(seedNodeIds[0], seedNodeIds[1]), {
			a: seedNodeIds[0],
			b: seedNodeIds[1],
		});
	});
}

export function createNode(position: THREE.Vector3) {
	if (!doc) return undefined;

	const id = crypto.randomUUID();
	const gridPoint = nearestGridPoint(position);

	// the observer runs before this returns, so the node exists by the next line
	sharedNodes().set(id, { x: gridPoint.x, y: gridPoint.y });

	// once the line above returns, reconcile has already run and constructed the node
	const node = nodesById.get(id);

	// whoever placed the node watches it ease in from the cursor; everyone else just sees it appear on the grid
	node?.initialPosition.copy(position);

	return node;
}

export function moveNode(node: GraphNode, position: THREE.Vector3) {
	if (!doc) return;

	const state = sharedNodes().get(node.id);
	if (!state) return;
	if (state.x === position.x && state.y === position.y) return;

	sharedNodes().set(node.id, { x: position.x, y: position.y });
}

export function createEdge(a: GraphNode, b: GraphNode) {
	if (!doc) return undefined;
	const key = edgeKey(a.id, b.id);
	sharedEdges().set(key, { a: a.id, b: b.id });
	return edgesByKey.get(key);
}

export function deleteEdge(a: GraphNode, b: GraphNode) {
	sharedEdges().delete(edgeKey(a.id, b.id));
}

export function deleteNode(node: GraphNode) {
	doc?.transact(() => {
		const edgeStates = sharedEdges();

		const incident = Array.from(edgeStates.entries())
			.filter(([, state]) => state.a === node.id || state.b === node.id)
			.map(([key]) => key);

		for (const key of incident) edgeStates.delete(key);

		sharedNodes().delete(node.id);
	});
}