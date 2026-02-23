import { v4 as uuidv4 } from 'uuid';
import { Game, GameStatus, GuessResult } from './apiTypes';
import {MAX_GUESS, MIN_GUESS} from "./gameConfig";

const getRandomTarget = (): number => Math.floor(Math.random() * (MAX_GUESS - MIN_GUESS + 1)) + MIN_GUESS;

export const createNewGame = (): Game => ({
  id: uuidv4(),
  targetNumber: getRandomTarget(),
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

