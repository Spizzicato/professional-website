import * as THREE from "three";
import { create } from "zustand";
import GraphNode from "./node";
import GraphEdge from "./edge";

const getEdgeKey = (a: GraphNode, b: GraphNode) => [a.id, b.id].sort().join('-');

export interface GraphStore {
	nodes: Set<GraphNode>;
	edges: Map<string, GraphEdge>;
	topId: number;

	grabbedNode: GraphNode | undefined;
	grabOffset: THREE.Vector3 | undefined;
	edgeStart: GraphNode | undefined;

	getNewId: () => string;

	edgeStarted: () => boolean;
	startEdge: (a: GraphNode) => void;
	endEdge: (b: GraphNode) => boolean;

	grabNode: (node: GraphNode, pos: THREE.Vector3) => void;
	releaseGrabbedNode: () => void;

	addNode: (position?: THREE.Vector3) => GraphNode;
	edgeExists: (a: GraphNode, b: GraphNode) => boolean;
	addEdge: (a: GraphNode, b: GraphNode) => GraphEdge;
	removeEdge: (a: GraphNode, b: GraphNode) => void;
	removeNode: (node: GraphNode) => void;
}



export const useGraphStore = create<GraphStore>((set, get) => ({
	nodes: new Set(),
	edges: new Map(),
	topId: -1,

	grabbedNode: undefined,
	grabOffset: undefined,
	edgeStart: undefined,

	getNewId: () => {
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
			!get().edges.has(getEdgeKey(edgeStart, b));

		if (canEnd) {
			get().addEdge(edgeStart!, b);
		}

		set({ edgeStart: undefined });

		return canEnd;
	},

	grabNode: (node, pos) => {
		set({
			grabbedNode: node,
			grabOffset: pos,
		});
	},

	releaseGrabbedNode: () => {
		set({
			grabbedNode: undefined,
			grabOffset: undefined,
		});
	},

	addNode: (position) => {
		const node = new GraphNode(get().getNewId(), position);

		set((state) => {
			const nodes = new Set(state.nodes);
			nodes.add(node);

			return { nodes };
		});

		return node;
	},

	edgeExists: (a, b) => {
		return get().edges.has(getEdgeKey(a, b));
	},

	addEdge: (a, b) => {
		const edge = new GraphEdge(get().getNewId(), a, b);

		set((state) => {
			const edges = new Map(state.edges);
			edges.set(getEdgeKey(a, b), edge);

			return { edges };
		});

		return edge;
	},

	removeEdge: (a, b) => {
		const key = getEdgeKey(a, b);
		const edge = get().edges.get(key);

		if (!edge) return;

		a.neighbors.delete(b);
		b.neighbors.delete(a);

		set((state) => {
			const edges = new Map(state.edges);
			edges.delete(key);
			return { edges };
		});
	},

	removeNode: (node) => {
		const neighbors = Array.from(node.neighbors.keys());

		for (const neighbor of neighbors) {
			get().removeEdge(node, neighbor);
		}

		set((state) => {
			const nodes = new Set(state.nodes);
			nodes.delete(node);

			return { nodes };
		});
	},
}));