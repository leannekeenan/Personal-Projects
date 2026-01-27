import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

import snakeBiteIcon from './assets/GameIconsSnakeBite.png';

// --- Constants ---
const SOLUTION = "ENVY";
const RING_SIZE = 8;
const RING_ANGLE_STEP = 360 / RING_SIZE;

const RINGS_LETTERS = [
    ['E', 'F', 'H', 'M', 'Y', 'R', 'M', 'E'],
    ['N', 'E', 'A', 'U', 'V', 'A', 'R', 'T']
];

const SPELL_MAP = {
    "FEAR": { name: "FEAR", effect: "A wave of irrational terror washes over the target, inducing the **Fear** condition for one round." },
    "HARM": { name: "HARM", effect: "The target is hit with 1d6 bludgeoning damage, suffering the **Stunned** condition for one round." },
    "MUTE": { name: "MUTE", effect: "The target's voice is stolen, inflicting the **Silenced** condition (cannot cast verbal spells)." },
};

const HIGHLIGHT_COLORS = ['#FFD700', '#50C878']; // Gold, Emerald Green
const LETTER_PLATE_BASE_COLOR = '#222';

// --- Utility Functions ---
const getInitialRotation = () => Math.floor(Math.random() * RING_SIZE);

const calculateCurrentWord = (rotations) => {
    if (rotations.length !== 2) return "----";

    const r0_north = rotations[0] % RING_SIZE;
    const r0_south = (rotations[0] + 4) % RING_SIZE;
    const r1_north = rotations[1] % RING_SIZE;
    const r1_south = (rotations[1] + 4) % RING_SIZE;

    return RINGS_LETTERS[0][r0_north] +
           RINGS_LETTERS[1][r1_north] +
           RINGS_LETTERS[1][r1_south] +
           RINGS_LETTERS[0][r0_south];
};

const getInitialRotationsNotSolution = () => {
    let rotations;
    let word;
    do {
        rotations = [getInitialRotation(), getInitialRotation()];
        word = calculateCurrentWord(rotations);
    } while (word === SOLUTION || SPELL_MAP[word]);
    return rotations;
};

const getAngleFromCenter = (x0, y0, x1, y1) => {
    const angle = Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);
    return (angle + 90 + 360) % 360;
};

// --- Main Component ---
function App() {
    const [rotations, setRotations] = useState(getInitialRotationsNotSolution());
    const [isSnapping, setIsSnapping] = useState([false, false]);
    const [currentWord, setCurrentWord] = useState('');
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);
    const [statusMessage, setStatusMessage] = useState("The Serpent's Envy Coil. Drag a ring to attempt disarming the curse.");
    const [spellEffect, setSpellEffect] = useState(null);

    const pendantRef = useRef(null);
    const dragStateRef = useRef({
        isDragging: false,
        ringIndex: -1,
        startStep: 0,
        hasRotated: false,
    });

    const handleReset = () => {
        const newRotations = getInitialRotationsNotSolution();
        setRotations(newRotations);
        setIsSolved(false);
        setMoves(0);
        setSpellEffect(null);
        setIsSnapping([false, false]);
        setStatusMessage("Pendant reset. Continue the attempt to disarm the curse.");
    };

    useEffect(() => {
        const word = calculateCurrentWord(rotations);
        setCurrentWord(word);

        if (isSolved) return;

        if (word === SOLUTION) {
            setIsSolved(true);
            setSpellEffect(null);
            setStatusMessage(`✅ **SUCCESS! ENVY IS QUELLED!** The Serpent's Envy Coil hums with arcane energy.`);
            return;
        }

        if (SPELL_MAP[word]) {
            const spell = SPELL_MAP[word];
            setSpellEffect(spell);
            setStatusMessage(`🚨 **MALICE ACTIVATED!** Word **${word}** dialed! The curse triggers: **${spell.name}**. ${spell.effect}`);
            return;
        }

        if (!spellEffect) {
            setStatusMessage(`Use the dials to spell out the solution to disarm the curse. Be careful: spelling any words that are not the correct solution will result in harmful effects!`);
        }
    }, [rotations, isSolved]);

    const handleDrag = useCallback((event) => {
        event.preventDefault();
        if (!dragStateRef.current.isDragging || isSolved || spellEffect) return;

        const { ringIndex, startStep } = dragStateRef.current;
        const clientX = event.clientX || (event.touches?.[0]?.clientX ?? null);
        const clientY = event.clientY || (event.touches?.[0]?.clientY ?? null);
        if (clientX === null || !pendantRef.current) return;

        const rect = pendantRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const currentAngle = getAngleFromCenter(centerX, centerY, clientX, clientY);
        const startAngle = getAngleFromCenter(centerX, centerY, rect.width / 2, rect.top);

        let displacementAngle = (currentAngle - startAngle + 360) % 360;
        let newStep = (startStep - Math.round(displacementAngle / RING_ANGLE_STEP)) % RING_SIZE;
        if (newStep < 0) newStep += RING_SIZE;

        if (newStep !== rotations[ringIndex]) {
            setRotations(prev => {
                const updated = [...prev];
                updated[ringIndex] = newStep;
                return updated;
            });
            dragStateRef.current.hasRotated = true;
        }
    }, [rotations, isSolved, spellEffect]);

    const stopDrag = useCallback(() => {
        if (!dragStateRef.current.isDragging) return;

        const ringIndex = dragStateRef.current.ringIndex;

        if (dragStateRef.current.hasRotated) {
            setMoves(m => m + 1);

            setIsSnapping(prev => {
                const updated = [...prev];
                updated[ringIndex] = true;
                return updated;
            });

            setIsSnapping(prev => {
                const updated = [...prev];
                updated[ringIndex] = false;
                return updated;
            });
        }

        dragStateRef.current = {
            isDragging: false,
            ringIndex: -1,
            startStep: 0,
            hasRotated: false,
        };

        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', handleDrag);
        window.removeEventListener('touchend', stopDrag);
        window.removeEventListener('touchcancel', stopDrag);
    }, [handleDrag]);

    const startDrag = (e, ringIndex) => {
        if (isSolved || spellEffect) return;
        e.preventDefault();

        dragStateRef.current = {
            isDragging: true,
            ringIndex,
            startStep: rotations[ringIndex],
            hasRotated: false,
        };

        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchmove', handleDrag, { passive: false });
        window.addEventListener('touchend', stopDrag);
        window.addEventListener('touchcancel', stopDrag);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', handleDrag);
            window.removeEventListener('touchend', stopDrag);
            window.removeEventListener('touchcancel', stopDrag);
        };
    }, [handleDrag, stopDrag]);

    const RingDisplay = ({ letters, rotation, ringIndex, startDragHandler, isCurrentlySnapping }) => {
        const sizeFactors = [1.0, 0.60];
        const diameter = 100 * sizeFactors[ringIndex];
        const radius = diameter / 2;
        const letterSize = 30 - ringIndex * 5;
        const activeIndices = [0, 4];
        const radiusFactor = ringIndex === 0 ? 0.80 : 0.90;

        return (
            <div
                className={`ring-display ${isCurrentlySnapping ? 'snapping' : ''} ${dragStateRef.current.isDragging && dragStateRef.current.ringIndex === ringIndex ? 'is-dragging' : ''}`}
                style={{
                    width: `${diameter}%`,
                    height: `${diameter}%`,
                    transform: `translate(-50%, -50%) rotate(${-rotation * RING_ANGLE_STEP}deg)`,
                    zIndex: 10 + ringIndex,
                    border: `2px solid ${HIGHLIGHT_COLORS[ringIndex]}`,
                }}
                onMouseDown={(e) => startDragHandler(e, ringIndex)}
                onTouchStart={(e) => startDragHandler(e, ringIndex)}
            >
                {letters.map((letter, index) => {
                    const angle = index * RING_ANGLE_STEP;
                    const angleRad = (angle - 90) * (Math.PI / 180);
                    const x = 50 + radius * Math.cos(angleRad) * radiusFactor;
                    const y = 50 + radius * Math.sin(angleRad) * radiusFactor;
                    const rotationOffset = (index - rotation + RING_SIZE) % RING_SIZE;
                    const isSelected = activeIndices.includes(rotationOffset);

                    return (
                        <div
                            key={index}
                            className="ring-letter-container"
                            style={{
                                fontSize: `${letterSize}px`,
                                left: `${x}%`,
                                top: `${y}%`,
                                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                            }}
                        >
                            <span className='letter-plate'> 
                             {letter}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const WordReadout = ({ word, isSolved, spellEffect }) => {
        const backgroundColor = isSolved ? '#047857' : spellEffect ? '#7f1d1d' : '#111827';
        const textColor = isSolved ? '#a7f3d0' : spellEffect ? '#fecaca' : '#fff';
        const boxShadowStyle = isSolved
            ? '0 0 15px #a7f3d0'
            : spellEffect
            ? '0 0 15px #f87171'
            : '0 0 8px rgba(0,0,0,0.8) inset';

        return (
            <div className="word-readout-row">
                {word.split('').map((letter, index) => {
                    const borderColor = isSolved || spellEffect
                        ? (isSolved ? '#a7f3d0' : '#f87171')
                        : (index === 0 || index === word.length - 1)
                        ? HIGHLIGHT_COLORS[0]
                        : HIGHLIGHT_COLORS[1];

                    return (
                        <div
                            key={index}
                            className={`letter-box ${isSolved ? 'solved' : ''} ${spellEffect ? 'spell-effect' : ''}`}
                            style={{
                                backgroundColor,
                                borderColor,
                                color: textColor,
                                boxShadow: boxShadowStyle,
                            }}
                        >
                            {letter}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="app-container">
            <div className="header-section">
                <h1 className="main-title">The Relic of Coveton</h1>
                <p className="subtitle">Deactivation Challenge</p>
            </div>

            <p className="lore-description">
            This is the Pendant of Coveton, it allows the wearer to channel their corrosive envy outward, subtly manipulating the careers and fortunes of others. By focusing their bitter desires onto a target, the wearer can influence the delicate threads of chance, causing ascensions to power or ruinous downfalls with a mere thought. The ring cipher below acts as the Pendant's focusing mechanism, its "dial of destiny." Your task is to align the dial's rings to name the ancient source of this curse to stop its influence and halt the torrent of manipulated fate.
        </p>



            <div className="relic-panel">
                

                <div ref={pendantRef} className="hanami-pendant-frame">
                    

                    <RingDisplay
                        letters={RINGS_LETTERS[0]}
                        rotation={rotations[0]}
                        ringIndex={0}
                        startDragHandler={startDrag}
                        isCurrentlySnapping={isSnapping[0]}
                    />
                    <RingDisplay
                        letters={RINGS_LETTERS[1]}
                        rotation={rotations[1]}
                        ringIndex={1}
                        startDragHandler={startDrag}
                        isCurrentlySnapping={isSnapping[1]}
                    />

                    <div className="central-core" />
                </div>

                <WordReadout word={currentWord} isSolved={isSolved} spellEffect={spellEffect} />

                <div className="status-box">
                    <p className={`status-message ${isSolved ? 'success' : spellEffect ? 'error' : 'normal'}`}>
                        {statusMessage}
                    </p>
                </div>

                <div className="control-buttons">
                    <button onClick={handleReset} className="interactive-button">Reset Pendant</button>
                    {spellEffect && (
                        <button onClick={() => setSpellEffect(null)} className="interactive-button">Dismiss Spell Effect</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;