
export interface FairnessMetrics {
    disparateImpact: number;
    statisticalParityDifference: number;
    equalOpportunityDifference: number;
    chiSquared: number;
    pValue: number;
}

export interface ReportData {
    summary: string;
    ethicalImplications: string;
    recommendations: string[];
    ethicsStatement: string;
}

export interface GeminiRequestPayload {
    datasetName: string;
    protectedAttribute: string;
    favorableOutcome: string;
    metrics: FairnessMetrics;
    mitigationTechnique: MitigationTechnique;
    mitigatedMetrics: FairnessMetrics;
}

export type MitigationTechnique = 'reweighing' | 'disparate_impact_remover';

// Types for Text Bias Analyzer
export interface BiasFinding {
    biasedPhrase: string;
    explanation: string;
    suggestion: string;
}

export interface TextAnalysisResult {
    findings: BiasFinding[];
}

// Type for the auto-generated scenario and dataset from text
export interface SyntheticData {
    scenario: string;
    protectedAttribute: string;
    privilegedValue: any;
    unprivilegedValue: any;
    outcomeAttribute: string;
    favorableOutcome: string;
    data: any[];
}

// Types for Creative Bias Spectrum Analysis
export interface BiasDimension {
    dimension: string;
    stereotype: string;
    debiasedAlternative: string;
}

export interface BiasSpectrumAnalysis {
    concept: string;
    summary: string;
    spectrum: BiasDimension[];
}

// Types for Language and Tone Analysis
export interface EmotionalTone {
    tone: string;
    impact: string;
}

export interface LanguageToneAnalysis {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    formality: 'Formal' | 'Informal';
    objectivity: 'Objective' | 'Subjective';
    confidence: 'Confident' | 'Tentative' | 'Neutral';
    emotionalTones: EmotionalTone[];
    summary: string;
}

// Types for Unspoken Assumptions Analysis
export interface UnspokenAssumption {
    assumption: string;
    explanation: string;
}

export interface UnspokenAssumptionsAnalysis {
    assumptions: UnspokenAssumption[];
}

// Types for Key Biased Interpretations Analysis
export interface BiasedInterpretation {
    interpretation: string;
    explanation: string;
}

export interface KeyBiasedInterpretationsAnalysis {
    interpretations: BiasedInterpretation[];
}

// Types for Constructive Reframing Analysis
export interface ConstructiveReframing {
    reframing: string;
    explanation: string;
}

export interface ConstructiveReframingAnalysis {
    reframings: ConstructiveReframing[];
}

// Type for the new consolidated text analysis API call
export interface ComprehensiveTextAnalysis {
    textAnalysis: TextAnalysisResult;
    toneAnalysis: LanguageToneAnalysis;
    unspokenAssumptions: UnspokenAssumptionsAnalysis;
    biasedInterpretations: KeyBiasedInterpretationsAnalysis;
    constructiveReframing: ConstructiveReframingAnalysis;
}
