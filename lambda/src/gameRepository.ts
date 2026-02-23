import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { Game, GameStatus } from "./apiTypes";

const dbClient = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const getGame = async (gameId: string): Promise<Game | null> => {
  const response = await dbClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: gameId } },
    })
  );

  if (!response.Item) return null;

  return {
    id: response.Item.id.S!,
    targetNumber: parseInt(response.Item.targetNumber.N!),
    attempts: parseInt(response.Item.attempts.N!),
    status: response.Item.status.S! as GameStatus,
    createdAt: new Date(response.Item.createdAt.S!),
  };
};

export const createGame = async (game: Game): Promise<void> => {
  await dbClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: game.id },
        targetNumber: { N: game.targetNumber.toString() },
        attempts: { N: game.attempts.toString() },
        status: { S: game.status },
        createdAt: { S: game.createdAt.toISOString() },
      },
    })
  );
};

export const updateGame = async (game: Game): Promise<void> => {
  await dbClient.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: game.id } },
      UpdateExpression: "SET attempts = :attempts, #s = :status",
      ConditionExpression: "#s = :inProgress",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":attempts": { N: game.attempts.toString() },
        ":status": { S: game.status },
        ":inProgress": { S: GameStatus.IN_PROGRESS },
      },
    })
  );
};

