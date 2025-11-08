import { CanvasSettings, PlacedFeature } from './facesketch';

export type SketchPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SketchStatus = 'draft' | 'in-progress' | 'review' | 'completed';

export interface SketchState {
  features: PlacedFeature[];
  canvasSettings: CanvasSettings;
  zoom: number;
  panOffset: { x: number; y: number };
  selectedFeatures: string[];
}

export interface SketchSummary {
  _id: string;
  name: string;
  suspect?: string;
  eyewitness?: string;
  officer?: string;
  date?: string;
  reason?: string;
  description?: string;
  priority?: SketchPriority;
  status?: SketchStatus;
  cloudinary_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SketchDetail extends SketchSummary {
  sketch_state?: SketchState | null;
}

export interface SketchListResponse {
  sketches: SketchSummary[];
}


