export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface Game {
  id: string;
  targetNumber: number;
  attempts: number;
  status: GameStatus;
  createdAt: Date;
}

export type GuessResult = 'TOO_LOW' | 'TOO_HIGH' | 'CORRECT';
