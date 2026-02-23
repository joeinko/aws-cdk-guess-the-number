import { GameStatus } from "./src/apiTypes";
import { getGame, updateGame } from "./src/gameRepository";
import { evaluateGuess, getResponseMessage } from "./src/gameService";

export const handler = async (event: any) => {
  const { gameId, guess } = JSON.parse(event.body);

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
