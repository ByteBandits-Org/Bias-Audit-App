
import React from 'react';
import { Card } from './Card';
import type { KeyBiasedInterpretationsAnalysis } from '../types';

const InterpretationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500 flex-shrink-0 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h2v2z" />
    </svg>
);

interface KeyBiasedInterpretationsDisplayProps {
    analysis: KeyBiasedInterpretationsAnalysis;
}

export const KeyBiasedInterpretationsDisplay: React.FC<KeyBiasedInterpretationsDisplayProps> = ({ analysis }) => {
    if (!analysis || !analysis.interpretations || analysis.interpretations.length === 0) {
        return null;
    }

    return (
        <Card className="animate-fadeInUp" style={{ animationDelay: '150ms' }}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">4. Key Biased Interpretations</h2>
                <p className="text-slate-500 mb-6">
                    Words can imply more than they say. This section highlights how a reader might interpret the text in a biased way and explains the flawed logic behind it.
                </p>
                
                <ul className="space-y-4">
                    {analysis.interpretations.map((item, index) => (
                        <li key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60">
                            <div className="flex items-start">
                                <InterpretationIcon />
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-1">{item.interpretation}</h3>
                                    <p className="text-sm text-slate-600">{item.explanation}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};
