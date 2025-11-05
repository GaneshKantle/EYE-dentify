/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Button } from '../ui/button';
import { CanvasSettings } from '../../types/facesketch';
import { 
  X
} from 'lucide-react';

interface FeatureAsset {
  id: string;
  name: string;
  category: string;
  path: string;
  tags: string[];
  description?: string;
}

interface PlacedFeature {
  id: string;
  asset: FeatureAsset;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  selected: boolean;
  locked: boolean;
  visible: boolean;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
}

interface CanvasBoardProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  showGrid: boolean;
  gridSize: number;
  zoom: number;
  panOffset: { x: number; y: number };
  handleCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasDragOver: (e: React.DragEvent<HTMLCanvasElement>) => void;
  handleCanvasDrop: (e: React.DragEvent<HTMLCanvasElement>) => void;
  featurePicker: {
    x: number;
    y: number;
    features: PlacedFeature[];
  } | null;
  onSelectFeatureFromPicker: (featureId: string) => void;
  onCloseFeaturePicker: () => void;
}
const CanvasBoard: React.FC<CanvasBoardProps> = ({
  canvasRef,
  showGrid,
  gridSize,
  zoom,
  panOffset,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasDragOver,
  handleCanvasDrop,
  featurePicker,
  onSelectFeatureFromPicker,
  onCloseFeaturePicker,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-amber-100 to-orange-50 order-1 lg:order-2 min-h-0">
      {/* Canvas Container */}
      <div className="flex-1 flex items-start justify-center p-1 sm:p-2 md:p-3 lg:p-4 overflow-hidden min-h-0">
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {/* Canvas with responsive scaling */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={700}
              className="border-2 border-slate-300 bg-white shadow-xl cursor-crosshair rounded-lg transition-all duration-200 hover:shadow-2xl"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
            />
            
            {/* Zoom level indicator */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-200 shadow-sm">
              <span className="text-xs font-mono text-slate-600">{zoom}%</span>
            </div>

            {/* Grid size indicator */}
            {showGrid && (
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                <span className="text-xs font-mono text-slate-600">Grid: {gridSize}px</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Picker for overlapping features */}
      {featurePicker && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-3 min-w-[200px]"
          style={{
            left: Math.min(featurePicker.x, window.innerWidth - 220),
            top: Math.min(featurePicker.y, window.innerHeight - 200)
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-700">Select Feature</h3>
            <Button
              onClick={onCloseFeaturePicker}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {featurePicker.features.map((feature, index) => (
              <div
                key={feature.id}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSelectFeatureFromPicker(feature.id)}
              >
                <div className="w-8 h-8 bg-slate-100 rounded border flex items-center justify-center">
                  <span className="text-xs text-slate-600 font-medium">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">
                    {feature.asset.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {feature.asset.category} • {feature.width}×{feature.height}px
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  Z:{feature.zIndex}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
            Click on a feature to select it
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasBoard;
