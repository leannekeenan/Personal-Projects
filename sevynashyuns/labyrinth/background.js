let forest = document.getElementById('dungeon1');
let castle = document.getElementById('dungeon2');
let mountain = document.getElementById('dungeon3');
let skyFortress = document.getElementById('dungeon4');
let planes = document.getElementById('dungeon5');
let swamp = document.getElementById('dungeon6');
let underground = document.getElementById('dungeon7');
let kingdomEntry = document.getElementById('dungeon8');


let backgroundMenu = document.getElementById('backgroundMenu');

forest.addEventListener('click', dungeonBackground1)
castle.addEventListener('click', dungeonBackground2)
mountain.addEventListener('click', dungeonBackground3)
skyFortress.addEventListener('click', dungeonBackground4)
planes.addEventListener('click', dungeonBackground5)
swamp.addEventListener('click', dungeonBackground6)
underground.addEventListener('click', dungeonBackground7)
kingdomEntry.addEventListener('click', dungeonBackground8)

backgroundMenu.addEventListener('change', select)

function dungeonBackground1() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop X.png')";
    document.body.style.color = 'white'

}

function dungeonBackground2() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop II.png')";
    document.body.style.color = 'white'
}

function dungeonBackground3() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop III.png')";
    document.body.style.color = 'white';
}

function dungeonBackground4() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop IV.png')";
    document.body.style.color = 'white';
}

function dungeonBackground5() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop V.png')";
    document.body.style.color = 'white'
}

function dungeonBackground6() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop VI.png')";
    document.body.style.color = 'white'
}

function dungeonBackground7() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop VII.png')";
    document.body.style.color = 'white'
}

function dungeonBackground8() {
    document.body.style.backgroundImage = "url('/labyrinth/images/dungeons/backdrop I.png')";
    document.body.style.color = 'white'
}

function select() {
    let option = backgroundMenu.value;

    switch(option) {
        case 'dungeon1': dungeonBackground1();
        break;
        case 'dungeon2': dungeonBackground2();
        break;
        case 'dungeon3':dungeonBackground3();
        break;
        case 'dungeon4': dungeonBackground4();
        break;
        case 'dungeon5': dungeonBackground5();
        break;
        case 'dungeon6': dungeonBackground6();
        break;
        case 'dungeon7': dungeonBackground7();
        break;
        default : dungeonBackground8()
    }
}

select()