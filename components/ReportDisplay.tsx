import React from 'react';
import type { ReportData } from '../types';

interface ReportDisplayProps {
    report: ReportData;
}

const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-violet-700 mb-3 border-b-2 border-violet-200/80 pb-2">{title}</h3>
        <div className="text-slate-600 leading-relaxed space-y-4">{children}</div>
    </div>
);

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
    return (
        <div className="space-y-4">
            <ReportSection title="Executive Summary">
                <p>{report.summary}</p>
            </ReportSection>
            
            <ReportSection title="Ethical Implications & Real-World Harm">
                <p>{report.ethicalImplications}</p>
            </ReportSection>

            <ReportSection title="Recommendations for Mitigation">
                <ul className="space-y-3">
                    {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                            <svg className="h-5 w-5 mr-3 mt-1 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </ReportSection>

            <ReportSection title="Project Ethics Statement">
                <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-500">
                    {report.ethicsStatement}
                </blockquote>
            </ReportSection>
        </div>
    );
};