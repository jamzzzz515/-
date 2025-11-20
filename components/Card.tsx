import React from 'react';
import { DrawnCard, Suit, Theme } from '../types';

interface CardProps {
  card: DrawnCard;
  isRevealed: boolean;
  onReveal: () => void;
  index: number;
  theme: Theme;
}

const Card: React.FC<CardProps> = ({ card, isRevealed, onReveal, index, theme }) => {
  // Staggered animation delay based on index
  const delay = index * 150; 

  const getSuitIcon = (suit: Suit) => {
    switch (suit) {
      case Suit.CUPS: return '🏆';
      case Suit.WANDS: return '🪄';
      case Suit.SWORDS: return '⚔️';
      case Suit.PENTACLES: return '🪙';
      default: return '🌟';
    }
  };

  // Theme-based styles
  const getPatternStyle = () => {
    if (theme.id === 'nature') {
      return 'bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-800 to-transparent opacity-40';
    }
    if (theme.id === 'mystic') {
      return 'bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-purple-900 via-fuchsia-900 to-transparent opacity-40';
    }
    // Classic
    return 'bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500 to-transparent opacity-20';
  };

  // Logic:
  // 'card-front' (0deg) = Card Back Pattern (Initial visible side)
  // 'card-back' (180deg) = Card Face Content (Hidden initially)
  
  return (
    <div 
      className={`relative w-32 h-52 sm:w-40 sm:h-64 md:w-48 md:h-72 cursor-pointer perspective-1000 ${isRevealed ? 'flipped' : ''} card mb-6`}
      onClick={onReveal}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-inner w-full h-full relative shadow-2xl rounded-xl">
        
        {/* PHYSICAL BACK (The pattern side, visible initially) */}
        <div className={`card-front absolute w-full h-full ${theme.cardBackBg} rounded-xl border-2 ${theme.cardBackBorder} flex items-center justify-center overflow-hidden`}>
            <div className={`absolute inset-0 ${getPatternStyle()}`}></div>
            
            {/* Decorative center */}
            <div className={`border-4 border-double ${theme.cardBackBorder.replace('border-2', '')} border-opacity-30 w-[85%] h-[90%] rounded-lg flex items-center justify-center`}>
                <span className="text-4xl opacity-50 animate-pulse">
                   {theme.id === 'nature' ? '🌿' : theme.id === 'mystic' ? '🌙' : '🔮'}
                </span>
            </div>
        </div>

        {/* PHYSICAL FRONT (The content side, hidden initially) */}
        <div className={`card-back absolute w-full h-full ${theme.frontBg} rounded-xl border-2 ${theme.cardBackBorder}`}>
            {/* Wrapper to handle Reverse/Upright rotation for content specifically */}
            <div className={`w-full h-full flex flex-col items-center justify-between p-3 ${card.isUpright ? '' : 'rotate-180'}`}>
                <div className={`text-xs uppercase tracking-widest text-${theme.accentColor}-500 w-full text-center border-b border-${theme.accentColor}-900/30 pb-1`}>
                   {card.number === 0 ? '0' : card.number}
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl sm:text-4xl mb-2 filter drop-shadow-lg">{getSuitIcon(card.suit)}</div>
                    <h3 className={`text-${theme.primaryColor}-100 font-bold tarot-font text-base sm:text-lg leading-tight`}>{card.name}</h3>
                    <p className={`text-${theme.primaryColor}-400 text-[10px] mt-1 uppercase tracking-wide`}>
                        {card.arcana === 'Major' ? '大阿卡纳' : card.suit}
                    </p>
                </div>

                <div className={`w-full pt-2 border-t border-${theme.accentColor}-900/30`}>
                    <p className="text-[10px] text-center text-slate-400 italic truncate">
                        {card.positionName}
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Card;