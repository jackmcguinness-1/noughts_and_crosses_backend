
export interface GameRequest {
    board: number[][]
    realPlayer: number,
    difficulty: number
}

export interface GameResponse {
    board: number[][]
    winner: number | null
}