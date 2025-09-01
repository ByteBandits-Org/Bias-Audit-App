import React from 'react';

export const Header: React.FC = () => (
    <header className="bg-white/40 backdrop-blur-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-8 py-4 border-b border-slate-200/80">
            <div className="flex items-center space-x-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bias Audit Report
                </h1>
            </div>
        </div>
    </header>
);