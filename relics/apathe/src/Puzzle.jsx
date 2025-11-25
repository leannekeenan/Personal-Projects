import { useState } from "react";
import "./Puzzle.css";
import { puzzlePieces } from "./Pieces"; // Correctly import puzzle pieces
import Pieces from "./Pieces"; // Import Pieces component

function Puzzle() {
  const [placedPieces, setPlacedPieces] = useState({});

  // This will be called when a piece starts being dragged
  const onDragStart = (e, id) => {
    console.log("Starting drag for piece", id);
    e.dataTransfer.setData("pieceId", id); // Store pieceId to transfer
  };

  // Handle the drop of a piece in the puzzle slots
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("pieceId");

    console.log("Dropped pieceId", pieceId, "on target", targetId);

    if (!pieceId) return; // Prevent errors if pieceId is undefined

    const droppedPiece = puzzlePieces.find((piece) => piece.id === Number(pieceId));

    if (droppedPiece && parseInt(pieceId) === targetId && !placedPieces[targetId]) {
      setPlacedPieces((prev) => ({
        ...prev,
        [targetId]: droppedPiece.blackSrc, // Use black image when placed
      }));
    }
  };

  return (
    <div className="puzzle-container">
      <div className="puzzle-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
          <div
            key={id}
            className={`puzzle-slot ${placedPieces[id] ? "filled" : ""}`}
            onDragOver={(e) => e.preventDefault()} // Allow the drop
            onDrop={(e) => handleDrop(e, id)} // Handle the drop
          >
            {placedPieces[id] && (
              <img src={placedPieces[id]} alt={`Piece ${id}`} className="placed-piece" />
            )}
          </div>
        ))}
      </div>

      </div>
  );
}

export default Puzzle;
