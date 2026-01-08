import { useState } from 'react';
import './index.css'; // Import the CSS file

/*Image values imported from assets.images folder*/
import KyuImage from './assets/images/Kyu Osmodius Underwood Gailwind Higglsbee.png';
import AlchemicalSlime from './assets/images/alchemical slime.png';
import BaylorQuick from './assets/images/Baylor Quick v4.png';
import CarriLetters from'./assets/images/Carri Letters v3.png';
import ScarlettLetters from'./assets/images/Scarlett Letters v3.png';
import Jellusari from './assets/images/Jellusari.png';
import PaigeTurnner from './assets/images/Paige Turner v2.png';
import SquidWyrd from './assets/images/Squid Wyrd.png';
import ApathianRelic from './assets/images/Apathian Relic w background.png';
import RowanBlack from './assets/images/Rowan Blalck.png';
import TessaJorne from './assets/images/Tessa Jorne.png';
import KeldorStonefist from './assets/images/Keldor Stonefist.png';
import LiaThornfield from './assets/images/Lia Thornfield.png';
import JasperWren from './assets/images/Jasper Wren.png';
import ValeriaQuickstep from './assets/images/Valeria Quickstep II.png';
import Equinorite from './assets/images/EquinoriteII.png'


/*NPC Card Content*/
const npcData = [
  { id: 1, name: "Kyu Osmodius Underwood Gailwind Higglsbee", image: KyuImage, title:"Inventor / Team Quartermaster", description: ["Kyu is the party quartermaster and inventor"] },
  { id: 2, name: "Alchemical Slime", image: AlchemicalSlime, title:"", description: "" },
  { id: 3, name: "Baylor Quick", image: BaylorQuick, title:"Pop Star", description: "" },
  { id: 4, name: "Carri Letters", image: CarriLetters, title:"", description: "" },
  { id: 5, name: "Scarlett Letters", image: ScarlettLetters, title:"", description: "" },
  { id: 6, name: "Jellusari", image: Jellusari, title:"", description: "" },
  { id: 7, name: "Paige Turner", image: PaigeTurnner, title:"", description: "" },
  { id: 8, name: "Squid Wyrd", image: SquidWyrd, title:"", description: "" },
  { id: 9, name: "Apathian Relic", image: ApathianRelic, title:"Relic of Apathian Sloth", description:"a pocketwatch that glows faintly with arcane magic, leading those who tinker with it to take exaustion damage unless the riddle on the back is solved"},
  { id: 10, name: "Rowan Black", image: RowanBlack, title:"", description: "half elf with a quiet demeanor and an heir of superiority searching for his lost love. Hope the fame from winnig the Unity Festival will provide resources to help solve the mystery of their disappearance" },
  { id: 11, name: "Tessa Jorne", image: TessaJorne, title:"", description: "a young tiefling looking for adventure and on a quest to find a legendary artifact" },
  { id: 12, name: "Keldor Stonefist", image: KeldorStonefist, title:"", description: "a gruff dwarf with a heart of gold, seeking redemption after failing a mission in his hometown. He believes becoming the next hero of the nation will absolve him of his failures" },
  { id: 13, name: "Lia Thornfield", image: LiaThornfield, title:"", description: "A human looking for revenge for the death of a mentor. They believe one of the leaders of the factrions is responsible and is using the opportunity to become a hero to solve the mystery" },
  { id: 14, name: "Jasper Wren", image: JasperWren, title:"", description: "An affable and adventurous halfling searching for a lost treasure tied to their family" },
  { id: 15, name: "Valeria Quickstep", image: ValeriaQuickstep, title:"", description: "A quick witted, short tempered gnome fleeing from an aranged marriage hoping that winning a place as a hero of the nation will" },
  { id: 16, name: "Equinorite", image: Equinorite, title:"", description:""},
];

/*NPC rendering functionality*/
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
            <div className='card-content'>
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
