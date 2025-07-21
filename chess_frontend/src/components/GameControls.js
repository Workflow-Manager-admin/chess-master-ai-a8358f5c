import React from 'react';

/**
 * GameControls component provides UI for starting/resetting game, color selection, and settings.
 * @param {object} props - onNewGame, onReset, playerColor, onChangeColor
 */
 // PUBLIC_INTERFACE
function GameControls({ onNewGame, onReset, playerColor, onChangeColor, isPlaying }) {
  return (
    <div className="game-controls-root">
      <button className="btn-accent" onClick={onNewGame} disabled={isPlaying}>New Game</button>
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
      <button className="btn-secondary" onClick={onReset}>Reset Board</button>
    </div>
  );
}
export default GameControls;
