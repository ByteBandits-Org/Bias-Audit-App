
import React from 'react';
import { Card } from './Card';
import type { ConstructiveReframingAnalysis } from '../types';

const ReframingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500 flex-shrink-0 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

interface ConstructiveReframingDisplayProps {
    analysis: ConstructiveReframingAnalysis;
}

export const ConstructiveReframingDisplay: React.FC<ConstructiveReframingDisplayProps> = ({ analysis }) => {
    if (!analysis || !analysis.reframings || analysis.reframings.length === 0) {
        return null;
    }

    return (
        <Card className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">5. Constructive Reframing</h2>
                <p className="text-slate-500 mb-6">
                    Beyond identifying bias, here are alternative ways to frame the information constructively, focusing on fairness and individual merit.
                </p>
                
                <ul className="space-y-4">
                    {analysis.reframings.map((item, index) => (
                        <li key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60">
                            <div className="flex items-start">
                                <ReframingIcon />
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-1">{item.reframing}</h3>
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
