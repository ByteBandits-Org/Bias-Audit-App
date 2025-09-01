import React from 'react';

interface MetricCardProps {
    title: string;
    value: number;
    idealValue: number;
    explanation: string;
}

const getIndicatorStyle = (value: number, ideal: number, isRatio: boolean): { color: string; } => {
    const thresholdGood = isRatio ? 0.95 : 0.05;
    const thresholdWarn = isRatio ? 0.8 : 0.2;
    const diff = Math.abs(value - ideal);

    if (diff < thresholdGood) return { color: 'text-blue-600' };
    if (diff < thresholdWarn) return { color: 'text-violet-500' };
    return { color: 'text-purple-600' };
};


export const MetricCard: React.FC<MetricCardProps> = ({ title, value, idealValue, explanation }) => {
    const isRatio = idealValue === 1;
    const { color } = getIndicatorStyle(value, idealValue, isRatio);

    return (
        <div className="bg-white/40 backdrop-blur-sm p-5 rounded-xl flex flex-col h-full ring-1 ring-white/50">
            <h4 className="font-semibold text-slate-600 mb-2">{title}</h4>
            <div className={`text-5xl font-bold my-2 ${color}`}>
                {value.toFixed(3)}
            </div>
            <p className="text-sm text-slate-500 mt-auto">{explanation}</p>
        </div>
    );
};