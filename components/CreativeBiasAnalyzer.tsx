
import React, { useState } from 'react';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import type { BiasSpectrumAnalysis, BiasDimension } from '../types';

// --- SVG Icons for Dimensions ---
const ICONS: { [key: string]: React.ReactNode } = {
    gender: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.75 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L20.25 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
    ),
    age: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    ethnicity: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    ),
    socioeconomic: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    ),
    physical: (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    body: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    default: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714c0-.597-.237-1.17-.659-1.591L14.25 5.25M5 14.5h14M5 14.5a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25h14a2.25 2.25 0 012.25 2.25v4.75a2.25 2.25 0 01-2.25 2.25M5 14.5v2.25a2.25 2.25 0 002.25 2.25h9.75a2.25 2.25 0 002.25-2.25V14.5" />
        </svg>
    )
};

const getDimensionIcon = (dimension: string): React.ReactNode => {
    const key = dimension.toLowerCase().split(' ')[0].replace('/', ''); // 'Ethnicity / Race' -> 'ethnicity'
    return ICONS[key] || ICONS.default;
};

// --- DimensionCard Component ---
const DimensionCard: React.FC<{ item: BiasDimension }> = ({ item }) => {
    return (
        <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl ring-1 ring-white/50 flex flex-col group h-full">
            <div className="flex items-center mb-3">
                <div className="w-10 h-10 mr-4 text-violet-600 flex-shrink-0">{getDimensionIcon(item.dimension)}</div>
                <h3 className="text-xl font-bold text-slate-700">{item.dimension}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-500 uppercase text-xs tracking-wider">Stereotype:</span>
                <br /> 
                {item.stereotype}
            </p>
            <div className="mt-auto pt-4 text-center">
                 <div className="inline-block relative">
                    <div className="flex items-center text-blue-600 font-semibold text-sm cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-3.536a1 1 0 01.707 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4.95 12.464a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 100-2 1 1 0 000 2z" /></svg>
                        <span>Creative Alternative</span>
                    </div>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-80 mb-3 p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl text-sm text-left shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <p className="font-bold text-blue-700 mb-2">Suggestion:</p>
                        <p className="text-slate-600">{item.debiasedAlternative}</p>
                    </div>
                 </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface CreativeBiasAnalyzerProps {
    onAnalyze: (concept: string) => void;
    isLoading: boolean;
    result: BiasSpectrumAnalysis | null;
    error: string | null;
}

export const CreativeBiasAnalyzer: React.FC<CreativeBiasAnalyzerProps> = ({ onAnalyze, isLoading, result, error }) => {
    const [concept, setConcept] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

    const handleAnalyzeClick = () => {
        if (!concept.trim()) {
            setInputError('Please enter a concept to analyze.');
            return;
        }
        setInputError(null);
        onAnalyze(concept);
    };

    return (
        <div className="animate-fadeInUp">
            <Card>
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Creative Bias Spectrum Analysis</h2>
                    <p className="text-slate-500 mb-6">Explore potential stereotypes associated with a creative concept to foster more inclusive ideas. Enter a concept like "a leader," "a hero," or "a genius."</p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <input
                            type="text"
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeClick()}
                            placeholder="Enter a concept (e.g., 'a scientist')"
                            className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-lg py-3 px-4 text-slate-800 focus:ring-2 focus:ring-violet-500 transition-colors"
                            aria-label="Creative concept to analyze"
                        />
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={isLoading || !concept.trim()}
                            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Analyze Spectrum'}
                        </button>
                    </div>
                    {inputError && <p className="text-purple-600 mt-2 text-sm">{inputError}</p>}
                </div>

                {isLoading && (
                    <div className="p-8 flex justify-center"><LoadingSpinner /></div>
                )}
                {error && <div className="p-6 md:p-8"><div className="bg-purple-100 border border-purple-300 text-purple-700 px-4 py-3 rounded-xl" role="alert">{error}</div></div>}

                {result && (
                    <div className="p-6 md:p-8 border-t border-white/30">
                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60 mb-8">
                             <p className="text-center italic text-lg text-slate-700">
                                "{result.summary}"
                            </p>
                        </div>
                       
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {result.spectrum.map((item, index) => (
                                <DimensionCard key={index} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
