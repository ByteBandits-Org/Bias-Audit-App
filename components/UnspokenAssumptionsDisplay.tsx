
import React from 'react';
import { Card } from './Card';
import type { UnspokenAssumptionsAnalysis } from '../types';

const AssumptionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500 flex-shrink-0 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface UnspokenAssumptionsDisplayProps {
    analysis: UnspokenAssumptionsAnalysis;
}

export const UnspokenAssumptionsDisplay: React.FC<UnspokenAssumptionsDisplayProps> = ({ analysis }) => {
    if (!analysis || !analysis.assumptions || analysis.assumptions.length === 0) {
        return null;
    }

    return (
        <Card className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">3. Unspoken Assumptions</h2>
                <p className="text-slate-500 mb-6">
                    Biased statements often rely on hidden beliefs. Exposing these unspoken assumptions is a key step in deconstructing the logic behind the bias.
                </p>
                
                <ul className="space-y-4">
                    {analysis.assumptions.map((item, index) => (
                        <li key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60">
                            <div className="flex items-start">
                                <AssumptionIcon />
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-1">{item.assumption}</h3>
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
