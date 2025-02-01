import { useState } from 'react';
import './index.css'; // Import the CSS file


import KyuImage from './assets/images/Kyu Osmodius Underwood Gailwind Higglsbee.png';

const npcData = [
  { id: 1, name: "Kyu Osmodius Underwood Gailwind Higglsbee", image: KyuImage, title:"Inventor / Team Quartermaster", description: "" },
  { id: 2, name: "", image: "", title:"", description: "" },
  { id: 3, name: "", image: "", title:"", description: "" },
  { id: 4, name: "", image: "", title:"", description: "" },
  { id: 5, name: "", image: "", title:"", description: "" },
  { id: 6, name: "", image: "", title:"", description: "" },
  { id: 7, name: "", image: "", title:"", description: "" },
  { id: 8, name: "", image: "", title:"", description: "" },
  { id: 9, name: "", image: "", title:"", description: "" }
];

export default function NPCDirectory() {
  const [search, setSearch] = useState("");

  const filteredNPCs = npcData.filter((npc) =>
    npc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-2xl mx-auto search-bar-container">
      <input
        type="text"
        placeholder="Search NPCs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredNPCs.map((npc) => (
          <div key={npc.id} className="border p-4 rounded shadow-md chatacter-container">
            <img src={npc.image} alt={npc.name} className="w-full h-32 object-cover rounded" />
            <div>
              <h2 className="text-lg font-bold mt-2">{npc.name}</h2>
              <h3 className='text-lg font-bold mt-2'>{npc.title}</h3>
              <p className="text-sm text-gray-600">{npc.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
