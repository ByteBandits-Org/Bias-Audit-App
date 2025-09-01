import React from 'react';
import { Card } from './Card';

export const FutureEnhancements: React.FC = () => {
    return (
        <Card>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Future Enhancements</h2>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                    <li>Ability to upload text files (.txt, .md) for direct analysis.</li>
                    <li>Integration with real-world datasets (e.g., via CSV upload and column mapping).</li>
                    <li>Expanded library of mitigation techniques, including post-processing methods.</li>
                    <li>Interactive data visualizations to explore biased data points directly.</li>
                    <li>Support for analyzing image and multimodal content for bias.</li>
                </ul>
            </div>
        </Card>
    );
};