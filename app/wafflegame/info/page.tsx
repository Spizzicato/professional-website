export default function Home() {
    return (
        <main className="grid grid-rows-[auto_1fr] gap-6 min-h-dvh max-w-6xl mx-auto p-6">
            <div className="basic-card">
                <div className="p-4 text-4xl text-center">Waffle Game</div>
                <div className="p-4 text-l">
                    This game is a variation of the puzzle game Lights Out with slightly different mechanics and a slightly different goal.
                    While the tiles in Lights Out can only be on or off, this game allows each tile to be in one of three possible states (cyan, magenta, and yellow).
                    Clicking a tile will change it to the next state in an infinite cyan magenta yellow cycle, but it will also cause any neighboring tiles to shift states in a similar way.
                    The goal of the game is to match the waffle on the left to the waffle on the right.
                    <br/><br/>
                    There are many mathematically interesting aspects of this game. Each game state can be thought of as a vector in a vector space over the integers modulo 3,
                    and each move can be thought of in the same way. Specifically, each time you make a move, a vector gets added to the game state, 
                    changing it into a different vector. 
                    I modeled this game (as well as many variations) in a theorem prover to find out which configurations are actually solvable and how.
                    I also discovered some techniques that allow the game to be beaten very easily!
                    <br/><br/>
                    The game was also an early exercise in expanding my knowledge of CSS and JavaScript.
                    I used raw CSS and JavaScript initially, but rewrote the game in React once I moved it to this site.
                </div>
            </div>
        </main>
    );
}
