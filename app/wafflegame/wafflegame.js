'use client';

import { useState, useEffect, useMemo } from 'react';
import './style.css';

const gameBoardRows = 3;
const gameBoardCols = 3;

const tileColors = [
    'rgb(0, 255, 255)',
    'rgb(255, 0, 255)',
    'rgb(255, 255, 0)'
];

const placeholderBoard = [[0]];

function cloneBoard(board) { return board.map(row => [...row]); }

function randomIndex(array) { return Math.floor(Math.random() * array.length); }

function getRandomBoard() {
    let board = [];
    for (let i = 0; i < gameBoardRows; i++) board.push(Array(gameBoardCols).fill(0));
    for (let i = 0; i < gameBoardRows; i++) {
        for (let j = 0; j < gameBoardCols; j++) {
            let amount = randomIndex(tileColors);
            for (let k = 0; k < amount; k++) makeMove(board, i, j);
        }
    }
    return board;
}

function getScrambledBoard(unscrambledBoard) {
    let scrambledBoard = cloneBoard(unscrambledBoard);
    for (let i = 0; i < gameBoardRows; i++) {
        for (let j = 0; j < gameBoardCols; j++) {
            let amount = randomIndex(tileColors);
            for (let k = 0; k < amount; k++) makeMove(scrambledBoard, i, j);
        }
    }
    return scrambledBoard;
}

function getNeighbors(i, j) {
    let result = [];
    
    if (i > 0) result.push([i - 1, j]);
    if (j > 0) result.push([i, j - 1]);
    if (i < gameBoardRows - 1) result.push([i + 1, j]);
    if (j < gameBoardCols - 1) result.push([i, j + 1]);
    
    return result;
}

function Pulser({ active }) {
    return (
        <div className='flex items-center justify-center absolute inset-0 z-2 pointer-events-none'>
            <div className='click-me-text text-8xl'>
                {active ? 'CLICK ME' : ''}
            </div>
        </div>
    );
}

function Tile({ phase, onTileClick }) {
    return <button className='game-tile' onClick={onTileClick} style={{ backgroundColor: tileColors[phase] }} />
}

function makeMove(board, i, j) {
    board[i][j] = (board[i][j] + 1) % tileColors.length;
    for (let [k, l] of getNeighbors(i, j)) {
        board[k][l] = (board[k][l] + 1) % tileColors.length;
    }
}

function Board({ board, interactive, handleMove }) {
    const [pulserActive, setPulserActive] = useState(true);

    let onBoardClick;
    let onTileClick;

    if (interactive === true) {
        onBoardClick = () => {
            setPulserActive(false);
        }

        onTileClick = (i, j) => {
            console.log(`tile (${i}, ${j}) clicked`);

            const squelch = new Audio('/audio/squelch.wav');
            squelch.play();
            
            handleMove(i, j);
        };
    }
    else {
        onBoardClick = () => {};
        onTileClick = (i, j) => {};
    }

    return (
        <div className='vomit-box relative'>
            <div className='game-board-wrapper'>
                {interactive && <Pulser active={pulserActive}/>}
                <div className='game-board' id='game-board' onClick={onBoardClick} style={{
                    gridTemplateRows: `repeat(${gameBoardRows}, 1fr)`,
                    gridTemplateColumns: `repeat(${gameBoardCols}, 1fr)`,
                    aspectRatio: `${gameBoardCols / gameBoardRows}`
                }}>
                    
                    {board.map((row, i) =>
                        row.map((phase, j) => (
                            <Tile
                                key={`${i}-${j}`}
                                phase={board[i][j]}
                                onTileClick={() => onTileClick(i, j)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function WaffleGame() {
    const [game, setGame] = useState(() => {
        if (typeof window === 'undefined') return [placeholderBoard, placeholderBoard];

        const target = getRandomBoard();
        const scrambled = getScrambledBoard(target);

        return [scrambled, target];
    });
    const [boyWaffleText, setBoyWaffleText] = useState("");

    useEffect(() => {
        setBoyWaffleText(checkWin(game) ? 'SPECIAL WAFFLE' : 'WAFFLE');
    }, [game]);

    function checkWin(game) {
        for (let i = 0; i < gameBoardRows; i++) {
            for (let j = 0; j < gameBoardCols; j++) {  
                if (game[0][i][j] !== game[1][i][j]) return false;
            }
        }
        return true;
    }

    function handleMove(i, j) {
        console.log('handling move');

        let newBoard = cloneBoard(game[0]);
        makeMove(newBoard, i, j);
        setGame([newBoard, game[1]]);
    }
    
    return (
        <div className='waffle-game-wrapper'>
            <div className='vomit-box'>
                <p className='red-glowing-text text-6xl' id='boy-waffle'>{boyWaffleText}</p>
            </div>
            <Board interactive={true} board={game[0]} handleMove={handleMove} />
            <div className='vomit-box'>
                <p className='red-glowing-text text-6xl'>SPECIAL WAFFLE</p>
            </div>
            <Board interactive={false} board={game[1]} />
        </div>
    );
}