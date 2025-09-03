import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
    return (
        <div 
            className={`bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg shadow-violet-500/10 overflow-hidden ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};
