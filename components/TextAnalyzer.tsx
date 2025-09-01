import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
// FIX: Import BiasFinding to correctly type the analysis result findings.
import type { TextAnalysisResult, BiasFinding } from '../types';

// Add SpeechRecognition types for browsers that support it.
// This avoids TypeScript errors without needing to install @types/webspeechapi
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const MicrophoneIcon: React.FC<{ listening: boolean }> = ({ listening }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${listening ? 'text-red-500 animate-pulse' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

// FIX: Define TextAnalyzerProps interface for component props type safety.
interface TextAnalyzerProps {
    onAnalyze: (text: string) => void;
    isLoading: boolean;
    result: TextAnalysisResult | null;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ onAnalyze, isLoading, result }) => {
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [speechSupport, setSpeechSupport] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSpeechSupport(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => {
                setIsListening(false);
                recognition.stop();
            };
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                 if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setError('Microphone access denied. Please allow microphone access in your browser settings.');
                } else {
                    setError(`Speech recognition error: ${event.error}.`);
                }
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setText(prevText => (prevText.trim() ? prevText.trim() + ' ' : '') + finalTranscript.trim());
                }
            };
            
            recognitionRef.current = recognition;
        }
    }, []);

     const handleToggleListen = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };


    const handleAnalyzeClick = () => {
        if (!text.trim()) {
            setError('Please enter text to analyze.');
            return;
        }
        setError(null);
        onAnalyze(text);
    };

    const renderAnalyzedText = () => {
        if (!result || !result.findings || result.findings.length === 0) {
            return (
                <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg ring-1 ring-white/50">
                    <p className="text-blue-600 text-lg">No significant bias detected in the provided text.</p>
                </div>
            );
        }
    
        const phrases = result.findings.map(f => f.biasedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        if (phrases.length === 0) {
             return <p className="whitespace-pre-wrap">{text}</p>;
        }
        const regex = new RegExp(`(${phrases.join('|')})`, 'g');
        
        const parts = text.split(regex).filter(part => part);
    
        // FIX: Explicitly type findingMap to ensure `finding` is correctly typed as BiasFinding.
        const findingMap = new Map<string, BiasFinding>(result.findings.map(f => [f.biasedPhrase, f]));
    
        return (
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg ring-1 ring-white/50">
                 <p className="leading-relaxed whitespace-pre-wrap text-lg">
                    {parts.map((part, index) => {
                        const finding = findingMap.get(part);
                        if (finding) {
                            return (
                                <span key={index} className="bg-sky-300/40 rounded-md relative group cursor-pointer p-1">
                                    {part}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-80 mb-3 p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl text-sm text-left shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                        <p className="font-bold text-sky-700 mb-2">Potential Bias Detected</p>
                                        <p className="text-slate-600 mb-2"><span className="font-semibold">Explanation:</span> {finding.explanation}</p>
                                        <p className="text-slate-600"><span className="font-semibold">Suggestion:</span> <em className="text-blue-600 not-italic">"{finding.suggestion}"</em></p>
                                    </div>
                                </span>
                            );
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fadeInUp">
            <Card>
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">1. Analyze Text for Bias</h2>
                    <p className="text-slate-500 mb-6">Enter text below or use the microphone to dictate. The tool will automatically identify bias, infer the context, generate a sample dataset, and conduct a full fairness audit.</p>
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-48 bg-white/40 border border-white/60 backdrop-blur-sm rounded-lg p-4 pr-14 text-slate-800 focus:ring-2 focus:ring-violet-500 transition-colors"
                            placeholder="e.g., 'We only hire programmers under 30 because younger people are more innovative and learn faster.'"
                        />
                        {speechSupport && (
                             <button 
                                onClick={handleToggleListen}
                                className="absolute bottom-3 right-3 p-2 rounded-full bg-white/30 hover:bg-slate-200/50 backdrop-blur-sm transition-colors group"
                                title={isListening ? 'Stop listening' : 'Start dictation'}
                                aria-label={isListening ? 'Stop speech to text' : 'Start speech to text'}
                            >
                                <MicrophoneIcon listening={isListening} />
                            </button>
                        )}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row justify-end items-center">
                        <button
                           onClick={handleAnalyzeClick}
                           disabled={isLoading || !text.trim()}
                           className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Run Full Analysis'}
                        </button>
                    </div>
                </div>
            </Card>

            {error && <div className="bg-purple-100 border border-purple-300 text-purple-700 px-4 py-3 rounded-xl cursor-pointer" role="alert" onClick={() => setError(null)}>{error}</div>}

            {result && (
                <Card>
                    <div className="p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Text Analysis Results</h2>
                        {renderAnalyzedText()}
                    </div>
                </Card>
            )}
        </div>
    );
};