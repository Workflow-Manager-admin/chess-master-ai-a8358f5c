import React from 'react';

/**
 * MoveHistory component displays all moves made in the game.
 * @param {object} props - moves (array), onSelectMove (function), currentPointer (int)
 */
 // PUBLIC_INTERFACE
function MoveHistory({ moves = [], onSelectMove, currentPointer }) {
  return (
    <div className="move-history-root">
      <h2 className="history-title">Move History</h2>
      <ol className="move-history-list">
        {/* Moves in pairs */}
        {moves.map((move, idx) => (
          <li
            key={idx}
            className={
              'move-history-item' +
              (idx === currentPointer ? ' move-history-active' : '')
            }
            tabIndex={0}
            onClick={() => onSelectMove(idx)}
            aria-label={`Go to move ${idx + 1}: ${move.san}`}
          >
            <span className="move-number">{Math.floor(idx / 2) + 1}.</span>
            <span className="move-sides">
              {move.san}
              {move.comment && (
                <span className="move-comment">{move.comment}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
export default MoveHistory;
