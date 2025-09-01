

import React from 'react';
import { Card } from './Card';
import type { SyntheticData } from '../types';

interface InferredScenarioCardProps {
    scenario: SyntheticData;
}

const InfoPill: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="text-center bg-violet-50 rounded-lg p-3 ring-1 ring-violet-200/80">
        <div className="text-xs text-violet-500 font-semibold uppercase tracking-wider">{label}</div>
        <div className="text-base text-violet-900 font-medium">{value}</div>
    </div>
);


export const InferredScenarioCard: React.FC<InferredScenarioCardProps> = ({ scenario }) => {
    return (
         <Card className="animate-fadeInUp" style={{animationDelay: '250ms'}}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">6. Inferred Scenario & Generated Data</h2>
                <p className="text-slate-500 mb-6">
                    Based on your text, the following scenario was inferred and a synthetic dataset was generated to quantify the bias.
                </p>

                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl ring-1 ring-white/60 mb-6">
                    <p className="text-lg text-slate-700 text-center font-medium">
                        "{scenario.scenario}"
                    </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoPill label="Protected Attribute" value={scenario.protectedAttribute} />
                    <InfoPill label="Privileged Group" value={scenario.privilegedValue} />
                    <InfoPill label="Unprivileged Group" value={scenario.unprivilegedValue} />
                    <InfoPill label="Favorable Outcome" value={scenario.favorableOutcome} />
                </div>
            </div>
        </Card>
    );
};
