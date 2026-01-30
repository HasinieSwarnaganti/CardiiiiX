interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface MedicalReport {
  _id: string;
  extractedText: string;
  aiAnalysis: string;
  uploadedAt: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const geminiService = {
  // Fetch user's medical reports from backend
  async fetchMedicalReports(): Promise<MedicalReport[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/medical/reports`);
      const data = await response.json();
      return data.reports || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  // Enhanced chat with medical context (calls backend)
  async chatWithContext(
    messages: ChatMessage[],
    medicalReports: MedicalReport[]
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, medicalReports })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }
      
      return data.response;
    } catch (error: any) {
      console.error('Chat Error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }
  },

  // Generate personalized diet plan (calls backend)
  async generateDietPlan(
    goal: string,
    medicalReports: MedicalReport[]
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/diet-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, medicalReports })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate diet plan');
      }
      
      return data.response;
    } catch (error: any) {
      console.error('Diet Plan Error:', error);
      throw new Error(error.message || 'Failed to generate diet plan');
    }
  },

  // Get health insights (calls backend)
  async getHealthInsights(medicalReports: MedicalReport[]): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalReports })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate insights');
      }
      
      return data.response;
    } catch (error: any) {
      console.error('Insights Error:', error);
      throw new Error(error.message || 'Failed to generate insights');
    }
  },

  // Legacy symptom analysis (uses chatWithContext)
  async analyzeSymptoms(messages: ChatMessage[]): Promise<string> {
    const reports = await this.fetchMedicalReports();
    return this.chatWithContext(messages, reports);
  },

  // Interpret vital signs
  async interpretVitals(vitals: any): Promise<string> {
    try {
      const prompt = `Interpret these vital signs:
- Heart Rate: ${vitals.heart_rate || vitals.heartRate} bpm
- HRV: ${vitals.hrv} ms
- Blood Pressure: ${vitals.blood_pressure?.systolic || vitals.bloodPressure?.systolic}/${vitals.blood_pressure?.diastolic || vitals.bloodPressure?.diastolic} mmHg

Provide:
- Status (OPTIMAL/STABLE/ATTENTION)
- Clinical findings for each metric
- Recommendations

End with: "⚠️ AI-generated. Consult a healthcare professional."`;

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', text: prompt }],
          medicalReports: []
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to interpret vitals');
      }
      
      return data.response;
    } catch (error: any) {
      console.error('Vitals Error:', error);
      throw new Error('Failed to interpret vitals');
    }
  },

  // Analyze medical report image
  async analyzeReport(base64Image: string, mimeType: string): Promise<string> {
    try {
      // Call backend endpoint that uses Gemini Vision
      const response = await fetch(`${API_BASE_URL}/chat/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, mimeType })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze image');
      }
      
      return data.response;
    } catch (error: any) {
      console.error('Image Analysis Error:', error);
      // Fallback message
      return "Image analysis temporarily unavailable. Please try again later.";
    }
  }
};
