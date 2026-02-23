import { v4 as uuidv4 } from 'uuid';
import { Game, GameStatus, GuessResult } from './apiTypes';

export const createNewGame = (): Game => ({
  id: uuidv4(),
  targetNumber: Math.floor(Math.random() * 100) + 1,
  attempts: 0,
  status: GameStatus.IN_PROGRESS,
  createdAt: new Date(),
});

export const evaluateGuess = (guess: number, targetNumber: number): GuessResult => {
  if (guess < targetNumber) return 'TOO_LOW';
  if (guess > targetNumber) return 'TOO_HIGH';
  return 'CORRECT';
};

export const getResponseMessage = (result: GuessResult): string => {
  const messages: Record<GuessResult, string> = {
    TOO_LOW: 'Too low. Try again!',
    TOO_HIGH: 'Too high. Try again!',
    CORRECT: "Correct! You've guessed the number.",
  };
  return messages[result];
};

