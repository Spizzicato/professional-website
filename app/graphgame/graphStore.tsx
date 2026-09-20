import * as THREE from "three";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import GraphNode from "./node";
import GraphEdge from "./edge";
import GraphWalker from "./walker";

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

	addNode: (position?: THREE.Vector3) => GraphNode;
	edgeExists: (a: GraphNode, b: GraphNode) => boolean;
	addEdge: (a: GraphNode, b: GraphNode) => GraphEdge;
	removeEdge: (a: GraphNode, b: GraphNode) => void;
	removeNode: (node: GraphNode) => void;

	getRandomNode: () => GraphNode;

	addWalker: (startNode?: GraphNode) => void;
	removeWalker: (walker: GraphWalker) => void;

	setNodeSynthParameter: (
		node: GraphNode,
		parameter: number,
		value: number
	) => void;
}

export const useGraphStore = create<GraphStore>()(subscribeWithSelector((set, get) => ({
	nodes: new Set(),
	edges: new Map(),
	walkers: new Set(),
	topId: -1,

    selectedNode: undefined,

    hoveredNode: undefined,

	grabbedNode: undefined,
	grabOffset: undefined,

	edgeStart: undefined,

    synthVersion: 0,

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
		set({
			selectedNode: node,
		});
	},

    deselectNode: () => {
        set({
            selectedNode: undefined,
        });
    },

    hoverNode: (node) => {
        set({
            hoveredNode: node,
        });
    },

    unhoverNode: () => {
        set({
            hoveredNode: undefined,
        });
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

	addNode: (position?: THREE.Vector3) => {
		const node = new GraphNode(get().getNewIntId(), position ?? new THREE.Vector3(0, 0, 0));

		set((state) => {
			const nodes = new Set(state.nodes);
			nodes.add(node);

			return { nodes };
		});

		return node;
	},

	edgeExists: (a, b) => {
		return get().edges.get(a.id)?.has(b.id) ?? false;
	},

	addEdge: (a, b) => {
		const edge = new GraphEdge(get().getNewIntId(), a, b);

		a.neighbors.add(b);
		b.neighbors.add(a);

		set((state) => {
			const edges = new Map(state.edges);

			const aEdges = new Map(edges.get(a.id));
			aEdges.set(b.id, edge);
			edges.set(a.id, aEdges);

			const bEdges = new Map(edges.get(b.id));
			bEdges.set(a.id, edge);
			edges.set(b.id, bEdges);

			return { edges };
		});

		return edge;
	},

	removeEdge: (a, b) => {
		const edge = get().edges.get(a.id)?.get(b.id);

		if (!edge) return;

		a.neighbors.delete(b);
		b.neighbors.delete(a);

		set((state) => {
			const edges = new Map(state.edges);

			const aEdges = new Map(edges.get(a.id));
			aEdges.delete(b.id);
			edges.set(a.id, aEdges);

			const bEdges = new Map(edges.get(b.id));
			bEdges.delete(a.id);
			edges.set(b.id, bEdges);

			return { edges };
		});
	},

	removeNode: (node) => {
		const neighbors = Array.from(node.neighbors);

		for (const neighbor of neighbors) {
			get().removeEdge(node, neighbor);
		}

		set((state) => {
			const nodes = new Set(state.nodes);
			nodes.delete(node);

			const edges = new Map(state.edges);
			edges.delete(node.id);

			return { nodes, edges };
		});
	},

	getRandomNode: () => {
		const nodes = Array.from(get().nodes);

		if (nodes.length === 0) {
			throw new Error("No nodes available to select a random node.");
		}

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

    setNodeSynthParameter: (node, parameter, value) => {
        node.synth.updateParameter(parameter, value);

        set((state) => ({
            synthVersion: state.synthVersion + 1,
        }));
    },
})));