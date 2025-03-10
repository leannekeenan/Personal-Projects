import { useState } from 'react';
import './index.css'; // Import the CSS file

/*Image values imported from assets.images folder*/
import KyuImage from './images/Kyu Osmodius Underwood Gailwind Higglsbee.png';
import AlchemicalSlime from './images/alchemical slime.png';
import BaylorQuick from './images/Baylor Quick v4.png';
import CarriLetters from'./images/Carri Letters v3.png';
import ScarlettLetters from'./images/Scarlett Letters v3.png';
import Jellusari from './images/Jellusari.png';
import PaigeTurnner from './images/Paige Turner v2.png';
import SquidWyrd from './images/Squid Wyrd.png';
import ApathianRelic from './images/Apathian Relic w background.png';
import RowanBlack from './images/Rowan Blalck.png';
import TessaJorne from './images/Tessa Jorne.png';
import KeldorStonefist from './images/Keldor Stonefist.png';
import LiaThornfield from './images/Lia Thornfield.png';
import JasperWren from './images/Jasper Wren.png';
import ValeriaQuickstep from './images/Valeria Quickstep II.png';
import RickOShea from "./images/Rick O'Shea.png";
import SewerHag from './images/Sewer Hag.png';
import Githzerai from './images/Githzerai.png';
import Myconid from './images/Myconid.png';



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
  { id: 16, name: "Rick O'Shea", image: RickOShea, title:"", description: "" },
  { id: 17, name: "Sewer Hag", image: SewerHag, title:"", description: "" },
  { id: 18, name: "Myconid", image: Myconid, title:"", description: "" },
  { id: 19, name: "Zhenk’tal, the Silent Sage", image: Githzerai, title:"Leader of the Unclaimed Lands", description: "Zhenk'tal is calm, composed, and reasoned, never seeking conflict but firmly capable of defending both themself and their people. They uses non-lethal methods to incapacitate or disarm enemies, often with their psychic powers rather than physical force. Zhenk’tal's telepathy and control over psychic energy allow them to subdue rather than kill, ensuring that anyone who challenges them will lose with minimal harm. Their legendary resistance and psionic defense abilities ensure that the party cannot easily defeat them through conventional means. Their telekinetic and psychic powers make them a formidable opponent that the party will realize quickly is far beyond their capabilities. Even in combat, Zhenk'tal avoids direct aggression, preferring to disable or disarm those who pose a threat, keeping the peace while ensuring the party understands that their role as protector and guide is not to be challenged lightly." },
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
