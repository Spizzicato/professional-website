import { gridSize } from "./helpers";

const extent = 4000;
const divisions = extent / gridSize;

export default function GridBackground() {
	return (
		<gridHelper
			args={[extent, divisions, 0x666666, 0x3a3a3a]}
			rotation={[Math.PI / 2, 0, 0]}
			position={[0, 0, -0.5]}
			raycast={() => null}
			frustumCulled={false}
		/>
	);
}
