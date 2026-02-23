import axios, { AxiosInstance } from 'axios';
import {MAX_GUESS, MIN_GUESS} from "../lambda/src/gameConfig";

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error('API_URL environment variable is not set. Run: export API_URL=$(aws cloudformation describe-stacks --stack-name GuessTheNumberStack --query "Stacks[0].Outputs[?OutputKey==\'ApiUrl\'].OutputValue" --output text)');
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  validateStatus: () => true, // don't throw on non-2xx so we can assert status codes ourselves
});

const completeGame = async (gameId: string): Promise<void> => {
  let low = MIN_GUESS, high = MAX_GUESS;
  while (low <= high) {
    const guess = Math.floor((low + high) / 2);
    const response = await api.post('make-guess', { gameId, guess });
    const message: string = response.data.message;
    if (message === "Correct! You've guessed the number.") break;
    if (message === 'Too low. Try again!') low = guess + 1;
    else high = guess - 1;
  }
};

describe('Guess The Number API', () => {
  let gameId: string;

  it('POST /start-game starts a new game and returns a gameId', async () => {
    const response = await api.post('start-game');

    expect(response.status).toBe(200);
    expect(response.data.gameId).toBeDefined();
    expect(response.data.message).toBe(`Game started! Make a guess between ${MIN_GUESS} and ${MAX_GUESS}.`);

    gameId = response.data.gameId;
  });

  it('POST /make-guess returns TOO_LOW or TOO_HIGH for a non-correct guess', async () => {
    const response = await api.post('make-guess', { gameId, guess: 1 });

    expect(response.status).toBe(200);
    expect(['Too low. Try again!', 'Too high. Try again!', "Correct! You've guessed the number."]).toContain(response.data.message);
  });

  it('POST /make-guess returns 409 for a completed game', async () => {
    const startResponse = await api.post('start-game');
    const newGameId = startResponse.data.gameId;

    await completeGame(newGameId);

    const response = await api.post('make-guess', { gameId: newGameId, guess: 50 });
    expect(response.status).toBe(409);
    expect(response.data.message).toContain('already completed');
  }, 30000);

  it('POST /make-guess returns 404 for a non-existent gameId', async () => {
    const response = await api.post('make-guess', { gameId: 'non-existent-id', guess: 50 });

    expect(response.status).toBe(404);
    expect(response.data.message).toBe('Game not found.');
  });
});

