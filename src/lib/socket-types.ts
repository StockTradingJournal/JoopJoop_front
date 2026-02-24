export type ItemType = 'reroll' | 'peek' | 'reverse';

export type GamePhase =
  | 'lobby'
  | 'item_selection'
  | 'phase1_bidding'
  | 'phase2_playing'
  | 'game_over';

export interface PlayerItem {
  item: ItemType | null;
  used: boolean;
}

export interface PeekResult {
  requesterId: string;
  targetId: string;
  targetNickname: string;
  /** Phase 1: target's remaining coins */
  money?: number;
  /** Phase 2: target's real estate cards */
  realEstateCards?: number[];
}

export interface PlayerRanking {
  playerId: string;
  nickname: string;
  rank: number;
  estateValue: number;
  realEstateCards: number[];
  remainingCoins: number;
  finalScore: number;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  /** Own coins (shown only to self, -1 for others) */
  coins: number;
  currentBid: number;
  hasPassed: boolean;
  isCurrentTurn: boolean;
  /** Job cards won in Phase 1 (own only) */
  properties: number[];
  propertyCount: number;
  /** Real estate cards won in Phase 2 (own only) */
  realEstateCards: number[];
  realEstateCount: number;
  /** Phase 2: job card chosen for this round */
  selectedProperty: number | null;
  /** Phase 2: whether player has submitted a card */
  hasSelected: boolean;
}

export interface GameState {
  roomId: string;
  gameState: 'lobby' | 'playing';
  phase: GamePhase;
  players: Player[];
  /** Phase 1 job cards face-up on table */
  currentProperties: number[];
  /** Phase 2 real estate cards face-up on table */
  currentRealEstateCards: number[];
  currentBid: number;
  currentHighBidder: string | null;
  currentTurn: string | null;
  roundNumber: number;
  phase2RoundNumber: number;
  allPlayersSelected: boolean;
  /** Item info for all players */
  playerItems: Record<string, PlayerItem>;
  reverseUsedThisRound: boolean;
  turnDirection: number;
  mustBidPlayer: string | null;
  /** Unix timestamp when the current turn / phase-2 round started */
  turnStartTime: number;
  phase2StartTime: number;
  turnTimeout: number;
  phase2Timeout: number;
  /** Peek result — only present for the player who used peek */
  peekResult?: PeekResult | null;
  finalRankings?: PlayerRanking[];
}
