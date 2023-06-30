
import { GameRequest, GameResponse } from "./msg";

type Board = Uint8Array;

function newBoard(): Board {
    /*
    stored in the format    0 3 6
                            1 4 7
                            2 5 8
    */
    return new Uint8Array(9);
}

function boardFrom2d(array: number[][]): Board {
    let board = newBoard();
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[3 * i + j] = array[i][j];
        }
    }
    return board;
}

function boardTo2d(board: Board): number[][] {
    return [
        [board[0], board[1], board[2]],
        [board[3], board[4], board[5]],
        [board[6], board[7], board[8]]
    ]
}

function stateAfterMove(gameState: GameState, move: number): GameState {
    const nextPlayer = gameState.turn === 1 ? 2 : 1;

    const nextBoard = new Uint8Array(gameState.board);
    nextBoard[move] = gameState.turn;

    let winner = checkWins(nextBoard);

    return {
        turn: nextPlayer,
        winner,
        board: nextBoard
    }
}

function checkWins(board: Board): number | null {
    // check columns
    for (let i = 0; i < 3; i++) {
        const c1 = board[3 * i];
        const c2 = board[3 * i + 1];
        const c3 = board[3 * i + 2];
        if (c1 !== 0 && c1 === c2 && c1 === c3) {
            return c1
        }
    }

    // check rows
    for (let i = 0; i < 3; i++) {
        const c1 = board[i];
        const c2 = board[i + 3];
        const c3 = board[i + 6];
        if (c1 !== 0 && c1 === c2 && c1 === c3) {
            return c1
        }
    }

    // check diagonals
    {
        const c1 = board[0];
        const c2 = board[4];
        const c3 = board[8];
        if (c1 !== 0 && c1 === c2 && c2 === c3) {
            return c1
        }
    }

    {
        const c1 = board[6];
        const c2 = board[4];
        const c3 = board[2];
        if (c1 !== 0 && c1 === c2 && c1 === c3) {
            return c1
        }
    }

    return null;
}

function getMoves(board: Board): number[] {
    let legalMoves = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === 0) {
            legalMoves.push(i);
        }
    }
    return legalMoves
}

type XorShift = Uint32Array

function newRng(): XorShift {
    return new Uint32Array([Date.now()])
}

function rngRange(rng: XorShift, low: number, high: number): number {
    rng[0] ^= rng[0] >> 13;
    rng[0] ^= rng[0] << 17;
    rng[0] ^= rng[0] >> 5;
    return (low + (rng[0] % (high - low)));
}

function rolloutGame(gameState: GameState, rng: XorShift): number | null {
    let buffState: GameState = {
        board: new Uint8Array(gameState.board),
        turn: gameState.turn,
        winner: null
    };
    
    let ctr = 0;
    while (true && ctr < 100) {
        ctr++;
        // check for wins
        let winner = checkWins(buffState.board);
        if(winner !== null) {
            return winner;
        }

        // get legal moves
        let legalMoves = getMoves(buffState.board);
        // console.log(`legal moves: ${legalMoves}`);
        if(legalMoves.length == 0) {
            return 0;
        }

        let moveIdx = rngRange(rng, 0, legalMoves.length);
        // console.log(`moveIdx: ${moveIdx}`);
        // console.log(`doing move ${legalMoves[moveIdx]}`);
        buffState = stateAfterMove(buffState, legalMoves[moveIdx]);

        // console.log(buffState);
    }

    return null;
}

function evaluatePosition(gameState: GameState, numGames: number, targetWinner: number): number {
    let winCnt = 0;
    let loseCnt = 0;

    let rng = newRng();

    for(let i=0; i<numGames; i++) {
        let winner = rolloutGame(gameState, rng);
        if(winner === null) {
            ;
        } else if(winner === targetWinner) {
            winCnt++;
        } else {
            loseCnt++;
        }
    }

    return winCnt - loseCnt;
}

export function Play(req: GameRequest): GameResponse {

    const computerPlayer = req.realPlayer === 1 ? 2 : 1;
    const board = boardFrom2d(req.board);

    let winner = checkWins(board);

    if (winner !== null) {
        return {
            board: req.board,
            winner: winner
        }
    }

    const gameState = {
        board: board,
        turn: computerPlayer,
        winner: winner
    };

    const legalMoves = getMoves(board);

    console.log(`legal moves: ${legalMoves}`);

    const numSims = req.difficulty * 10;

    let bestMove = legalMoves[0];
    let bestMoves: number[] = [];
    let bestEval = evaluatePosition(stateAfterMove(gameState, legalMoves[0]), numSims, computerPlayer);

    for (let i = 1; i < legalMoves.length; i++) {
        let moveEval = evaluatePosition(stateAfterMove(gameState, legalMoves[i]), numSims, computerPlayer);
        if (moveEval > bestEval) {
            bestMove = legalMoves[i];
            bestEval = moveEval;
            bestMoves = [legalMoves[i]]
        } else if(moveEval == bestEval) {
            bestMoves.push(legalMoves[i]);
        }
    }

    const rng = newRng();
    let bestMoveIdx = rngRange(rng, 0, bestMoves.length);
    bestMove = bestMoves[bestMoveIdx]

    console.log(`best move is ${bestMove}`);

    let nextState = stateAfterMove(gameState, bestMove);

    return {
        board: boardTo2d(nextState.board),
        winner: nextState.winner
    }
}

interface GameState {
    board: Board,
    turn: number,
    winner: number | null
}

