import { useState } from 'react'


import './App.css';
import Pieces from'./Pieces.jsx';
import Puzzle from'./Puzzle.jsx';
import Timer from'./Timer.jsx';
import Responses from './Responses.jsx';

function App() {

  return (
    <>
      <Pieces/>
      <Puzzle/>
      <Timer/>
      <Responses/>
    </>
  )
}

export default App
