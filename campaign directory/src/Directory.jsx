import { useState } from 'react';
import './index.css'; // Import the CSS file


/*Image values imported from assets.images folder*/
import KyuImage from './images/Kyu Osmodius Underwood Gailwind Higglsbee.png';
import AlchemicalSlime from './images/alchemical slime.png';
import BaylorQuick from './images/Baylor Quick v4.png';
import CarriLetters from'./images/Carri Letters II.png';
import ScarlettLetters from'./images/Scarlett Letters III.png';
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
import RickOShea from "./images/Rick O'Shea II.png";
import SewerHag from './images/Sewer Hag.png';
import Githzerai from './images/Githzerai.png';
import Myconid from './images/Myconid.png';
import VinnyCrystals from './images/Vinny Crystals.png';
import Vespera from './images/Vespera III.png';
import Cray from './images/Cray.png';
import Bert from './images/Bert.png';




/*NPC Card Content*/
const npcData = [
  { id: 1, name: "Kyu Osmodius Underwood Gailwind Higglsbee", image: KyuImage, title:"Inventor / Team Quartermaster", description: ["Kyu is the party quartermaster and inventor. Kyu grew up among the resilient and fiercely proud artisans of Arrogan, a city-state where craftsmanship is revered as the highest form of expression. As a dwarf from Arrogan, Kyu's early life was rooted in tradition, working tirelessly to hone his skills in forging, building, and crafting. But Kyu’s curiosity extended beyond physical creation; he was drawn to the allure of knowledge itself, which led him to Adoreon’s archives. There, he became an Archivist, poring over volumes of texts, maps, and forgotten lore that deepened his knowledge of ancient mechanisms, arcane relics, and powerful artifacts. Years later, Kyu was recruited by the Apathian government to join an elite team as the quartermaster, overseeing supplies, logistics, and the equipment that would keep his party running. His background as an archivist gave him an edge, allowing him to recognize useful relics and their potential tactical applications, while his Arrogan roots made him a keen judge of quality and durability. Part-time inventor and skilled in retrofitting and improving equipment, Kyu tinkers with gear, adapting it for use in unexpected situations. His gruff humor and meticulous eye for detail make him both the party’s invaluable support and a stalwart ally, keeping them outfitted, informed, and always a step ahead in the field."]},
  { id: 2, name: "Alchemical Slime", image: AlchemicalSlime, title:"", description: "" },
  { id: 3, name: "Baylor Quick", image: BaylorQuick, title:"Pop Star", description: "" },
  { id: 4, name: "Carri Letters", image: CarriLetters, title:"", description: "Carri Letters is a seasoned messenger for the Apathian government, known for her sharp wit and unrivaled efficiency. She has spent years navigating the intricacies of Apathian bureaucracy, learning to thrive in the sluggish, politically charged environment where others might falter. Raised in Irateia, Carri grew up amid military pride and political unrest. What few know is that Carri was recruited as a teenager into I.R.I.S.—the Iratian Reconnaissance and Intelligence Syndicate—a covert order of spies embedded across Sevynashyuns to protect worlds interests from within. As a operative, she trained in intelligence gathering, infiltration, and coded communication. Her transition to the Apathian bureaucracy was not a demotion but a mission. Disguised as a humble courier, Carri quickly rose through the ranks, becoming invaluable for her impeccable memory, attention to detail, and unrivaled discretion. Her role made her privy to some of the most sensitive information exchanged between the city-states: political secrets, diplomatic threats, and intelligence that could reshape alliances. Her insight and connections now rival those of the highest-ranking officials." },
  { id: 5, name: "Scarlett Letters", image: ScarlettLetters, title:"", description: "Born in Irateia at the crossroads of might and mind, Scarlet embraced the strength, structure, and the honor of the Iratian military. Scarlet’s skills and ambition caught the attention of V.A.N.G.U.A.R.D., a secretive paramilitary group working under the guise of reformation. Convinced she was joining a noble cause to defend Irateia’s legacy, Scarlet enlisted, believing herself to be part of a necessary evolution for their nation. What she found instead was a darker truth: V.A.N.G.U.A.R.D. wasn’t protecting the Republic — it was planning to raze it and build a new empire in its place. Now framed for a treasonous act she didn’t commit, Scarlet is hunted by the government she once served. She fled across the sea to Indullia, forging a new life as a pirate captain — a rebel, a rogue, and a ghost. From her ship, she strikes at V.A.N.G.U.A.R.D. in secret, dismantling their plots and hoping, one day, to return home and clear her name." },
  { id: 6, name: "Jellusari", image: Jellusari, title:"", description: "" },
  { id: 7, name: "Paige Turner", image: PaigeTurnner, title:"", description: "Paige Turner grew up amid the vibrant intellectual circles of Adoreon, where their natural curiosity and affinity for the arcane led them to a position as an Arcane Research Assistant. In this role, Paige honed a meticulous approach to studying ancient spells and artifacts, often working late into the night, deciphering complex texts, and testing obscure incantations. Paige’s growing knowledge eventually attracted the attention of Apathian scholars, and they were offered a coveted position in Apathe as an Academic Librarian—an opportunity to broaden their horizons and delve even deeper into magical lore. Now in the heart of Apathian scholarship, Paige finds themselves surrounded by volumes of forbidden knowledge, lost magic, and forgotten histories. Their journey from Adoreon’s lively arcane labs to the quiet, candle-lit corners of Apathe’s restricted libraries has imbued them with both a love for magic and a quiet intensity. Paige’s warlock abilities, honed through years of study and practice, are often employed not in battle, but in pursuit of forgotten spells and the mysteries they’ve sworn to protect." },
  { id: 8, name: "Squid Wyrd", image: SquidWyrd, title:"", description: "" },
  { id: 9, name: "Apathian Relic", image: ApathianRelic, title:"Relic of Apathian Sloth", description:"a pocketwatch that glows faintly with arcane magic, leading those who tinker with it to take exaustion damage unless the riddle on the back is solved"},
  { id: 10, name: "Rowan Black", image: RowanBlack, title:"", description: "half elf with a quiet demeanor and an heir of superiority searching for his lost love. Hope the fame from winnig the Unity Festival will provide resources to help solve the mystery of their disappearance" },
  { id: 11, name: "Tessa Jorne", image: TessaJorne, title:"", description: "a young tiefling looking for adventure and on a quest to find a legendary artifact" },
  { id: 12, name: "Keldor Stonefist", image: KeldorStonefist, title:"", description: "a gruff dwarf with a heart of gold, seeking redemption after failing a mission in his hometown. He believes becoming the next hero of the nation will absolve him of his failures" },
  { id: 13, name: "Lia Thornfield", image: LiaThornfield, title:"", description: "A human looking for revenge for the death of a mentor. They believe one of the leaders of the factrions is responsible and is using the opportunity to become a hero to solve the mystery" },
  { id: 14, name: "Jasper Wren", image: JasperWren, title:"", description: "An affable and adventurous halfling searching for a lost treasure tied to their family" },
  { id: 15, name: "Valeria Quickstep", image: ValeriaQuickstep, title:"", description: "A quick witted, short tempered gnome fleeing from an aranged marriage hoping that winning a place as a hero of the nation will" },
  { id: 16, name: "Rick O'Shea", image: RickOShea, title:"", description: "Rick O’Shea grew up in the bustling trade district of Arrogan, where words could be as sharp as blades and deals were struck with a firm handshake—or a subtle sleight of hand. Raised among merchants, diplomats, and skilled laborers, Rick quickly learned that a well-placed word could open more doors than brute force. But he also knew that sometimes, a steady hand and quick reflexes were necessary to keep those doors from slamming shut. As a young dwarf, Rick honed his skills as both a negotiator and an enforcer, working as a bodyguard for traveling dignitaries and high-profile clients. His ability to disarm tensions—or just disarm opponents—earned him a reputation as a man who could talk his way out of anything or fight his way through it if needed. It wasn’t long before his talents caught the attention of Apathe’s security division, where he was recruited as a Security Liaison, ensuring that high-stakes meetings remained civil and that no one left with more holes than they arrived with. Rick is charming, fast-talking, and always five steps ahead of a conversation. He navigates bureaucracies with ease, but his street smarts and combat instincts keep him grounded. Whether he’s intercepting an assassin mid-strike, confiscating contraband with a knowing smirk, or appearing at just the right moment to save an old friend, Rick O’Shea is the kind of ally you want when things go south." },
  { id: 17, name: "Sewer Hag", image: SewerHag, title:"", description: "" },
  { id: 18, name: "Myconid", image: Myconid, title:"", description: "" },
  { id: 19, name: "Zhenk’tal, the Silent Sage", image: Githzerai, title:"Leader of the Unclaimed Lands", description: "Zhenk'tal is calm, composed, and reasoned, never seeking conflict but firmly capable of defending both themself and their people. They uses non-lethal methods to incapacitate or disarm enemies, often with their psychic powers rather than physical force. Zhenk’tal's telepathy and control over psychic energy allow them to subdue rather than kill, ensuring that anyone who challenges them will lose with minimal harm. Their legendary resistance and psionic defense abilities ensure that the party cannot easily defeat them through conventional means. Their telekinetic and psychic powers make them a formidable opponent that the party will realize quickly is far beyond their capabilities. Even in combat, Zhenk'tal avoids direct aggression, preferring to disable or disarm those who pose a threat, keeping the peace while ensuring the party understands that their role as protector and guide is not to be challenged lightly." },
  { id: 20, name: "Bert, The Bullheaded Brawler", image: Bert, title:"", description: "" },
  { id: 21, name: "Cray, The Shadowblade Slayer", image: Cray, title:"", description: "" },
  { id: 22, name: "Vinny 'The Stone' Crystals", image: VinnyCrystals, title:"", description: "" },
  { id: 23, name: "Vespera, The Crystal Weaver", image: Vespera, title:"", description: "" },
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
      <div className="character-container grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredNPCs.map((npc) => (
          <div key={npc.id} className="character border p-4 rounded shadow-md chatacter-container">
            <div className="content">
              
              <div className="character-image">
                <img src={npc.image} alt={npc.name} className="character-image w-full h-32 object-cover rounded" />
              </div>

              <div className='card-content'>
                <h2 className="character-name text-lg font-bold mt-2">{npc.name}</h2>
                <h3 className='character-title text-lg font-bold mt-2'>{npc.title}</h3>
                <p className="character-description text-sm text-gray-600">{npc.description}</p>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
