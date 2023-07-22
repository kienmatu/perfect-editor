export type WordDictionary = { [word: string]: number };
export type RegexMatch = { index: number; word: string };

export interface Result {
  message: string;
  from: number;
  to: number;
  fix?: Function;
}

export enum Status {
  IDLE = 'IDLE',
  STARTED = 'STARTED',
  RUNNING = 'RUNNING',
}
