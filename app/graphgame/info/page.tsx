import { StandardLayout } from "@/app/layout";

export default function Home() {
    return (
        <StandardLayout>
            <div className="basic-card">
                <div className="p-4 text-4xl text-center">Graph Game</div>
                <div className="p-4 text-l">
                    This game is essentially an interactive musical sandbox.
                    You place nodes on the grid and connect them with edges. 
                    A walker randomly traverses the graph you design and plays notes when it arrives at nodes.
                    Every node is its own simple FM synthesizer with an adjustable pitch.
                    <br/><br/>
                    I designed this because I thought it would be an interesting way to make music.
                    The music produced by the graph depends on both connectivity and spatial position.
                    <br/><br/>
                    The game is also multiplayer. Every session takes place in a room named in the URL.
                    Users who open the same link can edit the same graph in real time.
                    The shared graph is stored as a CRDT (conflict-free replicated data type) using Yjs, which merges simultaneous edits from different people automatically
                    and lets changes made while disconnected sync back up once the connection returns.
                    A small relay server passes updates between the players in each room.
                    <br/><br/>
                    The graph is rendered in 3D with React Three Fiber (three.js), and the sound is generated in the browser with Tone.js.
                    There is a question mark icon on the game page. If you click it, you can get information about the controls.
                </div>
            </div>
        </StandardLayout>
    );
}
