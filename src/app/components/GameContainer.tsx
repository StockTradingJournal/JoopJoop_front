import { GameState, PeekResult, LastPassEvent, RoundResult } from '../../lib/socket-types';
import { Phase1Screen } from './Phase1Screen';
import { Phase2Screen } from './Phase2Screen';

interface GameContainerProps {
  gameState: GameState;
  currentPlayerId: string;
  activePeek: PeekResult | null;
  activePassEvent: LastPassEvent | null;
  activeRoundResult: RoundResult | null;
  onBid: (amount: number) => void;
  onPass: () => void;
  onPlayCard: (cardId: number) => void;
  onUseItemReroll: () => void;
  onUseItemPeek: (targetId: string) => void;
  onUseItemReverse: () => void;
}

export function GameContainer({
  gameState,
  currentPlayerId,
  activePeek,
  activePassEvent,
  activeRoundResult,
  onBid,
  onPass,
  onPlayCard,
  onUseItemReroll,
  onUseItemPeek,
  onUseItemReverse,
}: GameContainerProps) {
  if (gameState.phase === 'phase2_playing') {
    return (
      <Phase2Screen
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        activePeek={activePeek}
        onPlayCard={onPlayCard}
        onUseItemReroll={onUseItemReroll}
        onUseItemPeek={onUseItemPeek}
      />
    );
  }

  return (
    <Phase1Screen
      gameState={gameState}
      currentPlayerId={currentPlayerId}
      activePeek={activePeek}
      activePassEvent={activePassEvent}
      activeRoundResult={activeRoundResult}
      onBid={onBid}
      onPass={onPass}
      onUseItemReroll={onUseItemReroll}
      onUseItemPeek={onUseItemPeek}
      onUseItemReverse={onUseItemReverse}
    />
  );
}
