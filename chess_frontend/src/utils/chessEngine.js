/*
PUBLIC_INTERFACE
Minimal chess engine in JS: board state, move making, move legality, and simple random AI
*/

const fenStart =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function parseFEN(fen) {
  // Convert FEN to board object
  const [placement, turn, castling, ep, halfmove, fullmove] = fen.split(' ');
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const board = {};
  let row = 0, col = 0;
  for (let char of placement) {
    if (char === '/') {
      row++;
      col = 0;
    } else if (char >= '1' && char <= '8') {
      col += Number(char);
    } else {
      board[files[col] + ranks[row]] = char;
      col++;
    }
  }
  return { board, turn, castling, ep, halfmove, fullmove };
}

function getFEN({ board, turn, castling, ep, halfmove, fullmove }) {
  // Convert board object to FEN
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  let placement = '';
  for (let r = 0; r < ranks.length; r++) {
    let empty = 0;
    for (let f = 0; f < files.length; f++) {
      const sq = files[f] + ranks[r];
      if (board[sq]) {
        if (empty) {
          placement += empty;
          empty = 0;
        }
        placement += board[sq];
      } else {
        empty++;
      }
    }
    if (empty) placement += empty;
    if (r < ranks.length - 1) placement += '/';
  }
  return `${placement} ${turn} ${castling} ${ep} ${halfmove} ${fullmove}`;
}

// PUBLIC_INTERFACE
// Always start with white to move, default castling rights
function getStartPosition() {
  return parseFEN(fenStart);
}

// PUBLIC_INTERFACE
function isWhitePiece(piece) {
  return !!piece && piece === piece.toUpperCase();
}
// PUBLIC_INTERFACE
function isBlackPiece(piece) {
  return !!piece && piece === piece.toLowerCase();
}

// PUBLIC_INTERFACE
function getOppositeColor(color) {
  return color === 'w' ? 'b' : 'w';
}

// Generate all legal moves naive (pseudo-legal, handles most rules)
const PIECE_OFFSETS = {
  p: [
    [0, 1],
    [1, 1],
    [-1, 1],
    [0, 2],
  ],
  n: [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ],
  b: [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ],
  r: [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ],
  q: [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ],
  k: [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ],
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

// Convert (file,rank) to indices and vice versa
function idxToSq(fIdx, rIdx) {
  if (fIdx < 0 || fIdx > 7 || rIdx < 0 || rIdx > 7) return null;
  return files[fIdx] + ranks[rIdx];
}
function sqToIdx(sq) {
  const fIdx = files.indexOf(sq[0]);
  const rIdx = ranks.indexOf(Number(sq[1]));
  return [fIdx, rIdx];
}

// PUBLIC_INTERFACE
function getLegalMoves(state, from) {
  // Returns a list of squares player can move the selected piece to.
  const { board, turn, castling, ep } = state;
  const piece = board[from];
  if (!piece) return [];
  const isWhite = isWhitePiece(piece);
  if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) return [];

  const [fIdx, rIdx] = sqToIdx(from);
  const moves = [];

  if (piece.toLowerCase() === 'p') {
    // Pawn moves
    const dir = isWhite ? -1 : 1;
    // Single step
    const oneSq = idxToSq(fIdx, rIdx + dir);
    if (oneSq && !board[oneSq]) {
      moves.push(oneSq);
      // Double step
      const rankStart = isWhite ? 2 : 7;
      if (Number(from[1]) === rankStart) {
        const twoSq = idxToSq(fIdx, rIdx + 2 * dir);
        if (twoSq && !board[twoSq]) moves.push(twoSq);
      }
    }
    // Captures
    [-1, 1].forEach(dF => {
      const capSq = idxToSq(fIdx + dF, rIdx + dir);
      if (
        capSq &&
        board[capSq] &&
        (isWhite ? isBlackPiece(board[capSq]) : isWhitePiece(board[capSq]))
      )
        moves.push(capSq);
    });
    // En passant
    if (ep && ep !== '-') {
      if (
        Math.abs(files.indexOf(ep[0]) - fIdx) === 1 &&
        Number(ep[1]) === Number(from[1]) + dir
      ) {
        moves.push(ep);
      }
    }
  } else if (['n', 'b', 'r', 'q', 'k'].includes(piece.toLowerCase())) {
    const directions = PIECE_OFFSETS[piece.toLowerCase()];
    for (const dir of directions) {
      let n = 1;
      while (true) {
        const dest = idxToSq(fIdx + dir[0] * n, rIdx + dir[1] * n);
        if (!dest) break;
        if (!board[dest]) {
          moves.push(dest);
        } else {
          if (isWhite !== isWhitePiece(board[dest])) {
            moves.push(dest);
          }
          break;
        }
        if (piece.toLowerCase() === 'n' || piece.toLowerCase() === 'k') break;
        n++;
      }
    }
    // Castling for king
    if (piece.toLowerCase() === 'k') {
      if (isWhite && turn === 'w') {
        if (castling.includes('K')) {
          if (
            !board['f1'] &&
            !board['g1'] &&
            !isAttacked(board, 'e1', false) &&
            !isAttacked(board, 'f1', false) &&
            !isAttacked(board, 'g1', false)
          ) {
            moves.push('g1');
          }
        }
        if (castling.includes('Q')) {
          if (
            !board['d1'] &&
            !board['c1'] &&
            !board['b1'] &&
            !isAttacked(board, 'e1', false) &&
            !isAttacked(board, 'd1', false) &&
            !isAttacked(board, 'c1', false)
          ) {
            moves.push('c1');
          }
        }
      }
      if (!isWhite && turn === 'b') {
        if (castling.includes('k')) {
          if (
            !board['f8'] &&
            !board['g8'] &&
            !isAttacked(board, 'e8', true) &&
            !isAttacked(board, 'f8', true) &&
            !isAttacked(board, 'g8', true)
          ) {
            moves.push('g8');
          }
        }
        if (castling.includes('q')) {
          if (
            !board['d8'] &&
            !board['c8'] &&
            !board['b8'] &&
            !isAttacked(board, 'e8', true) &&
            !isAttacked(board, 'd8', true) &&
            !isAttacked(board, 'c8', true)
          ) {
            moves.push('c8');
          }
        }
      }
    }
  }
  // Only keep moves that do not leave king in check (basic drop-in)
  // For speed in simple demo, skip; could be implemented for robust
  return moves;
}

// Quick king attacked detector (for castling logic)
function isAttacked(board, sq, forBlack) {
  // For minimal demo, always false; robust version would check all opp moves
  // left as always false for this code.
  return false;
}

// PUBLIC_INTERFACE
function makeMove(state, from, to) {
  // Returns new state after move, with move structure.
  const { board, turn, castling, ep, halfmove, fullmove } = state;
  if (!board[from]) {
    return { newState: state, move: null, error: 'No piece to move' };
  }
  const legalMoves = getLegalMoves(state, from);
  if (!legalMoves.includes(to)) {
    return { newState: state, move: null, error: 'Illegal move' };
  }
  // Make shallow copy
  const newBoard = { ...board };
  const movingPiece = newBoard[from];
  const captured = newBoard[to] || null;
  newBoard[to] = movingPiece;
  delete newBoard[from];

  // Pawn promotion, castling, en passant, etc. (abbreviated)
  let san = movingPiece.toUpperCase();
  if (captured) san += 'x';
  san += to;
  let nextEp = '-';
  let nextCastling = castling;
  let nextHalf = halfmove;
  let nextFull = fullmove;

  // Halfmove/Fullmove
  if (movingPiece.toLowerCase() === 'p' || captured) {
    nextHalf = 0;
  } else {
    nextHalf = Number(halfmove) + 1;
  }
  if (turn === 'b') nextFull = Number(fullmove) + 1;

  // Turn
  const newTurn = getOppositeColor(turn);

  // Return move summary
  const move = {
    from,
    to,
    piece: movingPiece,
    san,
    captured,
  };
  const newState = {
    board: newBoard,
    turn: newTurn,
    castling: nextCastling,
    ep: nextEp,
    halfmove: nextHalf,
    fullmove: nextFull,
  };
  return { newState, move, error: null };
}

// PUBLIC_INTERFACE
function getAllLegalMoves(state) {
  // Returns array of all [from, to] for player's turn
  const res = [];
  Object.keys(state.board).forEach(sq => {
    const moves = getLegalMoves(state, sq);
    moves.forEach(toSq => {
      res.push({ from: sq, to: toSq });
    });
  });
  return res;
}

// PUBLIC_INTERFACE
function makeAIMove(state) {
  // Simple AI: Choose random legal move for side-to-move
  const moves = getAllLegalMoves(state);
  if (!moves.length) return { newState: state, move: null, error: 'No moves' };
  const idx = Math.floor(Math.random() * moves.length);
  const selectedMove = moves[idx];
  return makeMove(state, selectedMove.from, selectedMove.to);
}

// PUBLIC_INTERFACE
function exportSANHistory(moveList) {
  // Returns quick PGN-ish history string
  let out = "";
  for(let i=0; i<moveList.length; ++i) {
    if(i % 2 === 0) out += ((i/2)+1) + ". ";
    out += moveList[i].san + " ";
  }
  return out.trim();
}

export {
  getStartPosition,
  makeMove,
  getLegalMoves,
  getAllLegalMoves,
  isWhitePiece,
  isBlackPiece,
  makeAIMove,
  exportSANHistory,
  parseFEN,
  getFEN
};
