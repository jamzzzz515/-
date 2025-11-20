export enum ArcanaType {
  MAJOR = 'Major',
  MINOR = 'Minor'
}

export enum Suit {
  WANDS = '权杖',
  CUPS = '圣杯',
  SWORDS = '宝剑',
  PENTACLES = '星币',
  NONE = 'None' // For Major Arcana
}

export interface TarotCard {
  id: number;
  name: string;
  suit: Suit;
  arcana: ArcanaType;
  number: number; 
  description: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaning: string;
}

export interface DrawnCard extends TarotCard {
  isUpright: boolean;
  positionName: string; 
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  positions: string[]; 
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string; 
  accentColor: string;
  cardBackBg: string; 
  cardBackBorder: string; 
  cardBackPattern: string; 
  frontBg: string;
}

export type AppState = 
  | 'INTENTION' 
  | 'BREATHING' 
  | 'METHOD_SELECT' 
  | 'NUMBER_INPUT' 
  | 'REVEAL' 
  | 'READING'
  | 'LIBRARY';