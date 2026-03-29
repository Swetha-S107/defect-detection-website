export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
}

export interface DetectionResult {
  status: "Normal" | "Defected" | "Invalid";
  confidence: number;
  normalPercentage: number;
  defectedPercentage: number;
  pcbType: "Single-layer" | "Double-layer" | "Multi-layer" | string;
  defectType: string | null;
  severity: "Low" | "Medium" | "High" | null;
  explanation: string;
  suggestedSolution: string;
  boundingBoxes: BoundingBox[];
}

export type Page = "home" | "settings" | "support" | "history" | "analytics" | "admin" | "camera" | "privacy" | "terms" | "api-docs";

export interface User {
  id: number;
  name: string;
  email: string;
}
