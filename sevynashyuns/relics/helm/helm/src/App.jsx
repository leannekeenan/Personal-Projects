import React, { useState, useEffect, useCallback, useMemo } from 'react';
// The external CSS import is removed and the content is placed in the <style> tag below for single-file environment requirements.
import './App.css';
const TARGET_WORD = ['L', 'U', 'S', 'T'];
const GRID_SIZE = 4;
const VICE_WORDS = [['V', 'I', 'C', 'E'], ['W', 'A', 'N', 'T']]; // Words that trigger immediate penalty

// --- START: Solvability Logic ---

const getInversions = (tiles) => {
  let inversions = 0;
  const actualTiles = tiles.filter(tile => tile !== 0); 
  
  for (let i = 0; i < actualTiles.length - 1; i++) {
    for (let j = i + 1; j < actualTiles.length; j++) {
      if (actualTiles[i] > actualTiles[j]) {
        inversions++;
      }
    }
  }
  return inversions;
};

// Helper function to create a solvable initial state by scrambling
const getInitialTiles = () => {
  let tiles = Array.from({ length: 15 }, (_, i) => i + 1); // Tiles 1 through 15
  tiles.push(0); // 0 represents the empty space

  let solvable = false;
  let scrambledTiles = [];

  while (!solvable) {
    scrambledTiles = Array.from(tiles);
    for (let i = scrambledTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambledTiles[i], scrambledTiles[j]] = [scrambledTiles[j], scrambledTiles[i]];
    }

    // Ensure the empty tile (0) is at the last position (index 15) for our simplified win condition
    const emptyIndex = scrambledTiles.indexOf(0);
    if (emptyIndex !== 15) {
      const temp = scrambledTiles[15];
      scrambledTiles[15] = 0;
      scrambledTiles[emptyIndex] = temp;
    }

    if (getInversions(scrambledTiles) % 2 === 0) {
      solvable = true;
    }
  }

  return scrambledTiles;
};

// --- END: Solvability Logic ---

// Maps tile number (1-15) to its letter label
const getTileLabel = (tileValue) => {
  // Tiles 1-4 are L, U, S, T
  if (tileValue >= 1 && tileValue <= 4) {
    return TARGET_WORD[tileValue - 1]; 
  }
  // Tiles 5-15 are the 11 OTHER_LETTERS
  // V, I, C, E, W, A, N, T, H, R, M
  const OTHER_LETTERS = ['V', 'I', 'C', 'E', 'W', 'A', 'N', 'T', 'H', 'R', 'M'];
  if (tileValue >= 5 && tileValue <= 15) {
      return OTHER_LETTERS[tileValue - 5]; 
  }
  return ' '; 
};

// Primary App Component
export default function App() {
  const [tiles, setTiles] = useState(getInitialTiles());
  const [moveCount, setMoveCount] = useState(0); 
  const [checkCount, setCheckCount] = useState(0); 
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [winningIndices, setWinningIndices] = useState([]);
  const [message, setMessage] = useState("Solve the Riddle: Arrange tiles into a 4-letter word (rows, columns, or diagonal accepted).");
  const [isFlashing, setIsFlashing] = useState(false); // For red penalty flash
  const [statusText, setStatusText] = useState('CURSE ACTIVE');

  // Helper function to find the index of the empty tile (0)
  const emptyIndex = useMemo(() => tiles.indexOf(0), [tiles]);

  // --- Core Game Flow Functions ---

  const handleImmediateLoss = useCallback((word) => {
    setIsFlashing(true);
    setStatusText('VICE TRIGGERED!');
    setMessage(`The helm recoils violently, fueled by ${word}! Visor Scrambled.`);
    
    // Scramble tiles and reset state after short flash
    setTimeout(() => {
        setTiles(getInitialTiles());
        setIsFlashing(false);
        setCheckCount(0);
        setMoveCount(0);
        setWinningIndices([]); // Reset winning indices
        setStatusText('CURSE ACTIVE');
        setMessage("Riddle Failed. Visor Scrambled. 5 New Checks Available.");
    }, 1000); 
  }, []);

  const handleWin = useCallback((indices) => {
    setIsDeactivated(true);
    setWinningIndices(indices); // STORE the specific winning indices
    setStatusText('DEACTIVATED');
    setMessage(`CURSE BROKEN! The Helm is Deactivated! L-U-S-T aligned!`);
  }, []);


  const initializeGame = useCallback(() => {
    setTiles(getInitialTiles());
    setMoveCount(0);
    setCheckCount(0);
    setIsDeactivated(false);
    setWinningIndices([]); // Reset winning indices
    setStatusText('CURSE ACTIVE');
    setMessage("Solve the Riddle: Arrange L-U-S-T in a line (row, col, or diag).");
    setIsFlashing(false);
  }, []);


  /**
   * Checks if a target word is spelled in a continuous line.
   * @returns {Array<number> | null} Array of 4 grid indices if word is found, otherwise null.
   */
  const checkLineForWord = (currentTiles, targetWord) => {
      // Map tile IDs to letters
      const currentLetters = currentTiles.map(tileId => getTileLabel(tileId));
      const targetString = targetWord.join('');

      // 1. Check Rows
      for (let r = 0; r < GRID_SIZE; r++) {
          const rowString = currentLetters.slice(r * GRID_SIZE, (r + 1) * GRID_SIZE).join('');
          const matchIndex = rowString.indexOf(targetString);
          if (matchIndex !== -1) {
              // Winning indices: grid_index = (row * GRID_SIZE) + (start_of_match + i)
              return Array.from({ length: 4 }, (_, i) => r * GRID_SIZE + matchIndex + i);
          }
      }

      // 2. Check Columns
      for (let c = 0; c < GRID_SIZE; c++) {
          let colLetters = [];
          let colIndices = [];
          for (let r = 0; r < GRID_SIZE; r++) {
              const index = r * GRID_SIZE + c;
              colLetters.push(currentLetters[index]);
              colIndices.push(index);
          }
          const colString = colLetters.join('');
          const matchIndex = colString.indexOf(targetString);
          if (matchIndex !== -1) {
              // Winning indices: Use the stored colIndices based on matchIndex
              return Array.from({ length: 4 }, (_, i) => colIndices[matchIndex + i]);
          }
      }

      // 3. Check Diagonals (fixed 4-letter sequence possible)
      
      // Top-Left to Bottom-Right Diagonal (Indices: 0, 5, 10, 15)
      let diag1Indices = [0, 5, 10, 15];
      let diag1Letters = diag1Indices.map(i => currentLetters[i]);
      if (diag1Letters.join('') === targetString) return diag1Indices;

      // Top-Right to Bottom-Left Diagonal (Indices: 3, 6, 9, 12)
      let diag2Indices = [3, 6, 9, 12];
      let diag2Letters = diag2Indices.map(i => currentLetters[i]);
      if (diag2Letters.join('') === targetString) return diag2Indices;

      return null; // Return null if no word found
  };

  // Logic run after every tile slide
  const checkWinOrLoss = useCallback((currentTiles) => {
      if (isDeactivated) return false;

      // Check for LUST win condition
      const lustIndices = checkLineForWord(currentTiles, TARGET_WORD);
      if (lustIndices) {
          handleWin(lustIndices); // Pass indices to handleWin
          return true;
      }

      // Check for immediate VICE/WANT loss penalty
      for (const vice of VICE_WORDS) {
          if (checkLineForWord(currentTiles, vice)) {
              handleImmediateLoss(vice.join(''));
              return true;
          }
      }
      return false;
  }, [isDeactivated, handleWin, handleImmediateLoss]);

  
  // Logic run on manual button press (The 5-Check Penalty)
  const runCalibrationCheck = useCallback(() => {
    if (isDeactivated || checkCount >= 5) return;

    // Check for win/loss one last time before penalty is applied
    if (checkWinOrLoss(tiles)) {
        return; 
    }

    let nextCheckCount = checkCount + 1;
    setCheckCount(nextCheckCount);

    if (nextCheckCount >= 5) {
        setIsFlashing(true);
        setStatusText('PENALTY!');
        setMessage(`Check Failed (${nextCheckCount}/5). The helm is angered by your slow pace! Scrambling Visor...`);
        // Penalty: scramble and reset checks
        setTimeout(() => {
            setTiles(getInitialTiles());
            setIsFlashing(false);
            setCheckCount(0);
            setStatusText('CURSE ACTIVE');
            setMessage("Riddle Failed. Visor Scrambled. 5 New Checks Available.");
            setMoveCount(0);
            setWinningIndices([]);
        }, 1000);
    } else {
      setMessage(`Calibration Check ${nextCheckCount}/5 complete. Keep sliding!`);
    }

  }, [tiles, checkCount, isDeactivated, checkWinOrLoss]);


  // Main interaction handler
  const handleTileClick = useCallback((index) => {
    if (isDeactivated || isFlashing || index === emptyIndex || checkCount >= 5) return;

    // Check if the clicked tile is adjacent to the empty space (0)
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    const isAdjacent = (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );

    if (isAdjacent) {
      // 1. Swap the tiles
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      // 2. Update Total Move Count
      setMoveCount(prev => prev + 1);
      
      // 3. Immediately check for a win or an immediate loss
      const winOrLossHandled = checkWinOrLoss(newTiles);

      // 4. Update message if not already a win/loss
      if (!winOrLossHandled && checkCount < 5) {
        setMessage("Tiles slid. Ready for manual Calibration Check.");
      }
    }
  }, [tiles, emptyIndex, isDeactivated, isFlashing, checkCount, checkWinOrLoss]);

  // Determine the overall grid border class based on game state
  const getGridBorderClass = () => {
      if (isFlashing) {
          return 'grid-border-flashing animate-pulse'; 
      }
      if (isDeactivated) {
          return 'grid-border-deactivated'; 
      }
      return 'grid-default-border'; 
  };

  // Determine the status message class
  const getMessageClass = () => {
    if (isDeactivated) {
        return 'status-message message-deactivated message-glow';
    }
    if (isFlashing) {
        return 'status-message message-flashing';
    }
    return 'status-message message-normal';
  };

  // Determine the status header class
  const getStatusHeaderClass = () => {
    if (isDeactivated) {
        return 'status-header-deactivated';
    }
    if (isFlashing) {
        return 'status-header-flashing';
    }
    return 'status-header-normal';
  }


  // Component to render a single tile
  const Tile = ({ value, index }) => {
    if (value === 0) {
      // Custom class for empty space
      return <div className="tile-empty"></div>; 
    }

    // Determine if this specific tile (by its grid index) is part of the solved LUST word
    const isPartOfSolvedLUST = useMemo(() => {
        return isDeactivated && winningIndices.includes(index); 
    }, [isDeactivated, winningIndices, index]);

    // Choose the base tile style
    let tileClass = isPartOfSolvedLUST ? 'tile-solved' : 'tile-default';
    
    // Determine disabled state
    const isDisabled = isDeactivated || checkCount >= 5 || isFlashing;
    const disabledClass = isDisabled ? 'tile-disabled' : 'tile-active';

    return (
      <button
        onClick={() => handleTileClick(index)}
        // COMBINED custom classes only
        className={`tile-button ${tileClass} ${disabledClass}`} 
        disabled={isDisabled}
      >
        <span className="tile-label">
          {getTileLabel(value)}
        </span>
      </button>
    );
  };

  return (
    <div className="app-container">
      {/* Load Tailwind CSS from CDN and include custom CSS for single-file operation */}
 

      {/* Content Wrapper uses custom class now */}
      <div className="content-wrapper">

        {/* Title and Helm Visual using custom classes */}
        <h1 className="font-title title-helm">
          Relic of Adoreon
        </h1>
        <p className="subtitle">
          Deactivation Puzzle
        </p>

        <p className="lore-description">
            This is the Helm of Adoreon, the source of the realm's creeping madness. It corrupts the wearer's sight with an obsessive hunger, rendering everything imperfect save for its object of <i>lust</i>. Your task is to purify its vision by solving the tile puzzle below. Find the right word to satiate the relics desire to deactivate its curse.
        </p>

        {/* Status Panel using custom class */}
        <div className="status-panel">
          <p className={`font-bold ${getStatusHeaderClass()}`}>
              Status: {statusText}
          </p>
          {/* Conditional message classes applied */}
          <p className={getMessageClass()}>
            {message}
          </p>
          {!isDeactivated && (
            <div className="stats-bar">
              <span>Checks Left: {5 - checkCount}</span>
              <span>Total Moves: {moveCount}</span>
            </div>
          )}
        </div>

        {/* Target Display using custom class */}


        {/* Manual Check Button using custom class */}
        {!isDeactivated && checkCount < 5 && !isFlashing && (
            <button
                onClick={runCalibrationCheck}
                className="button-primary"
            >
                Calibrate Visor (Check Guess)
            </button>
        )}

        {/* The 4x4 Puzzle Grid (The Visor) using custom class and state-dependent class */}
        <div className={`grid-container ${getGridBorderClass()}`}>
          {tiles.map((tile, index) => (
            <Tile key={index} value={tile} index={index} />
          ))}
        </div>

        {/* Restart Button using custom class */}
        {(isDeactivated || checkCount >= 5 || isFlashing) && (
            <button
                onClick={initializeGame}
                className="button-secondary"
            >
                {isDeactivated ? 'CONTINUE QUEST' : 'RESET CURSE'}
            </button>
        )}

      </div>
    </div>
  );
}
