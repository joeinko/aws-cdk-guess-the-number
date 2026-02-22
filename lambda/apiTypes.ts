export interface Game {
  id: string;
  targetNumber: number;
  attempts: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
}