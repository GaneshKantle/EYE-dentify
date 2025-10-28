/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { CanvasSettings } from '../../types/facesketch';
import { 
  ZoomIn, ZoomOut, Grid3X3, Target, Copy, Trash2, X
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
  canvasSettings: CanvasSettings;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  features: PlacedFeature[];
  selectedFeatures: string[];
  zoom: number;
  panOffset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onGridToggle: () => void;
  onSnapToggle: () => void;
  onResetView: () => void;
  onExport: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFeatureSelect?: (featureIds: string[]) => void;
  onFeatureMove?: (featureId: string, x: number, y: number) => void;
  onFeatureDragStart?: (featureId: string, x: number, y: number) => void;
  onFeatureDragEnd?: (featureId: string) => void;
  autoSelectedFeature?: string | null;
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CanvasBoard: React.FC<CanvasBoardProps> = ({
  canvasRef,
  canvasSettings,
  showGrid,
  gridSize,
  snapToGrid,
  zoom,
  panOffset,
  onZoomChange,
  onPanChange,
  onGridToggle,
  onSnapToggle,
  onResetView,
  onExport,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasDragOver,
  handleCanvasDrop,
  featurePicker,
  onSelectFeatureFromPicker,
  onCloseFeaturePicker,

  // ✅ Add these
  features,
  selectedFeatures,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-amber-100 to-orange-50 order-1 lg:order-2 min-h-0">
      {/* Enhanced Toolbar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 p-2 sm:p-3 md:p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1.5 border-2 border-slate-200 shadow-lg">
              <Button 
                onClick={() => onZoomChange(Math.max(zoom - 25, 25))} 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-amber-100 text-amber-700 hover:text-amber-800 transition-all duration-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-800 min-w-[55px] text-center font-mono px-3 py-1 bg-amber-50 rounded-md border border-amber-200 font-semibold">{zoom}%</span>
              <Button 
                onClick={() => onZoomChange(Math.min(zoom + 25, 300))} 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-amber-100 text-amber-700 hover:text-amber-800 transition-all duration-200"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-8 hidden sm:block bg-amber-300" />
            
            {/* Grid Controls */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1.5 border-2 border-slate-200 shadow-lg">
              <Button
                onClick={onGridToggle}
                variant={showGrid ? "default" : "ghost"}
                size="sm"
                className={`h-9 w-9 sm:h-8 sm:w-8 p-0 transition-all duration-200 ${
                  showGrid 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                    : "hover:bg-blue-100 text-blue-700 hover:text-blue-800"
                }`}
                title="Toggle Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={onSnapToggle}
                variant={snapToGrid ? "default" : "ghost"}
                size="sm"
                className={`h-9 w-9 sm:h-8 sm:w-8 p-0 transition-all duration-200 ${
                  snapToGrid 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                    : "hover:bg-blue-100 text-blue-700 hover:text-blue-800"
                }`}
                title="Snap to Grid"
              >
                <Target className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8 hidden sm:block bg-amber-300" />

            {/* Edit Controls */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1.5 border-2 border-slate-200 shadow-lg">
              <Button 
                onClick={() => {}} 
                disabled={false} 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-green-100 text-green-700 hover:text-green-800 disabled:opacity-50 transition-all duration-200" 
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => {}} 
                disabled={false} 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 disabled:opacity-50 transition-all duration-200" 
                title="Delete (Del)"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Transform Controls - Only show when features are selected */}
            {/* The original code had selectedFeatures.length > 0, but selectedFeatures is not passed as a prop.
                Assuming this logic should be removed or adapted if feature selection is intended to be handled here.
                For now, removing the check as selectedFeatures is not available. */}
            {/*
            {selectedFeatures.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-8 hidden sm:block bg-amber-300" />
                <div className="flex items-center space-x-1 bg-white rounded-lg p-1.5 border-2 border-slate-200 shadow-lg">
                  <Button 
                    onClick={() => updateSelectedFeatures({ flipH: !selectedFeature?.flipH })} 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-purple-100 text-purple-700 hover:text-purple-800 transition-all duration-200" 
                    title="Flip Horizontal (H)"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => updateSelectedFeatures({ flipV: !selectedFeature?.flipV })} 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-purple-100 text-purple-700 hover:text-purple-800 transition-all duration-200" 
                    title="Flip Vertical (V)"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={bringToFront} 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-purple-100 text-purple-700 hover:text-purple-800 transition-all duration-200" 
                    title="Bring to Front ([)"
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
            */}
          </div>

          {/* Status Information */}
          {/* <div className="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-4 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline font-medium">Features: {features.length}</span>
              <span className="sm:hidden font-medium">{features.length}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-2">
              <MousePointer2 className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline font-medium">Selected: {selectedFeatures.length}</span>
              <span className="sm:hidden font-medium">{selectedFeatures.length}</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-start justify-center p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden min-h-0">
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
