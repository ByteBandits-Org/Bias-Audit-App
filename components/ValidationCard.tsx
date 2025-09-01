import React from 'react';

interface ValidationCardProps {
    chiSquared: number;
    pValue: number;
}

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);


export const ValidationCard: React.FC<ValidationCardProps> = ({ chiSquared, pValue }) => {
    const isSignificant = pValue < 0.05;
    const significanceText = isSignificant 
        ? "Bias is statistically significant." 
        : "Bias is not statistically significant.";
    const color = isSignificant ? 'text-purple-600' : 'text-blue-600';
    const Icon = isSignificant ? ExclamationIcon : CheckCircleIcon;

    return (
        <div className="bg-white/40 backdrop-blur-sm p-5 rounded-xl flex flex-col h-full ring-1 ring-white/50">
            <h4 className="font-semibold text-slate-600 mb-2">Statistical Validation</h4>
            <div className="space-y-1 text-sm text-slate-500 my-2">
                <p>Chi-Squared: <span className="font-mono text-slate-800 float-right">{chiSquared.toFixed(3)}</span></p>
                <p>p-value: <span className="font-mono text-slate-800 float-right">{pValue < 0.001 ? '< 0.001' : pValue.toFixed(3)}</span></p>
            </div>
            <div className={`flex items-center text-sm font-semibold mt-auto pt-2 border-t border-slate-200/60 ${color}`}>
                <Icon />
                <span>{significanceText}</span>
            </div>
        </div>
    );
};