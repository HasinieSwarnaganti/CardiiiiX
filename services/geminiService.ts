
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize AI client
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const geminiService = {
  async analyzeSymptoms(messages: { role: 'user' | 'model', text: string }[]) {
    const ai = getAI();
    const systemInstruction = `
      You are a professional medical assistant powered by AI. 
      Your goal is to help users understand their symptoms and provide general health advice.
      RULES:
      1. ALWAYS start by saying you are an AI assistant and not a doctor.
      2. Ask clarifying questions about symptom duration, severity, and triggers.
      3. Suggest potential non-emergency home care if applicable.
      4. List warning signs that require immediate medical attention.
      5. Use professional medical terminology but explain it clearly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: { systemInstruction, temperature: 0.7 }
    });

    return response.text;
  },

  async interpretVitals(vitals: any) {
    const ai = getAI();
    const prompt = `
      As a medical AI, interpret these rPPG vital signs precisely:
      - Heart Rate: ${vitals.heart_rate || vitals.heartRate} bpm
      - HRV: ${vitals.hrv} ms
      - Blood Pressure: ${vitals.blood_pressure?.systolic || vitals.bloodPressure?.systolic}/${vitals.blood_pressure?.diastolic || vitals.bloodPressure?.diastolic} mmHg
      
      CRITICAL: Use these TAGS for metrics: [BPM: value], [BP: value], [HRV: value].
      
      FORMAT:
      
      ### [REPORT_STATUS] (OPTIMAL | STABLE | ATTENTION)
      
      **Summary:** [1 sentence]
      
      **Clinical Findings:**
      *   [BPM: value] - [Interpretation]
      *   [BP: value] - [Interpretation]
      *   [HRV: value] - [Interpretation]
      
      **Clinical Recommendations:**
      *   [Action 1]
      *   [Action 2]
      
      **AI Verdict:** [Final 10-word summary]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.2 }
    });

    return response.text;
  },

  async analyzeReport(base64Image: string, mimeType: string) {
    const ai = getAI();
    const prompt = `Analyze this medical report image. Identify type, summarize findings, highlight outliers.`;
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ role: 'user', parts: [{ inlineData: { data: base64Image, mimeType } }, { text: prompt }] }]
    });
    return response.text;
  }
};
