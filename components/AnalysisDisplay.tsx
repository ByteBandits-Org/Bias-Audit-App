

import React, { useState } from 'react';
import type { FairnessMetrics, MitigationTechnique } from '../types';
import { Card } from './Card';
import { MetricCard } from './MetricCard';
import { FairnessChart } from './FairnessChart';
import { ValidationCard } from './ValidationCard';

interface AnalysisDisplayProps {
    analysisResults: { before: FairnessMetrics, after: FairnessMetrics };
    selectedMitigation: MitigationTechnique;
    setSelectedMitigation: (technique: MitigationTechnique) => void;
    pythonScriptContent: string;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    // FIX: Corrected a syntax error in the useState destructuring. It should use '=' instead of '=>'.
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!navigator.clipboard) return; 
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl overflow-hidden ring-1 ring-white/20">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900/60">
                <span className="text-sm font-semibold text-slate-300">bias_analysis_script.py</span>
                <button
                    onClick={handleCopy}
                    className={`flex items-center space-x-2 rounded-md px-3 py-1 text-sm font-medium transition ${copied ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <pre className="p-4 text-sm text-slate-100 overflow-x-auto max-h-96">
                <code className="font-mono">{code}</code>
            </pre>
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
    analysisResults,
    selectedMitigation,
    setSelectedMitigation,
    pythonScriptContent,
}) => {
    return (
        <div className="space-y-8">
            <Card>
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Quantitative Fairness Audit</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard title="Disparate Impact" value={analysisResults.before.disparateImpact} idealValue={1} explanation="Ratio of favorable outcomes for unprivileged vs. privileged groups. Ideal is 1.0." />
                        <MetricCard title="Statistical Parity Difference" value={analysisResults.before.statisticalParityDifference} idealValue={0} explanation="Difference in favorable outcome rates. Ideal is 0.0." />
                        <MetricCard title="Equal Opportunity Difference" value={analysisResults.before.equalOpportunityDifference} idealValue={0} explanation="Difference in true positive rates. Ideal is 0.0." />
                        <ValidationCard chiSquared={analysisResults.before.chiSquared} pValue={analysisResults.before.pValue} />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Bias Mitigation (Simulated)</h3>
                    <p className="text-sm text-slate-500 mb-6">Select a pre-processing technique to see its simulated effect. The chart and report will update automatically.</p>

                    <div className="flex items-center space-x-4 mb-6">
                        <label className="text-slate-700 font-medium">Mitigation Technique:</label>
                        <select
                            value={selectedMitigation}
                            onChange={(e) => setSelectedMitigation(e.target.value as MitigationTechnique)}
                             className="bg-white/40 border border-white/60 backdrop-blur-sm rounded-lg py-2.5 px-3 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                        >
                            <option value="reweighing">Reweighing</option>
                            <option value="disparate_impact_remover">Disparate Impact Remover</option>
                        </select>
                    </div>

                    <h4 className="text-lg font-semibold text-slate-700 mb-4">Impact of Mitigation on Key Fairness Metrics</h4>
                    <FairnessChart before={analysisResults.before} after={analysisResults.after} />

                    <div className="mt-8">
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">Reproducible Analysis Script</h4>
                        <p className="text-sm text-slate-500 mb-4">
                            This Python script contains the generated dataset and calculations. You can run it in an environment like Jupyter or Colab to reproduce the quantitative findings.
                        </p>
                        {pythonScriptContent && <CodeBlock code={pythonScriptContent} />}
                    </div>
                </div>
            </Card>
        </div>
    );
};