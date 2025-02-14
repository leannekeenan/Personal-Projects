import React from "react";
import PropTypes from "prop-types";
import "./Pieces.css";

const puzzlePieces = [
  { id: 1, src: "/images/piece1.png" },
  { id: 2, src: "/images/piece2.png" },
  { id: 3, src: "/images/piece3.png" },
  { id: 4, src: "/images/piece4.png" },
  { id: 5, src: "/images/piece5.png" },
  { id: 6, src: "/images/piece6.png" },
  { id: 7, src: "/images/piece7.png" },
];

function Pieces({ onDragStart }) {
  return (
    <div className="pieces-container">
      {puzzlePieces.map((piece) => (
        <img
          key={piece.id}
          src={piece.src}
          alt={`Puzzle Piece ${piece.id}`}
          className="puzzle-piece"
          draggable="true"
          onDragStart={(e) => {
            e.dataTransfer.setData("pieceId", piece.id);
            onDragStart(e, piece.id); // Call the parent function here
          }}
        />
      ))}
    </div>
  );
}

Pieces.propTypes = {
  onDragStart: PropTypes.func.isRequired,
};

export default Pieces;
