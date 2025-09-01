import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, ReferenceLine } from 'recharts';
import type { FairnessMetrics } from '../types';

interface FairnessChartProps {
    before: FairnessMetrics;
    after: FairnessMetrics;
}

export const FairnessChart: React.FC<FairnessChartProps> = ({ before, after }) => {
    const data = [
        { name: 'Disparate Impact', Before: before.disparateImpact, After: after.disparateImpact, Ideal: 1.0 },
        { name: 'Stat. Parity Diff.', Before: before.statisticalParityDifference, After: after.statisticalParityDifference, Ideal: 0.0 },
        { name: 'Equal Opp. Diff.', Before: before.equalOpportunityDifference, After: after.equalOpportunityDifference, Ideal: 0.0 },
    ];

    return (
        <div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ddd6fe" />
                        <XAxis dataKey="name" stroke="#64748b" dy={5} axisLine={false} tickLine={false}>
                            <Label value="Fairness Metrics" position="insideBottom" offset={-15} fill="#475569" />
                        </XAxis>
                        <YAxis stroke="#64748b" dx={-5}>
                             <Label value="Metric Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#475569" />
                        </YAxis>
                        <Tooltip 
                            cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #c4b5fd'
                            }}
                            labelStyle={{ color: '#1e293b' }}
                        />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Legend wrapperStyle={{ color: '#334155' }} verticalAlign="top" align="right" />
                        <Bar dataKey="Before" fill="#8b5cf6" />
                        <Bar dataKey="After" fill="#60a5fa" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="text-xs text-slate-500 mt-2 text-center space-y-1 px-4">
                <p>
                    <strong>Y-Axis (Metric Score):</strong> Represents the calculated value for each fairness metric. For "Disparate Impact," a value closer to 1.0 is ideal. For "Difference" metrics, a value closer to 0.0 is ideal.
                </p>
                <p>
                    <strong>X-Axis (Fairness Metrics):</strong> Shows standard metrics for quantifying bias. The "After" bars illustrate the simulated improvement after applying the selected mitigation technique.
                </p>
            </div>
        </div>
    );
};