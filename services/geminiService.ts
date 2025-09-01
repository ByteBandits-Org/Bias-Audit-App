
import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiRequestPayload, ReportData, TextAnalysisResult, SyntheticData, BiasSpectrumAnalysis, LanguageToneAnalysis, UnspokenAssumptionsAnalysis, KeyBiasedInterpretationsAnalysis, ConstructiveReframingAnalysis, ComprehensiveTextAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Defines the expected JSON structure for the bias audit report from the Gemini API.
const reportResponseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise, one-paragraph summary of the key bias findings based on the provided metrics."
        },
        ethicalImplications: {
            type: Type.STRING,
            description: "A paragraph discussing potential real-world harms and societal impact. Connect this to fairness, accountability, and transparency principles."
        },
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 actionable recommendations for mitigating the identified biases (e.g., data collection strategies, pre-processing techniques)."
        },
        ethicsStatement: {
            type: Type.STRING,
            description: "A formal ethics statement (around 150-200 words) for the project, acknowledging biases and committing to responsible AI development."
        },
    },
    required: ["summary", "ethicalImplications", "recommendations", "ethicsStatement"]
};

/**
 * Generates a full bias audit report by sending analysis data to the Gemini API.
 */
export const generateAuditReport = async (payload: GeminiRequestPayload): Promise<ReportData> => {
    const { datasetName, protectedAttribute, favorableOutcome, metrics, mitigationTechnique, mitigatedMetrics } = payload;
    
    const prompt = `
        You are an expert AI Ethics auditor providing a formal bias audit report.
        Analyze the following information and generate a comprehensive report in the specified JSON format.

        **Audit Context:**
        - **Dataset:** ${datasetName}
        - **Analyzed for Bias Across:** ${protectedAttribute}
        - **Favorable Outcome:** "${favorableOutcome}"

        **Initial Fairness Analysis (Before Mitigation):**
        - **Disparate Impact:** ${metrics.disparateImpact.toFixed(3)} (A value close to 1.0 is ideal. Lower values indicate the unprivileged group receives the favorable outcome at a lower rate than the privileged group.)
        - **Statistical Parity Difference:** ${metrics.statisticalParityDifference.toFixed(3)} (A value close to 0.0 is ideal. Negative values indicate the unprivileged group has a lower selection rate.)
        
        **Statistical Validation:**
        - **Chi-Squared Test Statistic:** ${metrics.chiSquared.toFixed(3)}
        - **P-value:** ${metrics.pValue < 0.001 ? '< 0.001' : metrics.pValue.toFixed(3)}
        - **Interpretation:** A p-value less than 0.05 indicates the observed difference in outcomes between groups is statistically significant.

        **Mitigation Strategy Applied (Simulated):**
        - **Technique:** ${mitigationTechnique === 'reweighing' ? 'Reweighing' : 'Disparate Impact Remover'}

        **Post-Mitigation Fairness Analysis:**
        - **Disparate Impact:** ${mitigatedMetrics.disparateImpact.toFixed(3)}
        - **Statistical Parity Difference:** ${mitigatedMetrics.statisticalParityDifference.toFixed(3)}
        
        Based on this data, please generate the report. Be clear, concise, and professional. The recommendations should be practical and relevant.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: reportResponseSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData: ReportData = JSON.parse(jsonText);
        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for report generation:", error);
        throw new Error("Failed to generate report from Gemini API.");
    }
};

const syntheticDataResponseSchema = {
    type: Type.OBJECT,
    properties: {
        scenario: { type: Type.STRING, description: "A brief, neutral description of the situation or context described in the text (e.g., 'Evaluating candidates for a technical role')." },
        protectedAttribute: { type: Type.STRING, description: "The characteristic being used for biased comparison (e.g., 'gender', 'age', 'nationality'). This is a label for the concept." },
        privilegedValue: { type: Type.STRING, description: "The group that is favored in the biased text (e.g., 'Male', 'Younger', 'Local')." },
        unprivilegedValue: { type: Type.STRING, description: "The group that is disfavored in the biased text (e.g., 'Female', 'Older', 'Foreigner')." },
        outcomeAttribute: { type: Type.STRING, description: "The name of the outcome or decision being made (e.g., 'hiring_decision', 'loan_status'). This is a label for the concept." },
        favorableOutcome: { type: Type.STRING, description: "The desirable outcome in this scenario (e.g., 'Hired', 'Approved')." },
        data: {
            type: Type.ARRAY,
            description: "A synthetic dataset of 20-30 JSON objects representing the scenario. This data must mathematically reflect the bias in the original text.",
            items: {
                type: Type.OBJECT,
                properties: {
                    subject_group: {
                        type: Type.STRING,
                        description: "The value for the protected attribute for this data point. Must be one of the privileged or unprivileged values defined above."
                    },
                    outcome: {
                        type: Type.STRING,
                        description: "The outcome for this data point. Must be the favorable outcome or an alternative."
                    }
                },
                required: ["subject_group", "outcome"]
            }
        }
    },
    required: ["scenario", "protectedAttribute", "privilegedValue", "unprivilegedValue", "outcomeAttribute", "favorableOutcome", "data"]
};

/**
 * Infers a scenario from biased text and generates a synthetic dataset representing that bias.
 */
export const generateSyntheticDataFromText = async (text: string): Promise<SyntheticData> => {
    const prompt = `
        You are a Data Scientist and AI Ethicist. Your task is to analyze a user-provided text for bias and then construct a synthetic dataset that mathematically represents that bias.

        **Instructions:**
        1.  Read the user's text and understand the core bias being expressed.
        2.  Define the scenario, the protected attribute concept, the specific groups being compared (privileged vs. unprivileged), and the favorable outcome.
        3.  Generate a synthetic JSON dataset of 20-30 records. The distribution of outcomes in your dataset MUST reflect the bias from the text. For example, if the text says men are better programmers, the 'Hired' outcome should be significantly more frequent for the 'Male' group in your data.
        4.  For each record in the 'data' array, you MUST use the key "subject_group" for the protected attribute's value and the key "outcome" for the decision's value.
        5.  Return a single JSON object matching the provided schema.

        **User Text to Analyze:**
        ---
        ${text}
        ---

        Now, generate the full JSON response based on this text.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: syntheticDataResponseSchema,
                temperature: 0.4,
            },
        });

        const jsonText = response.text.trim();
        const parsedData: SyntheticData = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsedData.data || parsedData.data.length === 0) {
            throw new Error("Model failed to generate synthetic data points.");
        }
        if (!parsedData.data[0].hasOwnProperty('subject_group') || !parsedData.data[0].hasOwnProperty('outcome')) {
             throw new Error("Generated data does not contain the required 'subject_group' and 'outcome' keys.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for synthetic data generation:", error);
        throw new Error("Failed to generate synthetic data with Gemini API.");
    }
};

/**
 * Runs a comprehensive analysis on a block of text for bias, tone, assumptions, and more,
 * using a single, consolidated API call to avoid rate limiting.
 */
export const runComprehensiveTextAnalysis = async (text: string): Promise<ComprehensiveTextAnalysis> => {
    const textAnalysisSchema = {
        type: Type.OBJECT,
        properties: {
            findings: {
                type: Type.ARRAY,
                description: "A list of phrases identified as potentially biased.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        biasedPhrase: {
                            type: Type.STRING,
                            description: "The exact phrase from the original text that is potentially biased. It must be a substring of the original text."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A brief explanation of why the phrase is considered biased (e.g., perpetuates stereotypes, uses loaded language)."
                        },
                        suggestion: {
                            type: Type.STRING,
                            description: "A more neutral alternative to the biased phrase."
                        }
                    },
                    required: ["biasedPhrase", "explanation", "suggestion"]
                }
            }
        },
        required: ["findings"]
    };

    const languageToneSchema = {
        type: Type.OBJECT,
        properties: {
            sentiment: {
                type: Type.STRING,
                enum: ['Positive', 'Negative', 'Neutral'],
                description: "The overall sentiment of the text."
            },
            formality: {
                type: Type.STRING,
                enum: ['Formal', 'Informal'],
                description: "The level of formality in the text."
            },
            objectivity: {
                type: Type.STRING,
                enum: ['Objective', 'Subjective'],
                description: "Whether the text is objective (fact-based) or subjective (opinion-based)."
            },
            confidence: {
                type: Type.STRING,
                enum: ['Confident', 'Tentative', 'Neutral'],
                description: "The level of confidence expressed in the text."
            },
            emotionalTones: {
                type: Type.ARRAY,
                description: "A list of 2-4 perceived emotional tones in the text (e.g., 'Dismissive', 'Arrogant', 'Alarmist').",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        tone: {
                            type: Type.STRING,
                            description: "The specific emotional tone identified."
                        },
                        impact: {
                            type: Type.STRING,
                            description: "How this emotional tone can influence the reader and reinforce bias."
                        }
                    },
                    required: ["tone", "impact"]
                }
            },
            summary: {
                type: Type.STRING,
                description: "A brief, one-sentence summary of how the language and tone could influence a reader's perception of the text's potential biases."
            }
        },
        required: ["sentiment", "formality", "objectivity", "confidence", "emotionalTones", "summary"]
    };

    const unspokenAssumptionsSchema = {
        type: Type.OBJECT,
        properties: {
            assumptions: {
                type: Type.ARRAY,
                description: "A list of unspoken assumptions underpinning the biased statements in the text.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        assumption: {
                            type: Type.STRING,
                            description: "The core underlying belief or assumption that is not explicitly stated."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A brief explanation of how this assumption connects to and supports the bias in the text."
                        }
                    },
                    required: ["assumption", "explanation"]
                }
            }
        },
        required: ["assumptions"]
    };

    const biasedInterpretationsSchema = {
        type: Type.OBJECT,
        properties: {
            interpretations: {
                type: Type.ARRAY,
                description: "A list of key biased interpretations a reader might draw from the text.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        interpretation: {
                            type: Type.STRING,
                            description: "A statement summarizing a likely, but biased, interpretation of the text."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A brief explanation of why this interpretation is biased, often by pointing out flawed logic or reliance on stereotypes."
                        }
                    },
                    required: ["interpretation", "explanation"]
                }
            }
        },
        required: ["interpretations"]
    };

    const constructiveReframingSchema = {
        type: Type.OBJECT,
        properties: {
            reframings: {
                type: Type.ARRAY,
                description: "A list of constructive, unbiased alternative ways to frame the information.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        reframing: {
                            type: Type.STRING,
                            description: "A statement that presents the information in a more balanced, fair, and constructive way."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A brief explanation of the ethical principle this reframing upholds (e.g., focusing on individual skills, avoiding generalizations)."
                        }
                    },
                    required: ["reframing", "explanation"]
                }
            }
        },
        required: ["reframings"]
    };

    const comprehensiveTextAnalysisSchema = {
        type: Type.OBJECT,
        properties: {
            textAnalysis: textAnalysisSchema,
            toneAnalysis: languageToneSchema,
            unspokenAssumptions: unspokenAssumptionsSchema,
            biasedInterpretations: biasedInterpretationsSchema,
            constructiveReframing: constructiveReframingSchema,
        },
        required: ["textAnalysis", "toneAnalysis", "unspokenAssumptions", "biasedInterpretations", "constructiveReframing"]
    };

    const prompt = `
        You are a highly advanced AI Ethics auditor. Analyze the following text comprehensively from multiple perspectives.
        
        **Text to Analyze:**
        ---
        ${text}
        ---

        Please provide a complete analysis in the specified JSON format, covering the following five areas:

        1.  **textAnalysis:** Identify any phrases that exhibit bias (e.g., stereotypes, loaded language). For each, explain the bias and suggest a neutral alternative. The "biasedPhrase" MUST be an exact substring from the original text. If no bias is found, return an empty array for "findings".

        2.  **toneAnalysis:** 
            - Determine the overall linguistic dimensions: sentiment, formality, objectivity, and confidence.
            - Identify 2-4 key emotional tones (e.g., Dismissive, Arrogant) and explain their potential impact in reinforcing bias.
            - Provide a one-sentence summary of how the tone could influence a reader's perception.

        3.  **unspokenAssumptions:** Identify hidden beliefs or premises that must be true for the biased statements to make sense. For each, explain how it supports the bias. If none, return an empty array.

        4.  **biasedInterpretations:** Identify likely biased interpretations a reader might form from the text's implications. For each, explain why the interpretation is biased or based on flawed logic. If none, return an empty array.
        
        5.  **constructiveReframing:** Provide alternative, ethically-sound ways to frame the core message. For each reframing, explain the ethical principle it upholds. If no reframing is needed, return an empty array.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comprehensiveTextAnalysisSchema,
                temperature: 0.4,
            },
        });

        const jsonText = response.text.trim();
        const parsedData: ComprehensiveTextAnalysis = JSON.parse(jsonText);

        // Post-processing filter to ensure biased phrases are exact matches from the text.
        if (parsedData.textAnalysis.findings) {
            parsedData.textAnalysis.findings = parsedData.textAnalysis.findings.filter(finding => text.includes(finding.biasedPhrase));
        }

        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for comprehensive text analysis:", error);
        throw new Error("Failed to run comprehensive text analysis with Gemini API.");
    }
};

// --- Creative Bias Spectrum Analysis ---

const biasSpectrumSchema = {
    type: Type.OBJECT,
    properties: {
        concept: { type: Type.STRING, description: "The original concept provided by the user." },
        summary: { type: Type.STRING, description: "A brief, 1-2 sentence summary of the potential stereotypes associated with the concept." },
        spectrum: {
            type: Type.ARRAY,
            description: "An array of bias dimensions and creative alternatives.",
            items: {
                type: Type.OBJECT,
                properties: {
                    dimension: { type: Type.STRING, description: "The dimension of bias (e.g., 'Gender', 'Age')." },
                    stereotype: { type: Type.STRING, description: "The common stereotype associated with the concept on this dimension." },
                    debiasedAlternative: { type: Type.STRING, description: "A creative suggestion for a character or story that subverts this stereotype." }
                },
                required: ["dimension", "stereotype", "debiasedAlternative"]
            }
        }
    },
    required: ["concept", "summary", "spectrum"]
};


/**
 * Analyzes a creative concept for a spectrum of potential biases.
 */
export const analyzeCreativeBias = async (concept: string): Promise<BiasSpectrumAnalysis> => {
    const prompt = `
        You are an expert in creative writing and AI ethics, specializing in identifying and deconstructing subtle stereotypes in media.
        A user has provided a creative concept. Your task is to analyze this concept across a spectrum of potential biases and provide creative alternatives.

        Analyze the concept: "${concept}"

        Generate a response in the specified JSON format. For each dimension, identify a common stereotype associated with the concept and then provide a concrete, creative, and inspiring alternative that subverts that stereotype.

        Dimensions to consider must include (but are not limited to):
        - Gender
        - Age
        - Ethnicity / Race
        - Socioeconomic Status
        - Physical Ability / Disability
        - Body Type
        - Nationality / Cultural Background

        Provide at least 5 distinct dimensions in your analysis.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: biasSpectrumSchema,
                temperature: 0.6,
            },
        });

        const jsonText = response.text.trim();
        const parsedData: BiasSpectrumAnalysis = JSON.parse(jsonText);
        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for creative bias analysis:", error);
        throw new Error("Failed to analyze creative concept with Gemini API.");
    }
};


/**
 * Defines the expected JSON structure for extracting a concept from text.
 */
const conceptExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        concept: {
            type: Type.STRING,
            description: "The central role, job, or character concept being discussed in the text (e.g., 'programmer', 'leader', 'scientist')."
        }
    },
    required: ["concept"]
};

/**
 * Extracts the core creative concept from a block of text to be used in the spectrum analysis.
 */
export const extractConceptForCreativeAnalysis = async (text: string): Promise<{ concept: string }> => {
    const prompt = `
        Analyze the following text and identify the single central subject, role, or character concept being discussed.
        The concept should be a concise noun or short noun phrase suitable for a creative bias analysis.
        For example, from "We only hire programmers under 30 because they learn faster," the ideal concept is "programmer".
        From "The new CEO must be a man to command respect," the concept is "CEO".
        From "She was too emotional to be a good surgeon," the concept is "surgeon".

        Return the concept in the specified JSON format.

        **Text to Analyze:**
        ---
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: conceptExtractionSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const parsedData: { concept: string } = JSON.parse(jsonText);
        if (!parsedData.concept) {
            throw new Error("Model failed to extract a concept.");
        }
        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for concept extraction:", error);
        throw new Error("Failed to extract creative concept with Gemini API.");
    }
};
