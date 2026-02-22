import {
  DynamoDBClient,
  PutItemCommand
} from "@aws-sdk/client-dynamodb";
import { Game } from "./apiTypes";
import { v4 as uuidv4 } from 'uuid';

const dbClient = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const targetNumber = Math.floor(Math.random() * 100) + 1;

  const game: Game = {
    id: uuidv4(),
    targetNumber,
    attempts: 0,
    status: 'IN_PROGRESS',
    createdAt: new Date()
  };

  const putItemCommand = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      id: { S: game.id },
      targetNumber: { N: game.targetNumber.toString() },
      attempts: { N: game.attempts.toString() },
      status: { S: game.status },
      createdAt: { S: game.createdAt.toISOString() }
    }
  });

  await dbClient.send(putItemCommand);

  return {
    statusCode: 200,
    body: JSON.stringify({
      gameId: game.id,
      message: 'Game started! Make a guess between 1 and 100.'
    })
  };
};