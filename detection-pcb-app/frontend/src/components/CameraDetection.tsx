import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Camera, RefreshCw, AlertCircle, CheckCircle2, Loader2, Play, Square } from "lucide-react";
import { detectPCBDefect } from "../services/gemini";
import { DetectionResult, User } from "../types";
import { ResultDisplay } from "./ResultDisplay";

interface CameraDetectionProps {
  user: User;
}

export const CameraDetection: React.FC<CameraDetectionProps> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelType, setModelType] = useState("gemini-3-flash");

  const startCamera = async (retryCount = 0) => {
    try {
      console.log("Attempting to start camera...");
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: retryCount === 0 ? "environment" : "user", 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
        console.log("Camera started successfully.");
      } else {
        // If ref is not ready, wait a bit and retry once
        if (retryCount < 2) {
          setTimeout(() => startCamera(retryCount + 1), 500);
        } else {
          setError("Video element not ready. Please refresh.");
        }
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setIsStreaming(false);
      if (retryCount === 0) {
        // Try once more with user facing mode
        startCamera(1);
      } else {
        setError(`Camera Error: ${err.message || "Could not access camera"}. Please ensure permissions are granted and you are using a secure connection (HTTPS).`);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setModelType(data.model_type || "gemini-3-flash"))
      .catch(err => console.error("Failed to fetch settings:", err));

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startCamera();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming && !isDetecting && !result) {
      interval = setInterval(() => {
        captureAndDetect();
      }, 5000); // Try to detect every 5 seconds if no result yet
    }
    return () => clearInterval(interval);
  }, [isStreaming, isDetecting, result]);

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    setIsDetecting(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg").split(",")[1];
        
        const data = await detectPCBDefect(base64Data, "image/jpeg", modelType);
        setResult(data);

        // Always save to history
        try {
          const historyRes = await fetch("/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              user_id: user.id,
              image_data: canvas.toDataURL("image/jpeg"), 
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
      }
    } catch (err) {
      console.error("Detection error:", err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Real-Time Inspection</h1>
          <p className="text-zinc-400">Use your camera for instant PCB defect detection and analysis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative aspect-video bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {!isStreaming && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                  <Camera className="w-16 h-16 mb-4 opacity-20" />
                  <p>Initializing camera...</p>
                </div>
              )}
              
              {isDetecting && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <p className="text-white font-bold">Analyzing Live Frame...</p>
                </div>
              )}

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10">
                {isStreaming && (
                  <div className="flex gap-4">
                    <button 
                      onClick={captureAndDetect}
                      disabled={isDetecting}
                      className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                    >
                      <Camera className="w-5 h-5" /> Capture & Analyze
                    </button>
                    {result && (
                      <button 
                        onClick={() => setResult(null)}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10"
                      >
                        <RefreshCw className="w-5 h-5" /> Scan Again
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
                <button 
                  onClick={() => startCamera()}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Camera
                </button>
              </div>
            )}

            <div className="glass p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-400" />
                Inspection Guidelines
              </h3>
              <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                <li>Ensure the PCB is well-lit and clearly visible.</li>
                <li>Keep the camera steady and perpendicular to the board.</li>
                <li>Avoid glare or shadows on the PCB surface.</li>
                <li>The system works best with high-resolution frames.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            {result ? (
              <ResultDisplay result={result} previewUrl={canvasRef.current?.toDataURL("image/jpeg") || ""} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center glass rounded-3xl p-12 text-center border-dashed border-2 border-white/5">
                <div className="w-20 h-20 bg-indigo-500/5 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-500 mb-2">
                  {isStreaming ? "Scanning for PCB..." : "No Analysis Yet"}
                </h3>
                <p className="text-zinc-600 max-w-xs">
                  {isStreaming 
                    ? "Point your camera at a PCB. The system will automatically detect and analyze it every 5 seconds." 
                    : "The camera will automatically start when you are on this page."}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
