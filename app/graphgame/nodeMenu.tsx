import GraphNode from "./node";
import { Html } from "@react-three/drei";
import { useGraphStore } from "./graphStore";
import Knob from "./knob";



export default function NodeMenu() {
	const node = useGraphStore((state) => state.selectedNode);
    useGraphStore((state) => state.synthVersion);
	const setNodeSynthParameter = useGraphStore((state) => state.setNodeSynthParameter);

    if (node === undefined) return null;

	return (
		<div className="absolute inset-0 pointer-events-none">
			{node !== undefined && (
				<div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[min(90vw,800px)] bg-blue-500 p-8">
					<div className="grid grid-cols-4 gap-8 pointer-events-auto">
                        {[0, 1, 2, 3].map((i) => (
                            <Knob
                                key={`${node.id}-knob-${i}`}
                                options={node.synth.getParameterOptions(i)}
                                value={node.synth.getParameterOptionIndex(i)}
                                onChange={(value) => {
                                    setNodeSynthParameter(node, i, value);
                                }}
                            />
                        ))}
					</div>
				</div>
			)}
		</div>
	);
}