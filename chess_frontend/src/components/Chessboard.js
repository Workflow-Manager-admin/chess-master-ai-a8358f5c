import React from 'react';

/**
 * Chessboard component displays the interactive chessboard, pieces, and animations.
 * @param {object} props - square states, piece positions, select and move handlers, last move highlight, selection, animating piece, and theme colors.
 */
 // PUBLIC_INTERFACE
function Chessboard({
  position,
  onSquareClick,
  selected,
  validMoves = [],
  lastMove = null,
  animatePiece = null,
  animationStyle = {},
  playerColor = 'white',
  colors,
}) {
  // Internal helpers for board orientation and labels
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  // Return reversed arrays if player is black (board flips)
  const boardFiles = playerColor === 'white' ? files : [...files].reverse();
  const boardRanks = playerColor === 'white' ? ranks : [...ranks].reverse();

  function isLightSquare(file, rank) {
    const fileIdx = files.indexOf(file);
    const rankIdx = ranks.indexOf(rank);
    return (fileIdx + rankIdx) % 2 === 1;
  }

  function getPieceImage(piece) {
    // Unicode chess symbols for modern minimal look (could be swapped for SVGs)
    const symbols = {
      K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
      k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
    };
    return symbols[piece] || null;
  }

  // Highlight helpers
  function isSelected(sq) {
    return selected === sq;
  }
  function isValidDest(sq) {
    return validMoves.includes(sq);
  }
  function isLastMoveSq(file, rank) {
    if (!lastMove) return false;
    return lastMove.from === `${file}${rank}` || lastMove.to === `${file}${rank}`;
  }

  return (
    <div className="chessboard-root" style={{ background: colors.primary, borderRadius: 16 }}>
      <div className="chessboard-grid">
        {boardRanks.map(rank =>
          boardFiles.map(file => {
            const sq = `${file}${rank}`;
            const piece = position[sq];
            const isLight = isLightSquare(file, rank);

            let className = 'chessboard-square';
            if (isLight) className += ' square-light';
            else className += ' square-dark';
            if (isSelected(sq)) className += ' square-selected';
            if (isValidDest(sq)) className += ' square-valid';
            if (isLastMoveSq(file, rank)) className += ' square-last-move';

            // Animation for last moved piece
            let pieceStyle = {};
            if (animatePiece && animatePiece.sq === sq) {
              pieceStyle = animationStyle;
            }

            return (
              <div
                className={className}
                key={sq}
                data-square={sq}
                onClick={() => onSquareClick(sq)}
                tabIndex={0}
                aria-label={piece ? `Square ${sq} with ${piece}` : `Empty square ${sq}`}
                style={{
                  background: isLight
                    ? colors.secondary
                    : colors.accent,
                  transition: 'background .12s'
                }}
              >
                {piece &&
                  <span className="chess-piece" style={pieceStyle}>
                    {getPieceImage(piece)}
                  </span>}
              </div>
            );
          })
        )}
      </div>
      {/* Board coordinates for accessibility */}
      <div className="chessboard-labels horizontal-labels">
        {boardFiles.map(file =>
          <span key={file}>{file}</span>
        )}
      </div>
      <div className="chessboard-labels vertical-labels">
        {boardRanks.map(rank =>
          <span key={rank}>{rank}</span>
        )}
      </div>
    </div>
  );
}

export default Chessboard;
