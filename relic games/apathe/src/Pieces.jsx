import PropTypes from "prop-types";
import "./Pieces.css";

// Import images
import ImagineWhite from "./assets/images/imagine white.png";
import DesignWhite from "./assets/images/design white.png";
import CraftWhite from "./assets/images/craft white.png";
import BuildWhite from "./assets/images/build white.png";
import TestWhite from "./assets/images/test white.png";
import TuneWhite from "./assets/images/tune white.png";
import PolishWhite from "./assets/images/polish white.png";
import CompleteWhite from "./assets/images/finish white.png";

import ImagineBlack from "./assets/images/imagine black (1).png";
import DesignBlack from "./assets/images/design black.png";
import CraftBlack from "./assets/images/craft black.png";
import BuildBlack from "./assets/images/build black.png";
import TestBlack from "./assets/images/test black.png";
import TuneBlack from "./assets/images/tune black.png";
import PolishBlack from "./assets/images/polish black.png";
import CompleteBlack from "./assets/images/finish black.png";

// Define puzzle pieces
export const puzzlePieces = [
  { id: 3, whiteSrc: CraftWhite, blackSrc: CraftBlack, label: "Craft" },
  { id: 1, whiteSrc: ImagineWhite, blackSrc: ImagineBlack, label: "Imagine" },
  { id: 8, whiteSrc: CompleteWhite, blackSrc: CompleteBlack, label: "Complete" },
  { id: 2, whiteSrc: DesignWhite, blackSrc: DesignBlack, label: "Design" },
  { id: 5, whiteSrc: TestWhite, blackSrc: TestBlack, label: "Test" },
  { id: 7, whiteSrc: PolishWhite, blackSrc: PolishBlack, label: "Polish" },
  { id: 4, whiteSrc: BuildWhite, blackSrc: BuildBlack, label: "Build" },
  { id: 6, whiteSrc: TuneWhite, blackSrc: TuneBlack, label: "Tune" },
   
];

function Pieces({ onDragStart }) {
  return (
    <div className="pieces-container">
      {puzzlePieces.map(({ id, whiteSrc, label }) => (
        <div key={id} className="puzzle-piece-container">
          <img
            src={whiteSrc} // Initially set to white image
            alt={`Puzzle Piece ${id}`}
            className="puzzle-piece"
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData("pieceId", id);
              onDragStart(e, id);
            }}
          />
          <div className="tooltip">{label}</div>
        </div>
      ))}
    </div>
  );
}

Pieces.propTypes = {
  onDragStart: PropTypes.func.isRequired,
};

export default Pieces;
