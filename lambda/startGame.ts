import { createGame } from "./src/gameRepository";
import { createNewGame } from "./src/gameService";

export const handler = async (_event: any) => {
  const game = createNewGame();

  await createGame(game);

  return {
    statusCode: 201,
    body: JSON.stringify({
      gameId: game.id,
      message: 'Game started! Make a guess between 1 and 100.',
    }),
  };
};