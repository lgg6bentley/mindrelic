'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Game Data: Crypto Trivia Questions (25 Questions) ---
const ALL_QUESTIONS = [
    {
        q: "What is the smallest unit of Bitcoin, named after its creator?",
        options: ["Finney", "Wei", "Satoshi", "Gwei"],
        a: "Satoshi"
    },
    {
        q: "In what year was the Bitcoin whitepaper published?",
        options: ["2007", "2008", "2009", "2010"],
        a: "2008"
    },
    {
        q: "Who is the pseudonymous creator of Bitcoin?",
        options: ["Hal Finney", "Nick Szabo", "Vitalik Buterin", "Satoshi Nakamoto"],
        a: "Satoshi Nakamoto"
    },
    {
        q: "What does NFT stand for?",
        options: ["Non-Fiat Token", "Networked Financial Trust", "Non-Fungible Token", "New Financial Trend"],
        a: "Non-Fungible Token"
    },
    {
        q: "What is Ethereum's native cryptocurrency called?",
        options: ["Ethereum Classic", "Ether", "Solana", "Cardano"],
        a: "Ether"
    },
    {
        q: "What is the term for the computational process of creating new Bitcoin blocks?",
        options: ["Staking", "Burning", "Mining", "Yield Farming"],
        a: "Mining"
    },
    {
        q: "What consensus mechanism did Ethereum switch to in 2022?",
        options: ["Proof-of-Work (PoW)", "Delegated PoS", "Proof-of-Authority", "Proof-of-Stake (PoS)"],
        a: "Proof-of-Stake (PoS)"
    },
    {
        q: "Which cryptocurrency is often nicknamed 'Digital Silver'?",
        options: ["Ripple (XRP)", "Litecoin (LTC)", "Dogecoin (DOGE)", "Monero (XMR)"],
        a: "Litecoin (LTC)"
    },
    {
        q: "What is a 'gas fee' used for on the Ethereum network?",
        options: ["Paying for mining equipment", "Transaction execution and computation", "Buying new tokens", "Wallet storage fees"],
        a: "Transaction execution and computation"
    },
    {
        q: "What is the maximum supply of Bitcoin?",
        options: ["Unlimited", "100 Million", "21 Million", "42 Million"],
        a: "21 Million"
    },
    {
        q: "Decentralized applications built on blockchain are commonly referred to as:",
        options: ["DNCs", "DLTs", "DApps", "DEXs"],
        a: "DApps"
    },
    {
        q: "What term describes a sudden, sharp drop in cryptocurrency prices?",
        options: ["Liquidation", "Correction", "Rekt", "Pump"],
        a: "Correction"
    },
    {
        q: "What cryptographic concept is fundamental to blockchain security and immutability?",
        options: ["Public Key", "Hashing", "Smart Contract", "Tokenization"],
        a: "Hashing"
    },
    {
        q: "A wallet that requires a constant internet connection is known as a:",
        options: ["Cold Wallet", "Hardware Wallet", "Hot Wallet", "Paper Wallet"],
        a: "Hot Wallet"
    },
    {
        q: "What does DAO stand for?",
        options: ["Digital Asset Organization", "Decentralized Autonomous Organization", "Distributed Account Operator", "Data Access Oracle"],
        a: "Decentralized Autonomous Organization"
    },
    {
        q: "What is 'HODL' an acronym or term for in the crypto community?",
        options: ["High Output Data Layer", "Holding On for Dear Life", "Hashing Our Digital Ledger", "Hybrid Open Distributed Limit"],
        a: "Holding On for Dear Life"
    },
    {
        q: "What does the term 'fork' typically refer to in blockchain technology?",
        options: ["A simple network upgrade", "A complete transfer of assets", "A protocol change or a split in the blockchain", "A token burning event"],
        a: "A protocol change or a split in the blockchain"
    },
    {
        q: "What is KYC short for in crypto exchanges?",
        options: ["Key Your Crypto", "Know Your Customer", "Keeping Your Capital", "Keep Yield Coming"],
        a: "Know Your Customer"
    },
    {
        q: "What is the process of deliberately removing tokens from circulation, often to reduce supply?",
        options: ["Airdrop", "Mining", "Burning", "Minting"],
        a: "Burning"
    },
    {
        q: "What are 'Layer 2' solutions primarily designed to improve for a main blockchain?",
        options: ["Decentralization", "Security", "Scalability and speed", "Tokenomics"],
        a: "Scalability and speed"
    },
    {
        q: "What is the term for receiving cryptocurrency rewards for holding funds in a wallet to support network operations?",
        options: ["Farming", "Mining", "Lending", "Staking"],
        a: "Staking"
    },
    {
        q: "Which major stablecoin is algorithmically managed and not backed by fiat reserves?",
        options: ["USDC", "Tether (USDT)", "DAI", "BUSD"],
        a: "DAI"
    },
    {
        q: "Which country officially adopted Bitcoin as legal tender in 2021?",
        options: ["United States", "El Salvador", "Switzerland", "Japan"],
        a: "El Salvador"
    },
    {
        q: "What is a major characteristic of a stablecoin?",
        options: ["It is highly volatile", "It is pegged to a fiat currency or commodity", "It only operates on the Ethereum network", "It requires PoW consensus"],
        a: "It is pegged to a fiat currency or commodity"
    },
    {
        q: "The first ever recorded purchase using Bitcoin was for what item?",
        options: ["A computer", "A car", "A pizza", "A book"],
        a: "A pizza"
    }
];

interface Question {
    q: string;
    options: string[];
    a: string;
}

const TIMER_DURATION = 15; // seconds per question
const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const App: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
    const [isAnswerLocked, setIsAnswerLocked] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // Ref for interval management
    const timerIntervalRef = useRef<number | undefined>(undefined);

    const currentQuestion = questions[currentQuestionIndex];
    
    // --- Game Logic ---

    const initializeGame = useCallback(() => {
        // Clear any running timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = undefined;
        }

        setCurrentQuestionIndex(0);
        setScore(0);
        setIsAnswerLocked(false);
        setSelectedAnswer(null);
        setShowModal(false);
        setTimeRemaining(TIMER_DURATION);

        // Shuffle questions and options
        const shuffledQuestions = shuffleArray([...ALL_QUESTIONS]).map(q => ({
            ...q,
            options: shuffleArray([...q.options]),
        }));
        setQuestions(shuffledQuestions);
    }, []);

    // Timer effect
    useEffect(() => {
        if (isAnswerLocked || showModal || questions.length === 0) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = undefined;
            }
            return;
        }

        // Start the timer
        timerIntervalRef.current = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    // Time's up
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = undefined;
                    setIsAnswerLocked(true);
                    setSelectedAnswer(null); // Force lock and reveal answer
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000) as unknown as number;

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = undefined;
            }
        };
    }, [currentQuestionIndex, isAnswerLocked, showModal, questions.length]);

    // Reset time when question changes
    useEffect(() => {
        if (questions.length > 0 && !isAnswerLocked && !showModal) {
            setTimeRemaining(TIMER_DURATION);
        }
    }, [currentQuestionIndex, isAnswerLocked, questions.length, showModal]);

    // Initialize game on mount
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const handleAnswerCheck = useCallback((option: string | null) => {
        if (isAnswerLocked) return;

        // Lock the answer and stop the timer
        setIsAnswerLocked(true);
        setSelectedAnswer(option);
        
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = undefined;
        }

        if (option === currentQuestion.a) {
            setScore(prevScore => prevScore + 10);
        }
    }, [isAnswerLocked, currentQuestion]);

    const nextQuestion = useCallback(() => {
        if (!isAnswerLocked) return;

        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setIsAnswerLocked(false);
            setSelectedAnswer(null);
        } else {
            setShowModal(true);
        }
    }, [currentQuestionIndex, isAnswerLocked]);

    // --- Render Helpers ---

    const getButtonClass = (option: string) => {
        let baseClass = 'answer-btn p-4 rounded-xl text-base md:text-lg font-medium text-left transition duration-150 ease-in-out ';
        const isCorrect = option === currentQuestion.a;
        const isSelected = option === selectedAnswer;

        if (!isAnswerLocked) {
            // Default styling when not locked
            baseClass += ' bg-[#2e2e4e] border border-[#4a4a6e] text-indigo-200 shadow-[0_3px_0_0_#4a4a6e] hover:bg-[#4338ca] hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#4a4a6e] active:translate-y-0.5 active:shadow-[0_2px_0_0_#4a4a6e] cursor-pointer';
        } else {
            // Styling when locked (after selection or timeout)
            baseClass += ' cursor-not-allowed';
            if (isCorrect) {
                baseClass += ' bg-emerald-500 shadow-lg shadow-emerald-700/50 text-green-900 font-bold';
            } else if (isSelected && !isCorrect) {
                baseClass += ' bg-red-500 shadow-lg shadow-red-700/50 text-red-900 font-bold opacity-70';
            } else {
                baseClass += ' bg-gray-700 opacity-50'; // Unselected wrong answers
            }
        }
        return baseClass;
    };

    const renderAnswers = () => {
        if (!currentQuestion) return null;
        
        return currentQuestion.options.map(option => (
            <button
                key={option}
                className={getButtonClass(option)}
                onClick={() => handleAnswerCheck(option)}
                disabled={isAnswerLocked}
            >
                {option}
            </button>
        ));
    };

    // --- Modal Content Calculation ---
    const correctAnswers = score / 10;
    const accuracy = TOTAL_QUESTIONS > 0 ? ((correctAnswers / TOTAL_QUESTIONS) * 100).toFixed(1) : '0.0';
    
    let modalTitle = "";
    let titleClass = "";

    if (parseFloat(accuracy) >= 80) {
        modalTitle = "Crypto Whale Status!";
        titleClass = "text-green-400";
    } else if (parseFloat(accuracy) >= 50) {
        modalTitle = "Solid Trader!";
        titleClass = "text-yellow-400";
    } else {
        modalTitle = "Back to the Whitepapers!";
        titleClass = "text-red-400";
    }

    // --- Component JSX ---
    return (
        <div className="min-h-screen bg-[#0d0d1b] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#1a1a2e] rounded-3xl shadow-2xl shadow-indigo-900/50 border-2 border-[#5a5a7d] p-6 md:p-10 flex flex-col gap-6">
                
                <h1 className="text-4xl font-extrabold text-indigo-400 text-center tracking-wider"
                    style={{ textShadow: '0 0 5px rgba(99, 102, 241, 0.5)' }}>
                    CRYPTO TRIVIA CHALLENGE
                </h1>

                {/* Status Bar */}
                <div className="flex justify-between items-center text-lg font-bold">
                    <div className="text-green-400">Score: {score}</div>
                    <div className="text-yellow-400">Question: {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}</div>
                </div>

                {/* Timer Bar */}
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeRemaining / TIMER_DURATION) * 100}%` }}
                    ></div>
                </div>

                {/* Question Area */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-inner min-h-[100px] flex items-center justify-center">
                    <p className="text-xl md:text-2xl font-semibold text-center text-gray-100">
                        {currentQuestion ? currentQuestion.q : "Loading Quiz..."}
                    </p>
                </div>

                {/* Answers Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions.length > 0 && renderAnswers()}
                </div>

                {/* Controls */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={nextQuestion}
                        className={`px-8 py-3 font-bold text-lg rounded-xl shadow-md transition duration-200 
                            ${isAnswerLocked ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-70'}`}
                        disabled={!isAnswerLocked}
                    >
                        {currentQuestionIndex === TOTAL_QUESTIONS - 1 && isAnswerLocked ? 'See Results' : 'Next Question'}
                    </button>
                </div>
            </div>

            {/* Results Modal */}
            {showModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex justify-center items-center z-50">
                    <div className="bg-[#1a1a2e] border-4 border-indigo-500 rounded-xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl shadow-indigo-500/50 transform scale-100 transition-transform duration-300">
                        <h2 className={`text-4xl font-extrabold ${titleClass}`}>{modalTitle}</h2>
                        <p className="text-2xl text-gray-300">Final Score: {score} points</p>
                        <p className="text-xl text-yellow-300">Accuracy: {correctAnswers}/{TOTAL_QUESTIONS} ({accuracy}%)</p>
                        <button 
                            onClick={initializeGame}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 transition shadow-lg"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;