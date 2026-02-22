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
    const cellSize = 58;
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
                        className={`transition-all pointer-events-none ${cell.type === 'TARGET' ? 'text-green-400' : 'text-game-muted/30'} ${cell.isLarge ? 'absolute left-3 top-3 z-0' : ''}`}
                        style={{
                            width: cell.isLarge ? (cellSize * 2 - 24) : (cellSize * 0.4),
                            height: cell.isLarge ? (cellSize * 2 - 24) : (cellSize * 0.4)
                        }}
                    />
                )}
                {isRobot && (
                    <motion.div
                        layoutId="robot"
                        className="absolute z-10 bg-game-accent rounded-full shadow-lg shadow-game-accent/50 flex items-center justify-center"
                        style={{ width: cellSize * 0.7, height: cellSize * 0.7 }}
                    >
                        <Bot style={{ width: cellSize * 0.5, height: cellSize * 0.5 }} className="text-white" />
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
                <div className="w-full relative group p-1 bg-white rounded-[3rem] shadow-2xl border border-game-border">
                    <div className="relative bg-[#fcfdfe] rounded-[2.5rem] overflow-auto custom-scrollbar p-6 max-h-[70vh]">
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-100 mx-auto"
                            style={{
                                width: BOARD_WIDTH,
                                height: BOARD_HEIGHT,
                                backgroundImage: 'radial-gradient(circle, #f1f5f9 1px, transparent 1px)',
                                backgroundSize: '58px 58px',
                                backgroundColor: '#fff'
                            }}
                        >
                            <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`, gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)` }}>
                                {grid.map((row, y) =>
                                    row.map((cell, x) => (
                                        <div
                                            key={`${y}-${x}`}
                                            className={`
                                        transition-colors flex items-center justify-center
                                        ${cell.type === 'PATH' ? 'bg-slate-50/50 border border-slate-100/50' :
                                                    cell.type === 'TARGET' ? 'bg-emerald-50 border border-emerald-100' :
                                                        cell.type === 'START' ? 'bg-blue-50 border border-blue-100' :
                                                            cell.type === 'GRASS' ? 'bg-slate-200/10' :
                                                                'bg-transparent'}
                                    `}
                                            style={{ width: cellSize, height: cellSize }}
                                        >
                                            {getCellContent(y, x)}
                                        </div>
                                    ))
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

                        <div className="bg-slate-50/50 rounded-3xl p-3 border border-game-border min-h-[400px]">
                            <div className="flex flex-col gap-2">
                                <AnimatePresence mode="popLayout">
                                    {instructions.map((inst, index) => (
                                        <motion.div
                                            key={inst.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                backgroundColor: currentInstructionIndex === index ? '#f0f9ff' : '#ffffff'
                                            }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className={`
                                        flex items-center gap-3 h-12 px-3 rounded-2xl border-2 transition-all
                                        ${currentInstructionIndex === index ? 'border-game-accent shadow-md' : 'border-white shadow-sm hover:border-slate-100'}
                                    `}
                                        >
                                            <div className="w-6 h-6 shrink-0 flex items-center justify-center bg-slate-50 rounded-lg text-[10px] font-black text-game-muted border border-slate-100">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 flex items-center gap-3">
                                                {inst.direction === 'UP' && <ArrowUp className={`w-4 h-4 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                {inst.direction === 'DOWN' && <ArrowDown className={`w-4 h-4 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                {inst.direction === 'LEFT' && <ArrowLeft className={`w-4 h-4 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                {inst.direction === 'RIGHT' && <ArrowRight className={`w-4 h-4 ${currentInstructionIndex === index ? 'text-game-accent' : 'text-slate-400'}`} />}
                                                <span className={`text-xs font-black uppercase ${currentInstructionIndex === index ? 'text-game-text' : 'text-slate-500'}`}>{inst.direction}</span>
                                            </div>

                                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-2 py-1 border border-slate-100">
                                                <button onClick={() => updateSteps(inst.id, -1)} disabled={isExecuting} className="text-slate-400 hover:text-game-text disabled:opacity-30 p-0.5"><ArrowDown className="w-3 h-3" /></button>
                                                <span className="text-xs font-black text-game-text w-3 text-center">{inst.steps}</span>
                                                <button onClick={() => updateSteps(inst.id, 1)} disabled={isExecuting} className="text-slate-400 hover:text-game-text disabled:opacity-30 p-0.5"><ArrowUp className="w-3 h-3" /></button>
                                            </div>

                                            <button onClick={() => removeInstruction(inst.id)} disabled={isExecuting} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors disabled:opacity-30">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {instructions.length === 0 && (
                                    <div className="h-[360px] flex flex-col items-center justify-center text-center p-8">
                                        <Bot className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Buffer Empty</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Add movement tokens to begin programming</p>
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
