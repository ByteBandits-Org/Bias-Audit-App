

import React from 'react';
import { Card } from './Card';
import type { LanguageToneAnalysis } from '../types';

// A map of tone values to their respective colors and icons.
const TONE_STYLES = {
    Sentiment: {
        Positive: { color: 'text-blue-600 bg-blue-100/80 ring-blue-200', icon: '😊' },
        Negative: { color: 'text-purple-600 bg-purple-100/80 ring-purple-200', icon: '😟' },
        Neutral: { color: 'text-slate-600 bg-slate-100/80 ring-slate-200', icon: '😐' },
    },
    Formality: {
        Formal: { color: 'text-slate-600 bg-slate-100/80 ring-slate-200', icon: '👔' },
        Informal: { color: 'text-blue-600 bg-blue-100/80 ring-blue-200', icon: '👕' },
    },
    Objectivity: {
        Objective: { color: 'text-slate-600 bg-slate-100/80 ring-slate-200', icon: '⚖️' },
        Subjective: { color: 'text-violet-600 bg-violet-100/80 ring-violet-200', icon: '🎨' },
    },
    Confidence: {
        Confident: { color: 'text-blue-600 bg-blue-100/80 ring-blue-200', icon: '💪' },
        Tentative: { color: 'text-purple-600 bg-purple-100/80 ring-purple-200', icon: '🤔' },
        Neutral: { color: 'text-slate-600 bg-slate-100/80 ring-slate-200', icon: '📝' },
    },
};

const TONE_EXPLANATIONS = {
    Sentiment: {
        Positive: 'Positive framing can mask negative stereotypes or create an unfairly favorable view of a subject.',
        Negative: 'Negative framing directly contributes to bias by associating subjects with undesirable qualities.',
        Neutral: 'A neutral stance may still contain bias through omission or subtle word choices.',
    },
    Formality: {
        Formal: 'Official or academic tone can lend undue authority to biased content.',
        Informal: 'Casual tone, where biases might be presented as common-sense or relatable opinions.',
    },
    Objectivity: {
        Objective: 'Fact-based language is less likely to be overtly biased but can still frame biased information.',
        Subjective: 'Opinion-based language can present biased viewpoints as authoritative statements.',
    },
    Confidence: {
        Confident: 'Assertive language can make biased or unsubstantiated claims seem more credible.',
        Tentative: 'Cautious language may indicate uncertainty but can also subtly introduce doubt about certain groups.',
        Neutral: 'Direct and unstated confidence level.',
    },
};

// FIX: The original interface was causing the `value` prop to be of type `never`,
// because it was taking the intersection of keys from different objects.
// This mapped type creates a discriminated union of valid prop combinations,
// ensuring that the `value` prop is correctly typed based on the `label`.
type TonePillProps = {
    [L in keyof typeof TONE_STYLES]: {
        label: L;
        value: keyof typeof TONE_STYLES[L];
        explanation: string;
    };
}[keyof typeof TONE_STYLES];


const TonePill: React.FC<TonePillProps> = ({ label, value, explanation }) => {
    // FIX: The previous `@ts-ignore` was hiding a type error. With the corrected `TonePillProps`,
    // TypeScript still cannot correlate `label` and `value` inside the component.
    // This type assertion informs TypeScript about the structure we know is correct,
    // resolving the error and allowing `style.color` and `style.icon` to be accessed safely.
    const style = (TONE_STYLES[label] as any)[value] || { color: 'text-slate-600 bg-slate-100/80 ring-slate-200', icon: ' ' };
    
    return (
        <div className="text-center bg-white/50 rounded-lg p-3 ring-1 ring-white/60 flex flex-col h-full">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
            <div className={`my-2 inline-flex items-center self-center justify-center px-4 py-1.5 rounded-full text-sm font-bold ${style.color}`}>
                <span className="mr-2 text-lg">{style.icon}</span>
                {value}
            </div>
            <p className="text-xs text-slate-500 mt-auto">{explanation}</p>
        </div>
    );
};

const EmotionalToneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500 flex-shrink-0 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


interface LanguageToneDisplayProps {
    analysis: LanguageToneAnalysis;
}

export const LanguageToneDisplay: React.FC<LanguageToneDisplayProps> = ({ analysis }) => {
    return (
        <Card className="animate-fadeInUp" style={{ animationDelay: '50ms' }}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">2. Language & Tone Analysis</h2>
                 <p className="text-slate-500 mb-6">
                    Bias isn't just about what is said, but <strong>how</strong> it's said. The tone of a text can make biased statements seem more credible or objective. This analysis reveals how the text's style might influence a reader and reinforce underlying biases.
                </p>
                
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60 mb-6">
                    <blockquote className="text-center italic text-slate-700 relative pl-8">
                         <div className="absolute left-1 top-0 h-full flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        "{analysis.summary}"
                    </blockquote>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TonePill label="Sentiment" value={analysis.sentiment} explanation={TONE_EXPLANATIONS.Sentiment[analysis.sentiment]}/>
                    <TonePill label="Formality" value={analysis.formality} explanation={TONE_EXPLANATIONS.Formality[analysis.formality]}/>
                    <TonePill label="Objectivity" value={analysis.objectivity} explanation={TONE_EXPLANATIONS.Objectivity[analysis.objectivity]}/>
                    <TonePill label="Confidence" value={analysis.confidence} explanation={TONE_EXPLANATIONS.Confidence[analysis.confidence]}/>
                </div>

                {analysis.emotionalTones && analysis.emotionalTones.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/40">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Perceived Emotional Tones</h3>
                        <ul className="space-y-4">
                            {analysis.emotionalTones.map((item, index) => (
                                <li key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60">
                                    <div className="flex items-start">
                                        <EmotionalToneIcon />
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{item.tone}</h4>
                                            <p className="text-sm text-slate-600">{item.impact}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};
