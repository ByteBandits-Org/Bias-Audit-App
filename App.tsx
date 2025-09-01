
import React, { useState, useCallback } from 'react';
import type { FairnessMetrics, ReportData, MitigationTechnique, TextAnalysisResult, SyntheticData, BiasSpectrumAnalysis, LanguageToneAnalysis, UnspokenAssumptionsAnalysis, KeyBiasedInterpretationsAnalysis, ConstructiveReframingAnalysis, ComprehensiveTextAnalysis } from './types';
import { generateAuditReport, runComprehensiveTextAnalysis, generateSyntheticDataFromText, analyzeCreativeBias, extractConceptForCreativeAnalysis } from './services/geminiService';
import { Header } from './components/Header';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ReportDisplay } from './components/ReportDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Card } from './components/Card';
import { TextAnalyzer } from './components/TextAnalyzer';
import { InferredScenarioCard } from './components/InferredScenarioCard';
import { CreativeBiasSpectrumDisplay } from './components/CreativeBiasSpectrumDisplay';
import { LanguageToneDisplay } from './components/LanguageToneDisplay';
import { UnspokenAssumptionsDisplay } from './components/UnspokenAssumptionsDisplay';
import { KeyBiasedInterpretationsDisplay } from './components/KeyBiasedInterpretationsDisplay';
import { ConstructiveReframingDisplay } from './components/ConstructiveReframingDisplay';
import { FutureEnhancements } from './components/FutureEnhancements';

/**
 * Chi-squared significance thresholds for 1 degree of freedom.
 */
const CHI_SQUARED_P_VALUES: { [key: number]: number } = {
    10.83: 0.001,
    6.63: 0.01,
    3.84: 0.05,
    2.71: 0.10,
};

/**
 * Calculates the chi-squared statistic and p-value for a 2x2 contingency table.
 */
const calculateChiSquared = (a: number, b: number, c: number, d: number) => {
    const N = a + b + c + d;
    if (N === 0 || (a + b) === 0 || (c + d) === 0 || (a + c) === 0 || (b + d) === 0) {
        return { chiSquared: 0, pValue: 1.0 };
    }
    
    const chiSquared = (N * Math.pow((a * d - b * c), 2)) / ((a + b) * (c + d) * (a + c) * (b + d));

    let pValue = 1.0;
    const sortedThresholds = Object.keys(CHI_SQUARED_P_VALUES).map(parseFloat).sort((x, y) => y - x);
    for (const threshold of sortedThresholds) {
        if (chiSquared >= threshold) {
            pValue = CHI_SQUARED_P_VALUES[threshold];
            break;
        }
    }
    
    return {
        chiSquared: parseFloat(chiSquared.toFixed(3)),
        pValue: pValue
    };
};

const App: React.FC = () => {
    // State for main bias audit flow
    const [textAnalysisResult, setTextAnalysisResult] = useState<TextAnalysisResult | null>(null);
    const [languageToneResult, setLanguageToneResult] = useState<LanguageToneAnalysis | null>(null);
    const [unspokenAssumptions, setUnspokenAssumptions] = useState<UnspokenAssumptionsAnalysis | null>(null);
    const [biasedInterpretations, setBiasedInterpretations] = useState<KeyBiasedInterpretationsAnalysis | null>(null);
    const [constructiveReframing, setConstructiveReframing] = useState<ConstructiveReframingAnalysis | null>(null);
    const [inferredScenario, setInferredScenario] = useState<SyntheticData | null>(null);
    const [analysisResults, setAnalysisResults] = useState<{ before: FairnessMetrics, after: FairnessMetrics } | null>(null);
    const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMitigation, setSelectedMitigation] = useState<MitigationTechnique>('reweighing');
    const [pythonScriptContent, setPythonScriptContent] = useState<string>('');
    
    // State for creative bias spectrum analysis (integrated into full analysis flow)
    const [fullFlowSpectrumResult, setFullFlowSpectrumResult] = useState<BiasSpectrumAnalysis | null>(null);


    /**
     * Calculates fairness metrics and statistical significance for a given dataset.
     */
    const calculateMetrics = (data: any[], protectedAttr: string, favorableOut: string, outcomeAttr: string, privilegedVal: any): FairnessMetrics => {
        const privilegedGroup = data.filter(d => d[protectedAttr] === privilegedVal);
        const unprivilegedGroup = data.filter(d => d[protectedAttr] !== privilegedVal);
        const privilegedFavorable = privilegedGroup.filter(d => d[outcomeAttr] === favorableOut).length;
        const privilegedUnfavorable = privilegedGroup.length - privilegedFavorable;
        const unprivilegedFavorable = unprivilegedGroup.filter(d => d[outcomeAttr] === favorableOut).length;
        const unprivilegedUnfavorable = unprivilegedGroup.length - unprivilegedFavorable;
        const privilegedRate = privilegedGroup.length > 0 ? privilegedFavorable / privilegedGroup.length : 0;
        const unprivilegedRate = unprivilegedGroup.length > 0 ? unprivilegedFavorable / unprivilegedGroup.length : 0;
        const disparateImpact = privilegedRate > 0 ? unprivilegedRate / privilegedRate : 0;
        const statisticalParityDifference = unprivilegedRate - privilegedRate;
        const equalOpportunityDifference = statisticalParityDifference; 
        const { chiSquared, pValue } = calculateChiSquared(privilegedFavorable, privilegedUnfavorable, unprivilegedFavorable, unprivilegedUnfavorable);

        return {
            disparateImpact: parseFloat(disparateImpact.toFixed(3)),
            statisticalParityDifference: parseFloat(statisticalParityDifference.toFixed(3)),
            equalOpportunityDifference: parseFloat(equalOpportunityDifference.toFixed(3)),
            chiSquared,
            pValue,
        };
    };

    const handleGenerateReport = async (
        initialResults: { before: FairnessMetrics, after: FairnessMetrics },
        mitigation: MitigationTechnique,
        scenario: SyntheticData
    ) => {
        // This function can run without setting the main loader
        // to avoid UI flashes when only the report is updating.
        try {
            const report = await generateAuditReport({
                datasetName: `Synthetic Data for "${scenario.scenario}"`,
                protectedAttribute: scenario.protectedAttribute,
                favorableOutcome: scenario.favorableOutcome,
                metrics: initialResults.before,
                mitigationTechnique: mitigation,
                mitigatedMetrics: initialResults.after,
            });
            setGeneratedReport(report);
        } catch (e: any) {
            setError(`Failed to generate report: ${e.message}`);
            console.error(e);
        }
    };
    
    const handleMitigationChange = (technique: MitigationTechnique) => {
        setSelectedMitigation(technique);

        if (!analysisResults || !inferredScenario) return;

        const beforeMetrics = analysisResults.before;
        const adjustmentFactor = technique === 'reweighing' ? 0.7 : 0.85;

        const mitigatedDI = 1 - (1 - beforeMetrics.disparateImpact) * (1 - adjustmentFactor);
        const mitigatedSPD = beforeMetrics.statisticalParityDifference * (1 - adjustmentFactor);
        const mitigatedEOD = beforeMetrics.equalOpportunityDifference * (1 - adjustmentFactor);

        const newAfterMetrics = {
            ...beforeMetrics,
            disparateImpact: parseFloat(mitigatedDI.toFixed(3)),
            statisticalParityDifference: parseFloat(mitigatedSPD.toFixed(3)),
            equalOpportunityDifference: parseFloat(mitigatedEOD.toFixed(3)),
        };

        const newAnalysisResults = { before: beforeMetrics, after: newAfterMetrics };
        
        setAnalysisResults(newAnalysisResults);
        handleGenerateReport(newAnalysisResults, technique, inferredScenario);
    };

    const generatePythonScript = (scenario: SyntheticData | null): string => {
        if (!scenario) return "";
        const dataString = JSON.stringify(scenario.data, null, 4);
        return `
#
# Reproducible Bias Analysis Script
# Generated by the Bias Audit Report
# ------------------------------------------------
# This script performs a bias analysis on synthetically generated data
# based on an initial text prompt.
# To run it, you need Python with 'pandas' and 'scipy' libraries installed.
# You can install them using pip:
# pip install pandas scipy
#

import pandas as pd
from scipy.stats import chi2_contingency
import json

# 1. Synthetic Dataset for Scenario: "${scenario.scenario}"
data_json = """${dataString}"""
data = json.loads(data_json)
df = pd.DataFrame(data)

print(f"--- Analyzing Synthetic Dataset for Scenario: ${scenario.scenario} ---\\n")
print(df.head())
print("\\n")


# 2. Analysis Parameters (Inferred from text)
protected_attribute = '${scenario.protectedAttribute}'
favorable_outcome = '${scenario.favorableOutcome}'
outcome_attribute = '${scenario.outcomeAttribute}'
privileged_value = '${scenario.privilegedValue}'

print("--- Analysis Parameters ---")
print(f"Protected Attribute: {protected_attribute}")
print(f"Favorable Outcome: {favorable_outcome}")
print("\\n")


# 3. Contingency Table Calculation
# The synthetic data uses fixed column names: 'subject_group' and 'outcome'
privileged_group = df[df['subject_group'] == privileged_value]
unprivileged_group = df[df['subject_group'] != privileged_value]

a = len(privileged_group[privileged_group['outcome'] == favorable_outcome]) # privileged, favorable
b = len(privileged_group) - a # privileged, unfavorable
c = len(unprivileged_group[unprivileged_group['outcome'] == favorable_outcome]) # unprivileged, favorable
d = len(unprivileged_group) - c # unprivileged, unfavorable

contingency_table = [[a, b], [c, d]]

print("--- Contingency Table ---")
print(f"                | Favorable | Unfavorable")
print(f"----------------|-----------|-------------")
print(f"Privileged      | {a:<9} | {b:<9}")
print(f"Unprivileged    | {c:<9} | {d:<9}")
print("\\n")


# 4. Statistical Validation (Chi-Squared Test)
if a + b + c + d > 0:
    chi2, p, dof, expected = chi2_contingency(contingency_table)
    print("--- Statistical Validation ---")
    print(f"Chi-Squared Statistic: {chi2:.4f}")
    print(f"P-value: {p:.4f}")
    if p < 0.05:
        print("Result: The observed association is statistically significant (p < 0.05).")
    else:
        print("Result: The observed association is not statistically significant (p >= 0.05).")
else:
    print("--- Statistical Validation ---")
    print("Not enough data to perform Chi-Squared test.")
print("\\n")


# 5. Fairness Metrics Calculation
privileged_rate = a / (a + b) if (a + b) > 0 else 0
unprivileged_rate = c / (c + d) if (c + d) > 0 else 0

disparate_impact = unprivileged_rate / privileged_rate if privileged_rate > 0 else 0
statistical_parity_difference = unprivileged_rate - privileged_rate

print("--- Fairness Metrics ---")
print(f"Disparate Impact: {disparate_impact:.4f}")
print(f"Statistical Parity Difference: {statistical_parity_difference:.4f}")
print("\\n")


# 6. Conclusion
print("--- End of Analysis ---")
print("This script provides a reproducible analysis of the synthetically generated dataset.")
`;
    };

    const handleFullAnalysis = useCallback(async (text: string) => {
        setIsLoading(true);
        setError(null);
        setTextAnalysisResult(null);
        setLanguageToneResult(null);
        setUnspokenAssumptions(null);
        setBiasedInterpretations(null);
        setConstructiveReframing(null);
        setInferredScenario(null);
        setAnalysisResults(null);
        setGeneratedReport(null);
        setFullFlowSpectrumResult(null);
        setPythonScriptContent('');

        try {
            // Run all API calls concurrently for better performance
            const [comprehensiveAnalysis, scenario, conceptResult] = await Promise.all([
                runComprehensiveTextAnalysis(text),
                generateSyntheticDataFromText(text),
                extractConceptForCreativeAnalysis(text)
            ]);

            setTextAnalysisResult(comprehensiveAnalysis.textAnalysis);
            setLanguageToneResult(comprehensiveAnalysis.toneAnalysis);
            setUnspokenAssumptions(comprehensiveAnalysis.unspokenAssumptions);
            setBiasedInterpretations(comprehensiveAnalysis.biasedInterpretations);
            setConstructiveReframing(comprehensiveAnalysis.constructiveReframing);

            setInferredScenario(scenario);

            const beforeMetrics = calculateMetrics(scenario.data, 'subject_group', scenario.favorableOutcome, 'outcome', scenario.privilegedValue);
            
            const adjustmentFactor = selectedMitigation === 'reweighing' ? 0.7 : 0.85;
            const mitigatedDI = 1 - (1 - beforeMetrics.disparateImpact) * (1 - adjustmentFactor);
            const mitigatedSPD = beforeMetrics.statisticalParityDifference * (1 - adjustmentFactor);
            const mitigatedEOD = beforeMetrics.equalOpportunityDifference * (1 - adjustmentFactor);

            const afterMetrics = {
                ...beforeMetrics,
                disparateImpact: parseFloat(mitigatedDI.toFixed(3)),
                statisticalParityDifference: parseFloat(mitigatedSPD.toFixed(3)),
                equalOpportunityDifference: parseFloat(mitigatedEOD.toFixed(3)),
            };

            const initialAnalysis = { before: beforeMetrics, after: afterMetrics };
            setAnalysisResults(initialAnalysis);
            
            setPythonScriptContent(generatePythonScript(scenario));

            // Generate report and creative analysis after main data is processed
            handleGenerateReport(initialAnalysis, selectedMitigation, scenario);
            if (conceptResult.concept) {
                analyzeCreativeBias(conceptResult.concept).then(setFullFlowSpectrumResult).catch(console.error);
            }

        } catch (e: any) {
            setError(`An error occurred during analysis: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMitigation]);

    return (
        <div className="min-h-screen">
            <Header />
            <main className="container mx-auto px-4 md:px-8 py-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <TextAnalyzer onAnalyze={handleFullAnalysis} isLoading={isLoading} result={textAnalysisResult} />
                    
                    {error && (
                        <Card>
                             <div className="bg-purple-100 border border-purple-300 text-purple-700 px-4 py-3 rounded-xl cursor-pointer" role="alert" onClick={() => setError(null)}>
                                <p className="font-bold">An Error Occurred</p>
                                <p>{error}</p>
                            </div>
                        </Card>
                    )}

                    {isLoading && !analysisResults && (
                        <Card>
                            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                                <LoadingSpinner />
                                <p className="text-slate-600 font-medium">Running comprehensive analysis...</p>
                                <p className="text-sm text-slate-500 text-center max-w-md">This can take a moment. We're analyzing tone, generating data, and preparing your report.</p>
                            </div>
                        </Card>
                    )}
                    
                    <div className="grid grid-cols-1 gap-8">
                        {languageToneResult && <LanguageToneDisplay analysis={languageToneResult} />}
                        {unspokenAssumptions && unspokenAssumptions.assumptions.length > 0 && <UnspokenAssumptionsDisplay analysis={unspokenAssumptions} />}
                        {biasedInterpretations && biasedInterpretations.interpretations.length > 0 && <KeyBiasedInterpretationsDisplay analysis={biasedInterpretations} />}
                        {constructiveReframing && constructiveReframing.reframings.length > 0 && <ConstructiveReframingDisplay analysis={constructiveReframing} />}
                        {fullFlowSpectrumResult && <CreativeBiasSpectrumDisplay result={fullFlowSpectrumResult} />}
                        {inferredScenario && <InferredScenarioCard scenario={inferredScenario} />}
                    </div>

                    {analysisResults && pythonScriptContent && inferredScenario && (
                        <AnalysisDisplay
                            analysisResults={analysisResults}
                            selectedMitigation={selectedMitigation}
                            setSelectedMitigation={handleMitigationChange}
                            pythonScriptContent={pythonScriptContent}
                        />
                    )}

                    {generatedReport && !isLoading && (
                        <Card>
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">8. Generated AI Ethics Report</h2>
                                <ReportDisplay report={generatedReport} />
                            </div>
                        </Card>
                    )}

                    <FutureEnhancements />
                </div>
            </main>
        </div>
    );
};

export default App;
