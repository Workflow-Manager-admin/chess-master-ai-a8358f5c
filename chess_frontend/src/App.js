import React, { useState, useEffect } from 'react';
import './App.css';
import Chessboard from './components/Chessboard';
import MoveHistory from './components/MoveHistory';
import GameControls from './components/GameControls';
import SettingsModal from './components/SettingsModal';
import {
  getStartPosition,
  makeMove,
  getLegalMoves,
  isWhitePiece,
  isBlackPiece,
  exportSANHistory,
  parseFEN,
  getFEN,
} from './utils/chessEngine';

// Import environment variables (for future AI backend URL/settings)
const AI_API_URL = process.env.REACT_APP_AI_API_URL;

/**
 * Chess Game main React application.
 * Features: board, player vs player, move validation, move history, minimal animation, responsive, color theme.
 */
// PUBLIC_INTERFACE
function App() {
  // Theme/color config
  const COLOR_PALETTE = {
    accent: '#b58863',
    primary: '#3a3a3a',
    secondary: '#f5f5dc',
  };

  const [theme] = useState('light'); // Hardcode theme, but could be extended

  // Game state
  const [gameState, setGameState] = useState(getStartPosition());
  const [history, setHistory] = useState([]);
  const [currentPointer, setCurrentPointer] = useState(-1);
  const [selected, setSelected] = useState(null);
  const [validSquares, setValidSquares] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [aiThinking, setAIThinking] = useState(false);
  // Keep the "playerColor" selector for UI, but all moves are now user driven
  const [playerColor, setPlayerColor] = useState('white');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Animation
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const [animationStyle, setAnimationStyle] = useState({});

  // FREEFORM PLAYER MOVE LOGIC: Always allow current turn's side to move, alternate after every valid move.
  // This disables AI/hints and bugged auto-moves, and never locks the UI.

  // Checks if the selected square contains a piece that is the current turn's color
  function isCurrentTurnPiece(sq) {
    const piece = gameState.board[sq];
    if (!piece) return false;
    if (gameState.turn === 'w' && isWhitePiece(piece)) return true;
    if (gameState.turn === 'b' && isBlackPiece(piece)) return true;
    return false;
  }

  // Main click handler: safe, free turn-by-turn piece selection and movement
  function handleSquareClick(sq) {
    if (aiThinking) return;

    const piece = gameState.board[sq];

    // If nothing is selected, select only pieces for the current turn
    if (!selected) {
      if (isCurrentTurnPiece(sq)) {
        setSelected(sq);
        setValidSquares(getLegalMoves(gameState, sq));
      }
      return;
    }

    // Deselect if clicking selected again
    if (selected === sq) {
      setSelected(null);
      setValidSquares([]);
      return;
    }

    // Try perform move
    const legals = getLegalMoves(gameState, selected);
    if (legals.includes(sq)) {
      setAnimatingPiece({ sq: selected, from: selected, to: sq });
      setAnimationStyle({
        animation: 'move-piece .3s ease',
      });
      setTimeout(() => {
        onMakeMove(selected, sq);
        setAnimatingPiece(null);
        setAnimationStyle({});
      }, 240);
      setSelected(null);
      setValidSquares([]);
      return;
    }

    // Clicking another own piece, switch selection
    if (isCurrentTurnPiece(sq)) {
      setSelected(sq);
      setValidSquares(getLegalMoves(gameState, sq));
      return;
    }

    // Invalid: clear selection
    setSelected(null);
    setValidSquares([]);
  }

  // Move handler - always allow legal move to be made, then alternate turn
  function onMakeMove(from, to) {
    const { newState, move } = makeMove(gameState, from, to);
    if (!move) return;
    let newHistory;
    if (currentPointer === history.length - 1) {
      newHistory = [...history, move];
    } else {
      newHistory = history.slice(0, currentPointer + 1).concat([move]);
    }
    setGameState(newState);
    setHistory(newHistory);
    setCurrentPointer(newHistory.length - 1);
    setLastMove({ from, to });
  }

  // Start new game (always white to move first, resets all state)
  function handleNewGame() {
    setPlayerColor('white'); // Always start with white on 'New Game'
    setGameState(getStartPosition());
    setHistory([]);
    setCurrentPointer(-1);
    setSelected(null);
    setValidSquares([]);
    setLastMove(null);
    setAIThinking(false);
  }
  // Reset keeps player color but resets board
  function handleReset() {
    setGameState(getStartPosition());
    setHistory([]);
    setCurrentPointer(-1);
    setSelected(null);
    setValidSquares([]);
    setLastMove(null);
    setAIThinking(false);
  }

  // Color switcher (always triggers new game—white starts)
  function handleChangeColor(color) {
    setPlayerColor(color);
    setGameState(getStartPosition());
    setHistory([]);
    setCurrentPointer(-1);
    setSelected(null);
    setValidSquares([]);
    setLastMove(null);
    setAIThinking(false);
  }

  // Move history time travel
  function handleSelectMove(idx) {
    let state = getStartPosition();
    for (let i = 0; i <= idx; ++i) {
      ({ newState: state } = makeMove(state, history[i].from, history[i].to));
    }
    setGameState(state);
    setCurrentPointer(idx);
    setSelected(null);
    setValidSquares([]);
    setLastMove(idx >= 0 ? { from: history[idx].from, to: history[idx].to } : null);
  }

  // CSS theme: inject variables for color palette
  useEffect(() => {
    document.body.style.setProperty('--color-accent', COLOR_PALETTE.accent);
    document.body.style.setProperty('--color-primary', COLOR_PALETTE.primary);
    document.body.style.setProperty('--color-secondary', COLOR_PALETTE.secondary);
  }, []);

  // Reference: highlight bishop squares as demo for red highlights
  const bishopSquares = ["c1", "f1", "c8", "f8"];

  return (
    <div className="App chess-app-root" data-theme={theme}>
      <main className="chess-page-main">
        <div className="chess-center-col">
          <h1 className="chess-title">Chess Game</h1>
          <Chessboard
            position={gameState.board}
            onSquareClick={handleSquareClick}
            selected={selected}
            validMoves={validSquares}
            lastMove={lastMove}
            animatePiece={animatingPiece}
            animationStyle={animationStyle}
            playerColor={playerColor}
            colors={COLOR_PALETTE}
            highlightSquares={bishopSquares}
          />
          <GameControls
            onNewGame={handleNewGame}
            onReset={handleReset}
            playerColor={playerColor}
            onChangeColor={handleChangeColor}
            isPlaying={
              !!(history.length && currentPointer === history.length - 1 && !aiThinking)
            }
          />
        </div>
        <aside className="chess-side-col">
          <MoveHistory
            moves={history}
            onSelectMove={handleSelectMove}
            currentPointer={currentPointer}
          />
          <button className="settings-btn" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
            <h3>Settings</h3>
            <p>
              <em>Minimal settings - future enhancements coming soon!</em>
            </p>
            <div>
              <strong>AI API URL:</strong>{" "}
              {AI_API_URL || <span style={{ color: 'gray' }}>Local AI</span>}
            </div>
          </SettingsModal>
          <footer className="chess-footer">
            <small>
              <span>Modern Chess App •&nbsp;</span>
              <a
                href="https://www.chess.com/learn-how-to-play-chess"
                rel="noopener noreferrer"
                target="_blank"
              >
                How to play
              </a>
            </small>
          </footer>
        </aside>
      </main>
    </div>
  );
}

export default App;
