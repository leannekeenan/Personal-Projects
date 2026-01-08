import './App.css'
import Directory from './Directory.jsx'

import crestImage from './assets/images/sevynashyuns crest.png';

function App() {

  return (
    <>
    <div className="imageContainer">
      <img className='logo' src= {crestImage} alt="" />
    </div>
    
    <h1>Sevynashyuns Directory</h1>
    
    <div className='text-container'>
      <p>
        This reference tool is an essential resource for both players and Dungeon Masters to keep track of the myriad of NPCs and key elements within the world of Sevynashyuns. Whether you&apos;re seeking information on important characters, discovering new locations, learning about powerful factions, or exploring various store types, this tool helps you navigate through it all. Simply use the search bar to type in character names, places, factions, or even types of stores, and filter through the data cards below to uncover detailed insights and expand your understanding of the world.
      </p>
    </div> 
     
    <Directory/>
    </>
  )
}

export default App
