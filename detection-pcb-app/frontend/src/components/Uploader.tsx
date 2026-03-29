import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { DetectionResult, User } from "../types";
import { ResultDisplay } from "./ResultDisplay";
import { detectPCBDefect } from "../services/gemini";
import confetti from "canvas-confetti";

interface UploaderProps {
  user: User;
}

export const Uploader: React.FC<UploaderProps> = ({ user }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelType, setModelType] = useState("gemini-3-flash");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setModelType(data.model_type || "gemini-3-flash"))
      .catch(err => console.error("Failed to fetch settings:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const detectDefect = async () => {
    if (!selectedImage) return;

    setIsDetecting(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedImage);
      
      const base64Data = await base64Promise;
      const data = await detectPCBDefect(base64Data, selectedImage.type, modelType);
      setResult(data);

      if (data.status === "Normal") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#10b981']
        });
      }

      // Always save to history
      try {
        const historyRes = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user_id: user.id,
            image_data: reader.result as string, 
            result: data 
          })
        });
        if (!historyRes.ok) {
          console.error("Failed to save history:", await historyRes.text());
        } else {
          console.log("History saved successfully.");
        }
      } catch (historyErr) {
        console.error("Error saving history:", historyErr);
      }
    } catch (err: any) {
      console.error("Detection error:", err);
      setError("Detection failed. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <section id="uploader" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Upload PCB for Detection</h2>
          <p className="text-zinc-400">
            Upload a high-resolution image of your PCB for instant defect analysis.
          </p>
        </div>

        <div className="glass rounded-3xl border-2 border-dashed border-white/10 p-8 shadow-2xl">
          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-16 cursor-pointer hover:bg-indigo-500/10 transition-colors rounded-2xl group"
            >
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">Click or drag image to upload</p>
              <p className="text-zinc-500 text-sm">PNG, JPG or JPEG (Max 10MB)</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/10">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full shadow-lg hover:bg-black/80 transition-colors border border-white/10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={detectDefect}
                  disabled={isDetecting}
                  className="px-10 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Detect Defect
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        {result && <ResultDisplay result={result} previewUrl={previewUrl!} />}
      </div>
    </section>
  );
};
