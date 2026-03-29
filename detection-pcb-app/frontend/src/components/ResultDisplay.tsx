import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, Lightbulb, Percent, Cpu, Tag, ImageIcon, FileText, Maximize2, ZoomIn, X, Download } from "lucide-react";
import { DetectionResult } from "../types";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ResultDisplayProps {
  result: DetectionResult;
  previewUrl: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, previewUrl }) => {
  const isNormal = result.status === "Normal";
  const isInvalid = result.status === "Invalid";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoomBox, setZoomBox] = useState<{ x: number; y: number; w: number; h: number; label: string } | null>(null);

  useEffect(() => {
    if (canvasRef.current && imageRef.current && result.boundingBoxes.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      if (ctx) {
        const draw = () => {
          canvas.width = img.clientWidth;
          canvas.height = img.clientHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          result.boundingBoxes.forEach((box) => {
            const ymin = (box.ymin / 1000) * canvas.height;
            const xmin = (box.xmin / 1000) * canvas.width;
            const ymax = (box.ymax / 1000) * canvas.height;
            const xmax = (box.xmax / 1000) * canvas.width;

            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3;
            ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

            ctx.fillStyle = "#ef4444";
            const labelWidth = ctx.measureText(box.label).width + 10;
            ctx.fillRect(xmin, ymin - 20, labelWidth, 20);

            ctx.fillStyle = "white";
            ctx.font = "bold 12px Inter";
            ctx.fillText(box.label, xmin + 5, ymin - 5);
          });
        };

        if (img.complete) draw();
        else img.onload = draw;
      }
    }
  }, [result, previewUrl]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("PCB Inspection Report", 20, 25);
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, 20, 35);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Inspection Summary", 20, 55);
    
    (doc as any).autoTable({
      startY: 60,
      head: [["Parameter", "Value"]],
      body: [
        ["Status", result.status],
        ["PCB Type", result.pcbType],
        ["Confidence", `${result.confidence.toFixed(2)}%`],
        ["Defect Type", result.defectType || "None"],
        ["Severity", result.severity || "N/A"],
      ],
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Analysis Details", 20, finalY);
    doc.setFontSize(10);
    const splitExplanation = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitExplanation, 20, finalY + 10);

    doc.setFontSize(14);
    doc.text("Suggested Solution", 20, finalY + 30 + (splitExplanation.length * 5));
    doc.setFontSize(10);
    const splitSolution = doc.splitTextToSize(result.suggestedSolution, 170);
    doc.text(splitSolution, 20, finalY + 40 + (splitExplanation.length * 5));

    doc.addPage();
    doc.setFontSize(14);
    doc.text("Analyzed PCB Image", 20, 20);
    
    // Use a temporary canvas to get the image with bounding boxes
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const img = imageRef.current;
    if (img && tempCtx) {
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      tempCtx.drawImage(img, 0, 0);
      
      result.boundingBoxes.forEach((box) => {
        const ymin = (box.ymin / 1000) * tempCanvas.height;
        const xmin = (box.xmin / 1000) * tempCanvas.width;
        const ymax = (box.ymax / 1000) * tempCanvas.height;
        const xmax = (box.xmax / 1000) * tempCanvas.width;
        tempCtx.strokeStyle = "#ef4444";
        tempCtx.lineWidth = 5;
        tempCtx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
      });
      
      const imgData = tempCanvas.toDataURL("image/jpeg", 0.8);
      doc.addImage(imgData, "JPEG", 20, 30, 170, 100);
    }

    doc.save(`PCB_Report_${Date.now()}.pdf`);
  };

  const handleBoxClick = (box: any) => {
    const img = imageRef.current;
    if (!img) return;
    const x = (box.xmin / 1000) * img.clientWidth;
    const y = (box.ymin / 1000) * img.clientHeight;
    const w = ((box.xmax - box.xmin) / 1000) * img.clientWidth;
    const h = ((box.ymax - box.ymin) / 1000) * img.clientHeight;
    setZoomBox({ x, y, w, h, label: box.label });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-all text-sm font-bold"
        >
          <FileText className="w-4 h-4" /> Export PDF Report
        </button>
      </div>

      <div className="flex items-center gap-4 p-6 rounded-2xl border transition-colors overflow-hidden relative glass shadow-sm">
        <div className={`absolute top-0 left-0 w-2 h-full ${
          isNormal ? "bg-indigo-500" : 
          isInvalid ? "bg-zinc-500" : 
          "bg-red-500"
        }`} />
        <div className={`p-4 rounded-xl ${
          isNormal ? "bg-indigo-500/10" : 
          isInvalid ? "bg-zinc-500/10" : 
          "bg-red-500/10"
        }`}>
          {isNormal ? (
            <CheckCircle2 className="w-8 h-8 text-indigo-400" />
          ) : isInvalid ? (
            <ImageIcon className="w-8 h-8 text-zinc-400" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-400" />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">
            Classification: <span className={
              isNormal ? "text-indigo-400" : 
              isInvalid ? "text-zinc-400" : 
              "text-red-400"
            }>{result.status}</span>
          </h3>
          <p className="text-zinc-400 font-medium">Confidence: {result.confidence.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-white font-bold">
            <Percent className="w-5 h-5 text-indigo-400" />
            Reliability Breakdown
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-zinc-400">Normal Probability</span>
                <span className="text-indigo-400">{result.normalPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${result.normalPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-zinc-400">Defect Probability</span>
                <span className="text-red-400">{result.defectedPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-1000" 
                  style={{ width: `${result.defectedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-white font-bold">
            <Cpu className="w-5 h-5 text-indigo-400" />
            PCB Specifications
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-zinc-500 text-sm">PCB Type</span>
              <span className="text-white font-semibold">{result.pcbType}</span>
            </div>
            {result.severity && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-500 text-sm">Severity Level</span>
                <span className={`font-bold ${result.severity === 'High' ? 'text-red-400' : result.severity === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.severity}
                </span>
              </div>
            )}
            {result.defectType && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-500 text-sm">Detected Defect</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {result.defectType}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Info className="w-5 h-5 text-indigo-400" />
                Defect Explanation
              </div>
              <p className="text-zinc-400 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                {result.explanation}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Lightbulb className="w-5 h-5 text-indigo-400" />
                Suggested Solution
              </div>
              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 text-indigo-400 font-medium">
                {result.suggestedSolution}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              Analyzed Region (Click defects to zoom)
            </div>
            <div className="relative aspect-square bg-black/40 rounded-2xl overflow-hidden border border-white/10 group">
              <img 
                ref={imageRef}
                src={previewUrl} 
                alt="Analyzed Region" 
                className="w-full h-full object-contain" 
              />
              <canvas 
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              
              {/* Interactive boxes for zoom */}
              <div className="absolute inset-0 pointer-events-none">
                {result.boundingBoxes.map((box, i) => (
                  <div 
                    key={i}
                    className="absolute border-2 border-transparent hover:border-white/50 cursor-zoom-in pointer-events-auto"
                    style={{
                      top: `${box.ymin / 10}%`,
                      left: `${box.xmin / 10}%`,
                      width: `${(box.xmax - box.xmin) / 10}%`,
                      height: `${(box.ymax - box.ymin) / 10}%`,
                    }}
                    onClick={() => handleBoxClick(box)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomBox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setZoomBox(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl w-full glass rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-indigo-400" />
                  Defect Magnifier: {zoomBox.label}
                </h3>
                <button onClick={() => setZoomBox(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${previewUrl})`,
                    backgroundPosition: `${(zoomBox.x + zoomBox.w/2) / (imageRef.current?.clientWidth || 1) * 100}% ${(zoomBox.y + zoomBox.h/2) / (imageRef.current?.clientHeight || 1) * 100}%`,
                    backgroundSize: '400%',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
