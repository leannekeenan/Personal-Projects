import React, { useState } from 'react';
import './Puzzle.css'
function Puzzle() {
  const [placedPieces, setPlacedPieces] = useState({});

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("pieceId");  // Get the dragged piece's ID

    console.log("Dropped pieceId", pieceId, "on target", targetId);

    if (parseInt(pieceId) === targetId && !placedPieces[targetId]) {  // Place the piece if correct
      setPlacedPieces(prev => ({ ...prev, [targetId]: true }));
    }
  };

  return (
    <div className="puzzle-container">
      <h2>Puzzle Board</h2>
      <div className="puzzle-grid">
        {[1, 2, 3, 4, 5, 6, 7].map((id) => (
          <div
            key={id}
            className={`puzzle-slot ${placedPieces[id] ? 'filled' : ''}`}
            onDragOver={(e) => e.preventDefault()}  // Allow the drop by preventing default behavior
            onDrop={(e) => handleDrop(e, id)}  // Handle drop event
          >
            {placedPieces[id] && (
              <img src={`/images/piece${id}.png`} alt={`Piece ${id}`} className="placed-piece" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Puzzle;
