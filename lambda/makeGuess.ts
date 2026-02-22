import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import { Game } from "./apiTypes";

const dbClient = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

const getGame = async (gameId: string): Promise<Game | null> => {
  const getItemCommand = new GetItemCommand({
    TableName: TABLE_NAME,
    Key: {
      id: { S: gameId }
    }
  });

  const response = await dbClient.send(getItemCommand);
  if (!response.Item) {
    return null;
  }

  return {
    id: response.Item.id.S!,
    targetNumber: parseInt(response.Item.targetNumber.N!),
    attempts: parseInt(response.Item.attempts.N!),
    status: response.Item.status.S! as 'IN_PROGRESS' | 'COMPLETED',
    createdAt: new Date(response.Item.createdAt.S!)
  };
};

const evaluateGuess = (guess: number, targetNumber: number): 'TOO_LOW' | 'TOO_HIGH' | 'CORRECT' => {
  if (guess < targetNumber) {
    return 'TOO_LOW';
  } else if (guess > targetNumber) {
    return 'TOO_HIGH';
  } else {
    return 'CORRECT';
  }
}

const getResponseMessage = (result: 'TOO_LOW' | 'TOO_HIGH' | 'CORRECT'): string => {
  switch (result) {
    case 'TOO_LOW':
      return 'Too low. Try again!';
    case 'TOO_HIGH':
      return 'Too high. Try again!';
    case 'CORRECT':
      return "Correct! You've guessed the number.";
  }
}

export const handler = async (event: any) => {
  const { gameId, guess } = JSON.parse(event.body);

  const game = await getGame(gameId);
  if (!game) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Game not found.' })
    };
  }

  if (game.status === 'COMPLETED') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'This game is already completed. To play again, start a new game.' })
    };
  }

  game.attempts += 1;

  const result = evaluateGuess(guess, game.targetNumber);
  if (result === 'CORRECT') {
    game.status = 'COMPLETED';
  }

  const updateItemCommand = new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      id: { S: game.id }
    },
    UpdateExpression: 'SET attempts = :attempts, #s = :status',
    ConditionExpression: '#s = :inProgress',
    ExpressionAttributeNames: {
      '#s': 'status'
    },
    ExpressionAttributeValues: {
      ':attempts': { N: game.attempts.toString() },
      ':status': { S: game.status },
      ':inProgress': { S: 'IN_PROGRESS' }
    }
  });

  await dbClient.send(updateItemCommand);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: getResponseMessage(result) })
  };
}