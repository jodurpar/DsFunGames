import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Play, RefreshCw, Trash2, Trophy, AlertCircle,
    Hospital, School, Landmark, Clapperboard, ShoppingCart, Trees, Library, Dumbbell,
    Flame, Shield, PiggyBank, Coffee, Utensils, Castle, Factory, Warehouse, Church, Bed, Music,
    Bot, Flag, ChevronRight
} from 'lucide-react';
import { useRobotEngine, Direction } from '../hooks/useRobotEngine';

const BUILDING_ICONS: Record<string, any> = {
    'Hospital': Hospital,
    'School': School,
    'City Hall': Landmark,
    'Cinema': Clapperboard,
    'Market': ShoppingCart,
    'Park': Trees,
    'Library': Library,
    'Gym': Dumbbell,
    'Fire Station': Flame,
    'Police Station': Shield,
    'Bank': PiggyBank,
    'Coffee Shop': Coffee,
    'Restaurant': Utensils,
    'Museum': Castle,
    'Stadium': Trophy,
    'Factory': Factory,
    'Warehouse': Warehouse,
    'Church': Church,
    'Hotel': Bed,
    'Music Hall': Music,
    'Target': Flag
};

export default function LogicRobot() {
    const { state, actions } = useRobotEngine();
    const { grid, robotPos, targetPos, instructions, isExecuting, currentInstructionIndex, score, message, level } = state;
    const { addInstruction, removeInstruction, updateSteps, clearInstructions, runProgram, generateLevel, setLevel } = actions;

    const GRID_WIDTH = 10 + level;
    const GRID_HEIGHT = 10;
    // Calculate cell size dynamically to ensure it never exceeds container width (max ~720px) 
    // and naturally fits without vertical scrolling, capped at 48px to prevent gigantic cells.
    const cellSize = Math.min(48, Math.floor(720 / GRID_WIDTH));
    const BOARD_WIDTH = GRID_WIDTH * cellSize;
    const BOARD_HEIGHT = GRID_HEIGHT * cellSize;

    const getCellContent = (y: number, x: number) => {
        const isRobot = robotPos.x === x && robotPos.y === y;
        const cell = grid[y][x];
        if (!cell) return null;

        const Icon = cell.buildingType ? BUILDING_ICONS[cell.buildingType] : null;

        return (
            <div className="relative w-full h-full flex items-center justify-center">
                {Icon && (!cell.isLarge || cell.isAnchor) && (
                    <Icon
                        className={`transition-all pointer-events-none ${cell.type === 'TARGET' ? 'text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500'} ${cell.isLarge ? 'absolute left-2 top-2 z-[30]' : 'relative z-10'}`}
                        style={{
                            width: cell.isLarge ? (cellSize * 2 - 16) : (cellSize * 0.4),
                            height: cell.isLarge ? (cellSize * 2 - 16) : (cellSize * 0.4),
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                        }}
                    />
                )}
                {isRobot && (
                    <motion.div
                        layoutId="robot"
                        className="absolute z-10 rounded-full flex items-center justify-center transform-gpu"
                        style={{
                            width: cellSize * 0.7,
                            height: cellSize * 0.7,
                            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 40%, #94a3b8 100%)',
                            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.8), 0 8px 15px rgba(0,0,0,0.2)'
                        }}
                    >
                        {/* Eye visor */}
                        <div className="absolute top-[30%] w-[60%] h-[20%] bg-slate-900 rounded-full overflow-hidden flex items-center justify-center">
                            {/* Glowing eye */}
                            <div className="w-[30%] h-[60%] bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa] animate-pulse" />
                        </div>
                        {/* Highlights */}
                        <div className="absolute top-[10%] left-[20%] w-[30%] h-[20%] bg-white rounded-full blur-[1px] opacity-80" />
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 w-full mx-auto justify-center items-start pb-20">
            {/* Sidebar: Instructions */}
            <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-24 order-3 xl:order-1">
                <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-game-accent">
                        <div className="bg-game-accent/10 p-2 rounded-xl">
                            <Library className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-sm uppercase tracking-wider">Logic Guide</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
                            <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                                Program the tactical unit to reach the objective flag using logic tokens.
                            </p>
                        </div>

                        {[
                            { id: 1, title: 'Route Planning', desc: "Select direction tokens to add commands to the unit's local buffer." },
                            { id: 2, title: 'Distance Matrix', desc: 'Use adjustment controls to define movement steps for each instruction.' },
                            { id: 3, title: 'Collision Protocol', desc: 'Architectural obstacles trigger a command abort. Calculate paths carefully.' },
                            { id: 4, title: 'Deployment', desc: 'Execute the program. Success is achieved upon objective contact.' },
                        ].map(step => (
                            <div key={step.id} className="flex gap-4">
                                <div className="w-8 h-8 rounded-xl bg-game-accent/10 flex items-center justify-center text-xs font-black text-game-accent shrink-0">
                                    {step.id}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-game-text">{step.title}</h4>
                                    <p className="text-[12px] text-game-muted leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-game-border">
                        <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-game-accent" />
                            <span className="text-[11px] text-game-muted italic font-medium">Good luck, Commander!</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
                {/* Top Header Panel */}
                <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Score Matrix</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="font-black text-xl text-game-text">{score.won}</span>
                                </div>
                                <div className="w-[1px] h-6 bg-game-border" />
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <span className="font-black text-xl text-game-text">{score.lost}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Sector Depth</span>
                            <div className="flex gap-1.5">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setLevel(i)}
                                        disabled={isExecuting}
                                        className={`
                            w-7 h-7 text-[10px] font-black rounded-lg flex items-center justify-center transition-all
                            ${level === i
                                                ? 'bg-game-accent text-white shadow-accent'
                                                : 'bg-slate-50 text-game-muted border border-game-border hover:border-game-accent/30'}
                            disabled:opacity-30 active:scale-90
                        `}
                                    >
                                        {i}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={message}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="hidden sm:block"
                            >
                                <p className={`text-xs font-black uppercase tracking-widest ${message.includes('SUCCESS') ? 'text-emerald-600' : message.includes('FAILURE') ? 'text-red-600' : 'text-game-muted'}`}>
                                    {message || 'System Idle'}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                        <button
                            onClick={generateLevel}
                            disabled={isExecuting}
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-game-border text-game-muted active:rotate-180 duration-500"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Game Map */}
                <div className="w-full relative group p-1 bg-white rounded-[3rem] shadow-2xl border border-game-border flex-1 min-h-0 flex items-center justify-center">
                    <div className="relative bg-[#fcfdfe] rounded-[2.5rem] overflow-x-auto overflow-y-hidden custom-scrollbar p-4 max-w-full">
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-100 mx-auto w-max h-max"
                            style={{
                                backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)',
                                backgroundSize: `${cellSize}px ${cellSize}px`,
                                backgroundColor: '#fff'
                            }}
                        >
                            <div className="grid gap-1 p-3 sm:gap-[6px] sm:p-4 bg-slate-200/50 rounded-2xl shadow-inner" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, max-content)`, gridTemplateRows: `repeat(${GRID_HEIGHT}, max-content)` }}>
                                {grid.map((row, y) =>
                                    row.map((cell, x) => {
                                        // Determine rounded corners for path to look like a continuous channel
                                        let roundedClass = 'rounded-md sm:rounded-xl';
                                        if (cell.type === 'PATH' || cell.type === 'START' || cell.type === 'TARGET') {
                                            roundedClass = 'rounded-sm';
                                        }

                                        const isAnchor = cell.type === 'BUILDING' && cell.isLarge && cell.isAnchor;

                                        return (
                                            <div
                                                key={`${y}-${x}`}
                                                className={`
                                                transition-all duration-300 flex items-center justify-center relative ${roundedClass}
                                                ${isAnchor ? 'z-20' : 'z-10'}
                                                ${cell.type === 'PATH' ? 'bg-slate-300/80 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1),0_0_10px_rgba(255,255,255,0.8)] border border-slate-400/50' :
                                                        cell.type === 'TARGET' ? 'bg-emerald-100 shadow-[inset_0_4px_8px_rgba(16,185,129,0.1)] border border-emerald-300' :
                                                            cell.type === 'START' ? 'bg-blue-100 shadow-[inset_0_4px_8px_rgba(59,130,246,0.1)] border border-blue-300' :
                                                                'bg-emerald-50/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.02)] border border-emerald-100'}
                                            `}
                                                style={{ width: cellSize, height: cellSize }}
                                            >
                                                {getCellContent(y, x)}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Controller */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 order-2 xl:order-3">
                <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6 ">
                    <div className="flex items-center gap-3 text-slate-900">
                        <div className="bg-slate-100 p-2 rounded-xl">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-sm uppercase tracking-wider">Logic Controller</h3>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-game-muted uppercase tracking-widest">Available Operations</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {(['UP', 'DOWN', 'LEFT', 'RIGHT'] as Direction[]).map(dir => (
                                <button
                                    key={dir}
                                    onClick={() => addInstruction(dir)}
                                    disabled={isExecuting || instructions.length >= 14}
                                    className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 hover:bg-white border border-game-border hover:border-game-accent/50 hover:shadow-md rounded-2xl transition-all disabled:opacity-30 group"
                                >
                                    {dir === 'UP' && <ArrowUp className="w-4 h-4 text-slate-700 group-hover:text-game-accent transition-colors" />}
                                    {dir === 'DOWN' && <ArrowDown className="w-4 h-4 text-slate-700 group-hover:text-game-accent transition-colors" />}
                                    {dir === 'LEFT' && <ArrowLeft className="w-4 h-4 text-slate-700 group-hover:text-game-accent transition-colors" />}
                                    {dir === 'RIGHT' && <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-game-accent transition-colors" />}
                                    <span className="text-[9px] font-extrabold text-slate-400 group-hover:text-game-accent transition-colors">{dir.charAt(0)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-game-muted uppercase tracking-widest">Memory Buffer ({instructions.length}/14)</h4>
                            <button
                                onClick={clearInstructions}
                                disabled={isExecuting || instructions.length === 0}
                                className="text-[10px] text-red-500 hover:text-red-600 uppercase font-black tracking-wider disabled:opacity-30"
                            >
                                Flush
                            </button>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-3 border border-game-border min-h-[360px] relative">
                            <div className="grid grid-cols-2 gap-2 h-full content-start" style={{ gridTemplateRows: 'repeat(7, 44px)' }}>
                                <AnimatePresence mode="popLayout">
                                    {instructions.map((inst, index) => (
                                        <motion.div
                                            key={inst.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                backgroundColor: currentInstructionIndex === index ? '#f0f9ff' : '#ffffff'
                                            }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            style={{
                                                gridColumn: Math.floor(index / 7) + 1,
                                                gridRow: (index % 7) + 1
                                            }}
                                            className={`
                                        flex items-center justify-between h-11 px-2 rounded-xl border-2 transition-all overflow-hidden
                                        ${currentInstructionIndex === index ? 'border-game-accent shadow-md' : 'border-white shadow-sm hover:border-slate-100'}
                                    `}
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-slate-50 roundedmd text-[9px] font-black text-game-muted border border-slate-100">
                                                    {index + 1}
                                                </div>
                                                <div className="flex items-center gap-1 min-w-0">
                                                    {inst.direction === 'UP' && <ArrowUp className={`w-3.5 h-3.5 shrink-0 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                    {inst.direction === 'DOWN' && <ArrowDown className={`w-3.5 h-3.5 shrink-0 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                    {inst.direction === 'LEFT' && <ArrowLeft className={`w-3.5 h-3.5 shrink-0 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                    {inst.direction === 'RIGHT' && <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                    <span className={`text-[10px] font-black uppercase truncate ${currentInstructionIndex === index ? 'text-game-text' : 'text-slate-500'}`}>{inst.direction.substring(0, 1)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <div className="flex items-center gap-1 bg-slate-50 rounded-md px-1 py-0.5 border border-slate-100">
                                                    <button onClick={() => updateSteps(inst.id, -1)} disabled={isExecuting} className="text-slate-400 hover:text-game-text disabled:opacity-30 p-0.5"><ArrowDown className="w-2.5 h-2.5" /></button>
                                                    <span className="text-[10px] font-black text-game-text w-2 text-center">{inst.steps}</span>
                                                    <button onClick={() => updateSteps(inst.id, 1)} disabled={isExecuting} className="text-slate-400 hover:text-game-text disabled:opacity-30 p-0.5"><ArrowUp className="w-2.5 h-2.5" /></button>
                                                </div>

                                                <button onClick={() => removeInstruction(inst.id)} disabled={isExecuting} className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-colors disabled:opacity-30">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {instructions.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                                        <Bot className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Buffer Empty</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Add movement tokens to begin</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={runProgram}
                        disabled={isExecuting || instructions.length === 0}
                        className={`
                    premium-button w-full py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 transition-all shadow-xl text-sm uppercase tracking-widest
                    ${isExecuting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-game-accent hover:bg-game-accent-light text-white shadow-accent'}
                `}
                    >
                        {isExecuting ? (
                            <>
                                <div className="animate-spin"><RefreshCw className="w-4 h-4" /></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <div className="bg-white/20 p-2 rounded-xl"><Play className="w-4 h-4 fill-current" /></div>
                                Execute Program
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
