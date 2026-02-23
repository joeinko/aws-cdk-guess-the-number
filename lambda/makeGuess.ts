import { GameStatus } from "./src/apiTypes";
import { getGame, updateGame } from "./src/gameRepository";
import { evaluateGuess, getResponseMessage } from "./src/gameService";
import {MAX_GUESS, MIN_GUESS} from "./src/gameConfig";

export const handler = async (event: any) => {
  let gameId: string, guess: number;

  try {
    const body = JSON.parse(event.body);
    gameId = body.gameId;
    guess = body.guess;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid request body. Expected JSON with gameId (string) and guess (number).' }),
    };
  }

  if (!gameId || !Number.isInteger(guess)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: gameId (string) or guess (number).' }),
    };
  }

  if (guess < MIN_GUESS || guess > MAX_GUESS) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Guess must be an integer between ${MIN_GUESS} and ${MAX_GUESS}.` }),
    };
  }

  const game = await getGame(gameId);
  if (!game) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Game not found.' }),
    };
  }

  if (game.status === GameStatus.COMPLETED) {
    return {
      statusCode: 409,
      body: JSON.stringify({ message: 'This game is already completed. To play again, start a new game.' }),
    };
  }

  game.attempts += 1;

  const result = evaluateGuess(guess, game.targetNumber);
  if (result === 'CORRECT') {
    game.status = GameStatus.COMPLETED;
  }

  await updateGame(game);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: getResponseMessage(result) }),
  };
};
