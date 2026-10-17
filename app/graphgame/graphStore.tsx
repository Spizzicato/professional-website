import * as THREE from "three";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import GraphNode from "./node";
import GraphEdge from "./edge";
import GraphWalker from "./walker";
import { nearestGridPoint } from "./helpers";
import * as roomSync from "./roomSync";
import { RoomStatus } from "./roomSync";

export interface GraphStore {
	nodes: Set<GraphNode>;
	edges: Map<string, Map<string, GraphEdge>>;
	walkers: Set<GraphWalker>;
	topId: number;

	selectedNode: GraphNode | undefined;
	hoveredNode: GraphNode | undefined;

	grabbedNode: GraphNode | undefined;
	grabOffset: THREE.Vector3 | undefined;

	edgeStart: GraphNode | undefined;

	synthVersion: number;

	walkersMoving: boolean;

	roomId: string | undefined;
	connectionStatus: RoomStatus;

	getNewIntId: () => string;

	edgeStarted: () => boolean;
	startEdge: (a: GraphNode) => void;
	endEdge: (b: GraphNode) => boolean;

	selectNode: (node: GraphNode) => void;
	deselectNode: () => void;

	hoverNode: (node: GraphNode) => void;
	unhoverNode: () => void;

	grabNode: (node: GraphNode, pos: THREE.Vector3) => void;
	releaseGrabbedNode: () => void;

	addNode: (position?: THREE.Vector3) => GraphNode | undefined;
	moveNode: (node: GraphNode, position: THREE.Vector3) => void;
	edgeExists: (a: GraphNode, b: GraphNode) => boolean;
	addEdge: (a: GraphNode, b: GraphNode) => void;
	removeEdge: (a: GraphNode, b: GraphNode) => void;
	removeNode: (node: GraphNode) => void;

	getRandomNode: () => GraphNode;

	addWalker: (startNode?: GraphNode) => void;
	removeWalker: (walker: GraphWalker) => void;
	toggleWalkersMoving: () => void;

	setNodeSynthParameter: (
		node: GraphNode,
		parameter: number,
		value: number
	) => void;

	enterRoom: (roomId: string) => void;
	leaveRoom: () => void;
}

function keepIfPresent(node: GraphNode | undefined, nodes: Set<GraphNode>) {
	return node && nodes.has(node) ? node : undefined;
}

export const useGraphStore = create<GraphStore>()(subscribeWithSelector((set, get) => ({
	nodes: new Set(),
	edges: new Map(),
	walkers: new Set(),
	walkersMoving: true,

	topId: -1,

    selectedNode: undefined,

    hoveredNode: undefined,

	grabbedNode: undefined,
	grabOffset: undefined,

	edgeStart: undefined,

    synthVersion: 0,

	roomId: undefined,
	connectionStatus: "offline",

	getNewIntId: () => {
		const id = get().topId + 1;
		set({ topId: id });
		return `${id}`;
	},

	edgeStarted: () => !!get().edgeStart,

	startEdge: (a) => {
		set({ edgeStart: a });
	},

	endEdge: (b) => {
		const { edgeStart } = get();

		const canEnd =
			!!edgeStart &&
			edgeStart !== b &&
			!get().edgeExists(edgeStart, b);

		if (canEnd) {
			get().addEdge(edgeStart, b);
		}

		set({ edgeStart: undefined });

		return canEnd;
	},

	selectNode: (node) => {
		set({ selectedNode: node });
	},

    deselectNode: () => {
        set({ selectedNode: undefined });
    },

    hoverNode: (node) => {
        set({ hoveredNode: node });
    },

    unhoverNode: () => {
        set({ hoveredNode: undefined });
    },

	grabNode: (node, pos) => {
		set({ grabbedNode: node, grabOffset: pos });
	},

	releaseGrabbedNode: () => {
		const { grabbedNode } = get();

		// the drag only published whole grid cells, so settle on the one we landed in
		if (grabbedNode?.mesh)
			roomSync.moveNode(grabbedNode, nearestGridPoint(grabbedNode.mesh.position));

		set({ grabbedNode: undefined, grabOffset: undefined });
	},

	// every mutation below goes through the shared document and comes back as a
	// snapshot, so a local edit takes exactly the same path as a remote one

	addNode: (position?: THREE.Vector3) => {
		return roomSync.createNode(position ?? new THREE.Vector3(0, 0, 0));
	},

	moveNode: (node, position) => {
		roomSync.moveNode(node, position);
	},

	edgeExists: (a, b) => {
		return get().edges.get(a.id)?.has(b.id) ?? false;
	},

	addEdge: (a, b) => {
		roomSync.createEdge(a, b);
	},

	removeEdge: (a, b) => {
		roomSync.deleteEdge(a, b);
	},

	removeNode: (node) => {
		roomSync.deleteNode(node);
	},

	getRandomNode: () => {
		const nodes = Array.from(get().nodes);

		if (nodes.length === 0)
			throw new Error("No nodes available to select a random node.");

		const randomIndex = Math.floor(Math.random() * nodes.length);
		return nodes[randomIndex];
	},

	addWalker: (startNode?: GraphNode) => {
		set((state) => {
			const walkers = new Set(state.walkers);
			const walker = new GraphWalker(get().getNewIntId(), startNode ?? get().getRandomNode());
			walkers.add(walker);

			return { walkers };
		});
	},

	removeWalker: (walker: GraphWalker) => {
		set((state) => {
			const walkers = new Set(state.walkers);
			walkers.delete(walker);

			return { walkers };
		});
	},

	toggleWalkersMoving: () => {
		set((state) => ({
			walkersMoving: !state.walkersMoving,
		}));
	},

    setNodeSynthParameter: (node, parameter, value) => {
        node.synth.updateParameter(parameter, value);

        set((state) => ({
            synthVersion: state.synthVersion + 1,
        }));
    },

	enterRoom: (roomId) => {
		if (get().roomId === roomId) return;

		get().leaveRoom();

		set({ roomId, connectionStatus: "connecting" });

		roomSync.connectRoom(roomId, {
			onGraphChanged: ({ nodes, edges }) => {
				// anything we were pointing at may have been deleted by someone else
				set((state) => ({
					nodes,
					edges,
					selectedNode: keepIfPresent(state.selectedNode, nodes),
					hoveredNode: keepIfPresent(state.hoveredNode, nodes),
					grabbedNode: keepIfPresent(state.grabbedNode, nodes),
					grabOffset: keepIfPresent(state.grabbedNode, nodes) ? state.grabOffset : undefined,
					edgeStart: keepIfPresent(state.edgeStart, nodes),
				}));

				// the first walker has to wait for a graph to walk on
				// with an empty room, this means waiting for the seed or for the first node anyone adds
				if (get().walkers.size === 0 && nodes.size > 0) 
					get().addWalker();
			},

			onStatusChanged: (connectionStatus) => set({ connectionStatus }),

			onSynced: () => {
				// give whoever opens a fresh room something to play with
				// but do not refill a room the people already in it have deliberately emptied
				if (roomSync.roomIsEmpty() && roomSync.peerCount() <= 1)
					roomSync.seedRoom();
			},
		});
	},

	leaveRoom: () => {
		roomSync.disconnectRoom();

		for (const walker of get().walkers)
			walker.dispose();

		set({
			roomId: undefined,
			connectionStatus: "offline",
			nodes: new Set(),
			edges: new Map(),
			walkers: new Set(),
			topId: -1,
			selectedNode: undefined,
			hoveredNode: undefined,
			grabbedNode: undefined,
			grabOffset: undefined,
			edgeStart: undefined,
			walkersMoving: true,
			synthVersion: 0,
		});
	},

})));