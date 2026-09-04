export default function Lighting() {
    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[0, 10, 30]} intensity={2} />
            {/* <pointLight position={[0, 20, 30]} intensity={0.5} /> */}
        </>
    );
}