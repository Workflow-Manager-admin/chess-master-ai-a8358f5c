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

  // Modern SVG piece: outlined with color fill
  function ModernPieceSVG({ piece, className }) {
    // SVG minimalist icon, solid fill + black outline (stroke)
    // Only supports standard chess symbols
    if (!piece) return null;
    const color = pieceColor(piece);
    const stroke = 'var(--piece-stroke)';
    const outline = color === 'white' ? '#fff' : 'var(--piece-black)';
    // By piece type
    // SVGs below: basic forms for modern/minimal chess icons for demo
    const svgProps = {
      width: "38", height: "38", viewBox: "0 0 45 45",
      className, style: { display: "block" }
    };
    const strokeWidth = 2;
    const pieces = {
      K: (
        <svg {...svgProps}><g>
          <circle cx="22.5" cy="22.5" r="16" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <rect x="20" y="13" width="5" height="13" rx="2" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <line x1="22.5" y1="7" x2="22.5" y2="19" stroke={stroke} strokeWidth={strokeWidth+0.8}/>
        </g></svg>
      ),
      Q: (
        <svg {...svgProps}><g>
          <ellipse cx="22.5" cy="22.5" rx="15" ry="14" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <circle cx="16" cy="13" r="2.1" fill={stroke} stroke={outline} strokeWidth="1"/>
          <circle cx="22.5" cy="10.7" r="2.1" fill={stroke} stroke={outline} strokeWidth="1"/>
          <circle cx="29" cy="13" r="2.1" fill={stroke} stroke={outline} strokeWidth="1"/>
        </g></svg>
      ),
      R: (
        <svg {...svgProps}><g>
          <rect x="10" y="14" width="25" height="18" rx="5" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <rect x="6" y="30" width="33" height="7" rx="2.4" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
        </g></svg>
      ),
      B: (
        <svg {...svgProps}><g>
          <ellipse cx="22.5" cy="20" rx="9" ry="13" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <circle cx="22.5" cy="12" r="2.7" fill={stroke}/>
        </g></svg>
      ),
      N: (
        <svg {...svgProps}><g>
          <path d="M13,35 Q20,16 34,35" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <ellipse cx="18" cy="23" rx="3" ry="3.7" fill={stroke}/>
        </g></svg>
      ),
      P: (
        <svg {...svgProps}><g>
          <circle cx="22.5" cy="16.8" r="6.1" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
          <rect x="16" y="23" width="13" height="11" rx="5" fill={outline} stroke={stroke} strokeWidth={strokeWidth}/>
        </g></svg>
      ),
    };
    // Map black = lowercase, white = uppercase
    const type = piece.toUpperCase();
    // If color is black, fill white with #222, else #fff
    if (color === "black") {
      // Paint all fills #fff as --piece-black instead
      return React.cloneElement(pieces[type], {}, React.Children.map(pieces[type].props.children, child => {
        if (!child) return child;
        return React.cloneElement(child, {
          fill: child.props.fill === "#fff" || child.props.fill === outline ? "var(--piece-black)" : child.props.fill,
          stroke: child.props.stroke || stroke,
        });
      }));
    }
    return pieces[type];
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
                {piece &&
                  <span className={`chess-piece piece-svg ${pieceColor(piece)}`} style={pieceStyle}>
                    <ModernPieceSVG piece={piece} />
                  </span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Chessboard;
