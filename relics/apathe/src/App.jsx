import './App.css';
import Pieces from './Pieces.jsx';
import Puzzle from './Puzzle.jsx';
import Timer from './Timer.jsx';
import Responses from './Responses.jsx';
import './index.css';

function App() {
  return (
    <div className="app-background">
      <h1>Apathe Relic Challenge</h1>
      <div className='aboutthegame'>
        <p>
          Solve the ancient pocketwatch’s design by placing 8 icons in their correct slots. Your mentor and the fate of the nation rest on your success. Use your wits and the hints available to you to restore balance to the watch and lift the curse.
        </p>
      </div>
      <Timer />
      <Pieces />
      <Puzzle />
      <Responses />
    </div>
  );
}

export default App;
