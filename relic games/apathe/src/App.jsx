import './App.css';
import Pieces from './Pieces.jsx';
import Puzzle from './Puzzle.jsx';
import Timer from './Timer.jsx';
import Responses from './Responses.jsx';
import './index.css';

function App() {
  return (
    <div className="app-background">
      <Timer />
      <Pieces />
      <Puzzle />
      <Responses />
    </div>
  );
}

export default App;
