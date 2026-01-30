
import React, { useState } from 'react';
import { Upload, FileText, Search, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const ReportAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const analyzeFile = async () => {
    if (!previewUrl || !selectedFile) return;

    setIsAnalyzing(true);
    try {
      const base64Data = previewUrl.split(',')[1];
      const result = await geminiService.analyzeReport(base64Data, selectedFile.type);
      setAnalysis(result || "Could not analyze the report.");
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis("Error analyzing report. Please try a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[400px] text-center group hover:border-blue-400 transition-colors">
            {previewUrl ? (
              <div className="w-full h-full flex flex-col items-center">
                <img 
                  src={previewUrl} 
                  alt="Report Preview" 
                  className="max-h-[300px] w-auto rounded-xl shadow-lg mb-6 border border-slate-100" 
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => {setSelectedFile(null); setPreviewUrl(null); setAnalysis(null);}}
                    className="px-6 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={analyzeFile}
                    disabled={isAnalyzing}
                    className="px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Report'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Medical Report</h3>
                <p className="text-slate-500 mb-8 max-w-[280px]">
                  Upload a clear photo of your lab results, blood work, or doctor's note for AI interpretation.
                </p>
                <label className="cursor-pointer bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl">
                  Select File
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="mt-4 text-xs text-slate-400">Supported: JPG, PNG, WEBP (Max 5MB)</p>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4">
            <AlertCircle size={24} className="text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1 text-sm">How it works</h4>
              <p className="text-blue-800 text-xs leading-relaxed opacity-80">
                Our AI scans the image to identify medical terminology and values. It cross-references normal ranges to help you understand your data before your doctor's visit.
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[500px] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                AI Analysis Results
              </h3>
              {analysis && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                  <CheckCircle2 size={12} />
                  Ready
                </span>
              )}
            </div>

            <div className="flex-1 p-8">
              {!analysis && !isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <ImageIcon size={48} className="opacity-20" />
                  </div>
                  <p className="text-sm font-medium">Analyze a report to see insights here.</p>
                </div>
              ) : isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <Loader2 size={64} className="text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search size={24} className="text-blue-300" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold text-slate-800">Processing Document</h4>
                    <p className="text-sm text-slate-500 animate-pulse">Running advanced OCR and clinical analysis...</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  {analysis?.split('\n').map((line, i) => {
                    if (line.startsWith('#')) return <h4 key={i} className="text-slate-900 font-bold mt-4 mb-2">{line.replace(/#/g, '')}</h4>;
                    if (line.startsWith('*')) return <li key={i} className="text-slate-700 text-sm ml-4 mb-1">{line.replace(/\*/g, '').trim()}</li>;
                    return <p key={i} className="text-slate-700 text-sm mb-3 leading-relaxed">{line}</p>;
                  })}
                </div>
              )}
            </div>
            
            {analysis && (
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors text-sm"
                  onClick={() => window.print()}
                >
                  Download Report Summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalyzer;
