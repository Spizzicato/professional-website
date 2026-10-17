import { edgeGeometry, edgeMaterial } from "./edgeView";

export default function Lighting() {
    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[0, 10, 30]} intensity={2} />
            <mesh
                visible={false}
                geometry={edgeGeometry}
                material={edgeMaterial}
                dispose={null}
            />
        </>
    );
}
