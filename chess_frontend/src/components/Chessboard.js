import React from 'react';

/**
 * Chessboard component displays the interactive chessboard, pieces, and animations.
 * Now supports outlined SVG chess pieces, thick border, and highlight style per reference.
 * @param {object} props - square states, piece positions, select and move handlers, last move highlight, selection, animating piece, theme colors, and highlightSquares.
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
  highlightSquares = [], // Array of squares (e.g., ["c1","f1","c8","f8"])
}) {
  // Board helpers
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  // Board orientation
  const boardFiles = playerColor === 'white' ? files : [...files].reverse();
  const boardRanks = playerColor === 'white' ? ranks : [...ranks].reverse();

  function isLightSquare(file, rank) {
    const fileIdx = files.indexOf(file);
    const rankIdx = ranks.indexOf(rank);
    return (fileIdx + rankIdx) % 2 === 1;
  }

  function isHighlight(sq) {
    return Array.isArray(highlightSquares) && highlightSquares.includes(sq);
  }

  // Returns "white" or "black" for piece
  function pieceColor(piece) {
    if (!piece) return null;
    return piece === piece.toUpperCase() ? 'white' : 'black';
  }

  // Original/custom chess icon rendering (Unicode or simple graphical icons)
  // This restores the easily recognizable original icons.
  function PieceIcon({ piece, className }) {
    // Standard Unicode chess symbols. (Feel free to swap with custom images if required.)
    if (!piece) return null;
    // White: uppercase, Black: lowercase.
    // Chess Unicode: ♔♕♖♗♘♙ (white), ♚♛♜♝♞♟ (black)
    const unicodes = {
      K: "♔",
      Q: "♕",
      R: "♖",
      B: "♗",
      N: "♘",
      P: "♙",
      k: "♚",
      q: "♛",
      r: "♜",
      b: "♝",
      n: "♞",
      p: "♟",
    };
    const char = unicodes[piece] || "?";
    return (
      <span
        className={`chess-piece-icon ${className || ""} ${pieceColor(piece)}`}
        aria-label={`chess ${piece}`}
        style={{
          userSelect: "none",
          display: "inline-block",
          fontFamily: "'Segoe UI Symbol', 'Arial Unicode MS', 'Noto Serif', serif",
          fontSize: "2em",
          lineHeight: 1.1,
        }}
      >
        {char}
      </span>
    );
  }

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
    <div
      className="chessboard-root"
      style={{
        background: "var(--board-border)",
        border: "3px solid var(--board-border)",
        borderRadius: 10,
        aspectRatio: "1/1",
        maxWidth: 600,
        minWidth: 320,
        margin: "0 auto",
        boxShadow: "0 3px 16px #3331"
      }}
      tabIndex={0}
    >
      <div className="chessboard-grid" style={{
        borderRadius: 5,
        overflow: "hidden",
        gridTemplateColumns: "repeat(8,1fr)",
        gridTemplateRows: "repeat(8,1fr)",
        border: "none",
        outline: "none"
      }}>
        {boardRanks.map(rank =>
          boardFiles.map(file => {
            const sq = `${file}${rank}`;
            const piece = position[sq];
            const isLight = isLightSquare(file, rank);

            let className = 'chessboard-square';
            let style = {
              background: isLight ? "var(--board-light)" : "var(--board-dark)"
            };

            // Red highlight for special highlighted squares
            if (isHighlight(sq)) {
              className += " square-highlight";
              style.background = "var(--highlight-red)";
            }
            // Selected (bubble border inside)
            if (isSelected(sq)) {
              className += " square-selected";
              style.boxShadow = "0 0 0 2px #d45a5a inset";
              style.background = "var(--highlight-red)";
            }
            // Valid destination cells (light grayish)
            if (isValidDest(sq)) {
              className += " square-valid";
              style.background =
                isHighlight(sq) ?
                "var(--highlight-red)" : "var(--highlight-gray)";
            }
            // Last move (thin border)
            if (isLastMoveSq(file, rank)) {
              className += " square-last-move";
              style.outline = "2px solid #43abceba";
              style.zIndex = 1;
            }

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
                  ...style,
                  transition: 'background .12s, box-shadow .12s'
                }}
              >
                {piece && (
                  <span className={`chess-piece ${pieceColor(piece)}`} style={pieceStyle}>
                    <PieceIcon piece={piece} />
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Chessboard;
