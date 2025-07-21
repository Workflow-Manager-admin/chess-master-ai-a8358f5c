import React from 'react';

/**
 * GameControls component provides UI for starting/resetting game, color selection, game mode toggle, and settings.
 * @param {object} props - onNewGame, onReset, playerColor, onChangeColor, gameMode, onGameModeChange, aiEnabled
 */
// PUBLIC_INTERFACE
function GameControls({
  onNewGame,
  onReset,
  playerColor,
  onChangeColor,
  isPlaying,
  gameMode,           // "pvp" or "pvai"
  onGameModeChange,   // function(string)
  aiEnabled = false,
}) {
  return (
    <div className="game-controls-root">
      <button className="btn-accent" onClick={onNewGame} disabled={isPlaying}>New Game</button>
      
      {/* Game Mode Toggle */}
      {aiEnabled && (
        <div className="color-select-group" style={{ justifyContent: "center", marginBottom: 0 }}>
          <label className="color-btn" style={{ fontSize: "1em", padding: "0.16em 1em" }}>
            <input
              type="radio"
              checked={gameMode === "pvp"}
              onChange={() => onGameModeChange("pvp")}
              name="game-mode-bar"
              style={{ marginRight: "0.3em" }}
            />
            2 Players
          </label>
          <label className="color-btn" style={{ fontSize: "1em", padding: "0.16em 1em" }}>
            <input
              type="radio"
              checked={gameMode === "pvai"}
              onChange={() => onGameModeChange("pvai")}
              name="game-mode-bar"
              style={{ marginRight: "0.3em" }}
            />
            Play vs AI
          </label>
        </div>
      )}

      {/* Color Switcher (PvAI only) */}
      {aiEnabled && gameMode === "pvai" && (
        <div className="color-select-group" role="radiogroup" aria-label="Select your color">
          <label className={`color-btn ${playerColor === "white" ? "selected" : ""}`}>
            <input
              type="radio"
              value="white"
              checked={playerColor === 'white'}
              onChange={() => onChangeColor('white')}
              disabled={isPlaying}
            />
            Play as White
          </label>
          <label className={`color-btn ${playerColor === "black" ? "selected" : ""}`}>
            <input
              type="radio"
              value="black"
              checked={playerColor === 'black'}
              onChange={() => onChangeColor('black')}
              disabled={isPlaying}
            />
            Play as Black
          </label>
        </div>
      )}

      <button className="btn-secondary" onClick={onReset}>Reset Board</button>
    </div>
  );
}
export default GameControls;
