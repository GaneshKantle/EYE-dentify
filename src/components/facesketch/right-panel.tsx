/*eslint-disable*/
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Maximize2, Minimize2, Layers, Settings, ClipboardList, 
  Eye, EyeOff, Lock, Unlock, Palette, Archive, Hash, 
  MousePointer2, Grid3X3, Target, Crop, Search, Upload, Trash2,
  EyeIcon, Edit3, X, Check, ArrowUp, ArrowDown, FileText
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
  scale: number;
}

interface CaseInfo {
  caseNumber: string;
  date: string;
  officer: string;
  description: string;
  witness: string;
  suspect?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'in-progress' | 'review' | 'completed';
}

interface CanvasSettings {
  backgroundColor: string;
  showRulers: boolean;
  showSafeArea: boolean;
  quality: 'standard' | 'high';
}

interface RightPanelProps {
  rightSidebarCollapsed: boolean;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  features: PlacedFeature[];
  selectedFeatures: string[];
  selectedFeature: PlacedFeature | null;
  featureCategories: any;
  selectedCategory: string;
  filteredAssets: FeatureAsset[];
  caseInfo: CaseInfo;
  setCaseInfo: (info: CaseInfo | ((prev: CaseInfo) => CaseInfo)) => void;
  canvasSettings: CanvasSettings;
  setCanvasSettings: (settings: CanvasSettings | ((prev: CanvasSettings) => CanvasSettings)) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  addFeature: (asset: FeatureAsset) => void;
  toggleVisibility: (featureId: string) => void;
  toggleLock: (featureId: string) => void;
  updateSelectedFeatures: (updates: Partial<PlacedFeature>) => void;
  scaleSelectedFeatures: (scale: number) => void;
  scaleUp: () => void;
  scaleDown: () => void;
  resizeSelectedFeatures: (newWidth: number, newHeight: number) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringFeatureToFront: (featureId: string) => void;
  sendFeatureToBack: (featureId: string) => void;
  duplicateFeature: () => void;
  deleteSelectedFeatures: () => void;
  reorderLayer: (draggedFeatureId: string, targetFeatureId: string) => void;
  exportPNG: () => void;
  saveProject: () => void;
  exportMetadata: () => void;
  uploadedAssets?: any[];
  assetSearchTerm?: string;
  setAssetSearchTerm?: (term: string) => void;
  onAssetSelect?: (asset: any) => void;
  onAssetDelete?: (assetId: string) => void;
  onShowUpload?: () => void;
  onAssetView?: (asset: any) => void;
  onAssetEdit?: (assetId: string, newName: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  rightSidebarCollapsed,
  setRightSidebarCollapsed,
  activeTab,
  setActiveTab,
  features,
  selectedFeatures,
  selectedFeature,
  featureCategories,
  selectedCategory,
  filteredAssets,
  caseInfo,
  setCaseInfo,
  canvasSettings,
  setCanvasSettings,
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  snapToGrid,
  setSnapToGrid,
  addFeature,
  toggleVisibility,
  toggleLock,
  updateSelectedFeatures,
  scaleSelectedFeatures,
  scaleUp,
  scaleDown,
  resizeSelectedFeatures,
  bringToFront,
  sendToBack,
  bringFeatureToFront,
  sendFeatureToBack,
  duplicateFeature,
  deleteSelectedFeatures,
  exportPNG,
  saveProject,
  exportMetadata,
  reorderLayer,
  uploadedAssets = [],
  assetSearchTerm = '',
  setAssetSearchTerm,
  onAssetSelect,
  onAssetDelete,
  onShowUpload,
  onAssetView,
  onAssetEdit
}) => {
  // State for editing
  const [editingAsset, setEditingAsset] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [draggedLayerId, setDraggedLayerId] = React.useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = React.useState<string | null>(null);

  // Edit handlers
  const handleEditStart = (asset: any) => {
    setEditingAsset(asset.id);
    setEditName(asset.name);
  };

  const handleEditSave = () => {
    if (editingAsset && editName.trim()) {
      onAssetEdit?.(editingAsset, editName.trim());
      setEditingAsset(null);
      setEditName('');
    }
  };

  const handleEditCancel = () => {
    setEditingAsset(null);
    setEditName('');
  };

  // Layer drag handlers
  const handleLayerDragStart = (e: React.DragEvent, featureId: string) => {
    // Only allow drag from the layer item itself, not from buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    setDraggedLayerId(featureId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', featureId);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layer', id: featureId }));
    
    // Set drag image opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleLayerDragOver = (e: React.DragEvent, featureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedLayerId || draggedLayerId === featureId) return;
    
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayerId(featureId);
    
    // Get the target element to show insertion indicator
    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midpoint = rect.height / 2;
    
    // Add visual indicator class
    if (y < midpoint) {
      targetElement.classList.add('drag-over-top');
      targetElement.classList.remove('drag-over-bottom');
    } else {
      targetElement.classList.add('drag-over-bottom');
      targetElement.classList.remove('drag-over-top');
    }
  };

  const handleLayerDragLeave = (e: React.DragEvent) => {
    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Only clear if actually leaving the element
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverLayerId(null);
      targetElement.classList.remove('drag-over-top', 'drag-over-bottom');
    }
  };

  const handleLayerDrop = (e: React.DragEvent, targetFeatureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.remove('drag-over-top', 'drag-over-bottom');
    
    if (draggedLayerId && draggedLayerId !== targetFeatureId) {
      reorderLayer(draggedLayerId, targetFeatureId);
    }
    
    // Reset dragged element opacity
    const draggedElement = document.querySelector(`[data-layer-id="${draggedLayerId}"]`) as HTMLElement;
    if (draggedElement) {
      draggedElement.style.opacity = '1';
    }
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleLayerDragEnd = (e: React.DragEvent) => {
    // Reset all elements
    const draggedElement = e.currentTarget as HTMLElement;
    draggedElement.style.opacity = '1';
    draggedElement.classList.remove('drag-over-top', 'drag-over-bottom');
    
    // Clear all drag-over classes from all elements
    document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
      el.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };
  return (
    <div className={`${rightSidebarCollapsed ? 'w-14 sm:w-16 md:w-20 lg:w-24' : 'w-full sm:w-full md:w-72 lg:w-80'} bg-white/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-amber-200 flex flex-col shadow-sm order-3 transition-all duration-300 ease-in-out flex-shrink-0 self-stretch overflow-hidden ${rightSidebarCollapsed ? 'bg-gradient-to-b from-white/95 to-slate-50/90' : ''}`}>
      {/* Panel Header with Toggle */}
      <div className={`${rightSidebarCollapsed ? 'p-1.5 sm:p-2 justify-center' : 'p-2 sm:p-3 md:p-4 justify-between'} border-b border-amber-200 flex items-center transition-all duration-200 flex-shrink-0`}>
        <h3 className={`font-semibold text-slate-800 text-xs sm:text-sm transition-opacity duration-200 ${rightSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          {activeTab === 'properties' && 'Properties Panel'}
          {activeTab === 'layers' && 'Layer Management'}
          {activeTab === 'workspace' && 'Asset Library'}
          {/* {activeTab === 'case' && 'Case Information'} */}
        </h3>
        <Button 
          onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)} 
          variant="outline" 
          size="sm"
          className={`text-slate-600 border-slate-300 flex-shrink-0 transition-all duration-200 ${
            rightSidebarCollapsed ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'
          }`}
          title={rightSidebarCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {rightSidebarCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
        <TabsList className={`grid bg-slate-100 m-1.5 sm:m-2 transition-all duration-200 flex-shrink-0 ${
            rightSidebarCollapsed
              ? 'grid-cols-1 gap-1.5 sm:gap-2 p-1.5 sm:p-2'
            : 'grid-cols-2 sm:grid-cols-4 gap-0.5 sm:gap-1'
        }`}>
          <TabsTrigger 
            value="properties" 
            className={`text-[10px] sm:text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-10 sm:h-12 w-full p-1.5 sm:p-2 flex-col justify-center' : 'h-7 sm:h-8'
            }`}
            title="Properties"
          >
            {rightSidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-1">
                <Settings className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-medium text-slate-700">Props</span>
              </div>
            ) : (
              'Props'
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="layers" 
            className={`text-[10px] sm:text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-10 sm:h-12 w-full p-1.5 sm:p-2 flex-col justify-center' : 'h-7 sm:h-8'
            }`}
            title="Layers"
          >
            {rightSidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-1">
                <Layers className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-medium text-slate-700">Layers</span>
              </div>
            ) : (
              'Layers'
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="workspace" 
            className={`text-[10px] sm:text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-10 sm:h-12 w-full p-1.5 sm:p-2 flex-col justify-center' : 'h-7 sm:h-8'
            }`}
            title="Assets"
          >
            {rightSidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-1">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-medium text-slate-700">Assets</span>
              </div>
            ) : (
              'Assets'
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="case" 
            className={`text-[10px] sm:text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-10 sm:h-12 w-full p-1.5 sm:p-2 flex-col justify-center' : 'h-7 sm:h-8'
            }`}
            title="Case Info"
          >
            {rightSidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-1">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-medium text-slate-700">Case</span>
              </div>
            ) : (
              'Case'
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className={`flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 overflow-hidden flex flex-col min-h-0 data-[state=inactive]:hidden ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="flex-1 overflow-y-auto min-h-0">
            
            {/* Asset Grid Container with Fixed Height */}
            <div className="space-y-2 sm:space-y-3">
              {/* Asset Grid */}
              <div className="grid gap-1.5 sm:gap-2 grid-cols-2">
                {filteredAssets.map((asset) => {
                  // Check if this asset is an uploaded asset (has cloudinary_url or is in uploadedAssets)
                  const isUploadedAsset = uploadedAssets.some(ua => ua.id === asset.id);
                  const uploadedAsset = uploadedAssets.find(ua => ua.id === asset.id);
                  
                  return (
                    <Card 
                      key={asset.id} 
                      className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-amber-300 group bg-white shadow-sm hover:shadow-md relative"
                      draggable={true}
                      onDragStart={(e) => {
                        const payload = JSON.stringify(asset);
                        e.dataTransfer.setData('application/json', payload);
                        e.dataTransfer.setData('text/plain', payload);
                        e.dataTransfer.effectAllowed = 'copy';
                        // Add visual feedback
                        e.currentTarget.style.opacity = '0.5';
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }}
                      onDragEnd={(e) => {
                        // Reset visual feedback
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <CardContent 
                        className="p-1.5 sm:p-2 transition-all duration-200" 
                        onClick={() => addFeature(asset)}
                      >
                        {/* Compact Asset Thumbnail - Fixed display */}
                        <div className="aspect-square bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-1 sm:p-1.5 mb-1.5 sm:mb-2 flex items-center justify-center shadow-inner group-hover:shadow-md transition-all duration-200 overflow-hidden">
                          <img
                            src={asset.path}
                            alt={asset.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                            draggable={false}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        
                        {/* Asset Name - Show edit input if editing */}
                        {isUploadedAsset && editingAsset === asset.id ? (
                          <div className="mb-1.5 sm:mb-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSave();
                                } else if (e.key === 'Escape') {
                                  handleEditCancel();
                                }
                              }}
                              className="w-full text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <div className="flex justify-center gap-1 mt-1">
                              <button
                                onClick={handleEditSave}
                                className="h-4 w-4 sm:h-5 sm:w-5 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center"
                                title="Save"
                              >
                                <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="h-4 w-4 sm:h-5 sm:w-5 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
                                title="Cancel"
                              >
                                <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <h4 className="font-medium text-slate-900 text-center group-hover:text-amber-600 transition-colors text-[10px] sm:text-xs leading-tight mb-0.5 sm:mb-1 px-0.5 line-clamp-2">
                            {asset.name}
                          </h4>
                        )}
                        
                        {/* Asset Tags - Compact Display */}
                        <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center mb-1">
                          {asset.tags.slice(0, 1).map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Action Buttons - Only show for uploaded assets */}
                        {isUploadedAsset && uploadedAsset && (
                          <div className="flex justify-center space-x-0.5 sm:space-x-1 mb-1">
                            <button
                              className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onAssetView?.(uploadedAsset);
                              }}
                              title="View Fullscreen"
                            >
                              <EyeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              className="h-5 w-5 sm:h-6 sm:w-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleEditStart(uploadedAsset);
                              }}
                              title="Edit Name"
                            >
                              <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              className="h-5 w-5 sm:h-6 sm:w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
                                  onAssetDelete?.(asset.id);
                                }
                              }}
                              title="Delete Asset"
                            >
                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        )}
                        
                        {/* Drag Indicator */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Search className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No assets found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms</p>
                </div>
              )}

              {/* Uploaded Assets Section - Only show assets not in main grid */}
              {uploadedAssets.length > 0 && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Uploaded Assets</h3>
                  <div className="grid gap-1.5 sm:gap-2 md:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {uploadedAssets.map(asset => {
                      // Check if asset is already in filteredAssets to avoid duplication
                      const isInMainGrid = filteredAssets.some(a => a.id === asset.id);
                      if (isInMainGrid) return null;
                      
                      return (
                        <Card key={asset.id} className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-amber-300 group bg-white shadow-sm hover:shadow-md relative">
                          <CardContent className="p-2 sm:p-3 transition-all duration-200">
                            {/* Asset Image - Fixed display */}
                            <div className="aspect-square bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-1 sm:p-1.5 mb-2 sm:mb-3 flex items-center justify-center shadow-inner group-hover:shadow-md transition-all duration-200 overflow-hidden">
                              <img
                                src={asset.cloudinary_url}
                                alt={asset.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                                draggable={false}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            
                            {/* Asset Name - Show edit input if editing */}
                            {editingAsset === asset.id ? (
                              <div className="mb-1.5 sm:mb-2">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditSave();
                                    } else if (e.key === 'Escape') {
                                      handleEditCancel();
                                    }
                                  }}
                                  className="w-full text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <div className="flex justify-center gap-1 mt-1">
                                  <button
                                    onClick={handleEditSave}
                                    className="h-4 w-4 sm:h-5 sm:w-5 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center"
                                    title="Save"
                                  >
                                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="h-4 w-4 sm:h-5 sm:w-5 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
                                    title="Cancel"
                                  >
                                    <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <h4 className="font-medium text-slate-900 text-center group-hover:text-amber-600 transition-colors text-[10px] sm:text-xs leading-tight mb-1.5 sm:mb-2 min-h-[1.5rem] sm:min-h-[2rem] flex items-center justify-center px-1">
                                {asset.name}
                              </h4>
                            )}
                            
                            {/* Asset Type Badge */}
                            <div className="flex justify-center mb-1.5 sm:mb-2 md:mb-3">
                              <Badge variant="outline" className="text-[9px] sm:text-xs">
                                {asset.type}
                              </Badge>
                            </div>
                            
                            {/* Action Buttons - Clean and Aesthetic */}
                            <div className="flex justify-center space-x-0.5 sm:space-x-1">
                              <button
                                className="h-6 w-6 sm:h-7 sm:w-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onAssetView?.(asset);
                                }}
                                title="View Fullscreen"
                              >
                                <EyeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                              <button
                                className="h-6 w-6 sm:h-7 sm:w-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEditStart(asset);
                                }}
                                title="Edit Name"
                              >
                                <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                              <button
                                className="h-6 w-6 sm:h-7 sm:w-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (window.confirm(`Are you sure you want to delete "${asset.name}"?`)) {
                                    onAssetDelete?.(asset.id);
                                  }
                                }}
                                title="Delete Asset"
                              >
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Asset Count */}
              <div className="text-center pt-1.5 sm:pt-2 border-t border-slate-100">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  {filteredAssets.length} built-in asset{filteredAssets.length !== 1 ? 's' : ''} available
                  {uploadedAssets.length > 0 && (
                    <span className="ml-1 sm:ml-2 text-green-600">
                      + {uploadedAssets.length} uploaded asset{uploadedAssets.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layers" className={`flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 overflow-hidden flex flex-col min-h-0 data-[state=inactive]:hidden ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {[...features].sort((a, b) => b.zIndex - a.zIndex).map((feature, index) => (
                <div
                  key={feature.id}
                  data-layer-id={feature.id}
                  draggable
                  onDragStart={(e) => handleLayerDragStart(e, feature.id)}
                  onDragOver={(e) => handleLayerDragOver(e, feature.id)}
                  onDragLeave={handleLayerDragLeave}
                  onDrop={(e) => handleLayerDrop(e, feature.id)}
                  onDragEnd={handleLayerDragEnd}
                  className={`flex items-center rounded-lg border transition-all duration-150 cursor-move relative ${
                    selectedFeatures.includes(feature.id)
                      ? 'bg-blue-50 border-blue-200 shadow-md'
                      : dragOverLayerId === feature.id
                      ? 'bg-purple-50 border-purple-300 shadow-lg border-purple-400'
                      : draggedLayerId === feature.id
                      ? 'bg-slate-100 border-slate-400 opacity-40'
                      : 'bg-white hover:bg-slate-50 border-slate-300 shadow-lg'
                  } ${
                    rightSidebarCollapsed ? 'p-2 lg:p-3' : 'p-2 md:p-3'
                  } ${
                    dragOverLayerId === feature.id ? 'ring-2 ring-purple-400' : ''
                  }`}
                  style={{
                    transform: draggedLayerId === feature.id ? 'scale(0.95)' : 'scale(1)',
                  }}
                >
                  {/* Drop indicator line */}
                  {dragOverLayerId === feature.id && (
                    <div className="absolute left-0 right-0 h-0.5 bg-purple-500 rounded-full -top-1 z-10 shadow-lg"></div>
                  )}
                  <div className={`bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-inner flex-shrink-0 ${
                    rightSidebarCollapsed ? 'w-6 h-6 lg:w-8 lg:h-8' : 'w-8 h-8 md:w-10 md:h-10'
                  }`}>
                    <img
                      src={feature.asset.path}
                      alt={feature.asset.name}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </div>
                  {!rightSidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 ml-2 md:ml-3">
                        <p className={`font-medium text-slate-900 truncate ${
                          rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-xs md:text-sm'
                        }`}>{feature.asset.name}</p>
                        <p className="text-xs text-slate-700 hidden sm:block">{feature.asset.category}</p>
                      </div>
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(feature.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className={`hover:bg-slate-200 p-0 ${
                            rightSidebarCollapsed ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6 md:h-7 md:w-7'
                          }`}
                          title={feature.visible ? "Hide" : "Show"}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {feature.visible ? 
                            <Eye className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} /> : 
                            <EyeOff className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} />
                          }
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(feature.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className={`hover:bg-slate-200 p-0 ${
                            rightSidebarCollapsed ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6 md:h-7 md:w-7'
                          }`}
                          title={feature.locked ? "Unlock" : "Lock"}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {feature.locked ? 
                            <Lock className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} /> : 
                            <Unlock className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} />
                          }
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            bringFeatureToFront(feature.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className={`hover:bg-slate-200 p-0 ${
                            rightSidebarCollapsed ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6 md:h-7 md:w-7'
                          }`}
                          title="Bring to Front"
                          onMouseDown={(e) => e.stopPropagation()}
                          disabled={feature.locked}
                        >
                          <ArrowUp className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendFeatureToBack(feature.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className={`hover:bg-slate-200 p-0 ${
                            rightSidebarCollapsed ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6 md:h-7 md:w-7'
                          }`}
                          title="Send to Back"
                          onMouseDown={(e) => e.stopPropagation()}
                          disabled={feature.locked}
                        >
                          <ArrowDown className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="properties" className={`flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 overflow-hidden flex flex-col min-h-0 data-[state=inactive]:hidden ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="flex-1 overflow-y-auto min-h-0">
            {selectedFeature ? (
              <div className={`space-y-4 md:space-y-6 transition-all duration-200 ${
                rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4 md:space-y-6'
              }`}>
                <Card className="border-slate-300 bg-white shadow-lg">
                  <CardHeader className={`pb-3 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'pb-2 lg:pb-3' : 'pb-3'
                  }`}>
                    <CardTitle className={`flex items-center space-x-2 transition-all duration-200 ${
                      rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-sm'
                    } text-slate-900`}>
                      <Settings className={`${rightSidebarCollapsed ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4'}`} />
                      <span className={rightSidebarCollapsed ? 'hidden lg:inline' : ''}>
                        {rightSidebarCollapsed ? 'Props' : 'Transform'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`space-y-4 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4'
                  }`}>
                    {/* Resize Controls - Moved to Top */}
                    <div className="space-y-3">
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Quick Resize
                      </Label>
                      
                      {/* Percentage Input Controls */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Decrease by %</Label>
                          <div className="flex space-x-1">
                            <Input
                              type="number"
                              placeholder="50"
                              className="h-7 text-xs border-slate-300 bg-white"
                              min="1"
                              max="99"
                            />
                            <Button
                              onClick={() => {
                                const input = document.querySelector('input[placeholder="50"]') as HTMLInputElement;
                                const percentage = input.value ? Number(input.value) : 50;
                                const newWidth = selectedFeature.width * (1 - percentage / 100);
                                const newHeight = selectedFeature.height * (1 - percentage / 100);
                                console.log('Quick resize -' + percentage + '% clicked');
                                resizeSelectedFeatures(newWidth, newHeight);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                              title="Decrease size"
                            >
                              -
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Increase by %</Label>
                          <div className="flex space-x-1">
                            <Input
                              type="number"
                              placeholder="50"
                              className="h-7 text-xs border-slate-300 bg-white"
                              min="1"
                              max="200"
                            />
                            <Button
                              onClick={() => {
                                const input = document.querySelector('input[placeholder="50"]:last-of-type') as HTMLInputElement;
                                const percentage = input.value ? Number(input.value) : 50;
                                const newWidth = selectedFeature.width * (1 + percentage / 100);
                                const newHeight = selectedFeature.height * (1 + percentage / 100);
                                console.log('Quick resize +' + percentage + '% clicked');
                                resizeSelectedFeatures(newWidth, newHeight);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-green-300 text-green-600 hover:bg-green-50"
                              title="Increase size"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Preset Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => {
                            console.log('Quick resize -50% clicked');
                            resizeSelectedFeatures(selectedFeature.width * 0.5, selectedFeature.height * 0.5);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                          title="Make 50% smaller"
                        >
                          -50%
                        </Button>
                        <Button
                          onClick={() => {
                            console.log('Quick resize 100% clicked');
                            resizeSelectedFeatures(selectedFeature.width, selectedFeature.height);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                          title="Reset to original size"
                        >
                          100%
                        </Button>
                        <Button
                          onClick={() => {
                            console.log('Quick resize +100% clicked');
                            resizeSelectedFeatures(selectedFeature.width * 2, selectedFeature.height * 2);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                          title="Make 100% bigger"
                        >
                          +100%
                        </Button>
                      </div>
                    </div>

                    {/* Resize Sliders */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Width' : 'Width'}: {selectedFeature.width}px
                      </Label>
                      <Slider
                        value={[selectedFeature.width]}
                        onValueChange={([value]) => resizeSelectedFeatures(value, selectedFeature.height)}
                        min={20}
                        max={800}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Height' : 'Height'}: {selectedFeature.height}px
                      </Label>
                      <Slider
                        value={[selectedFeature.height]}
                        onValueChange={([value]) => resizeSelectedFeatures(selectedFeature.width, value)}
                        min={20}
                        max={800}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {!rightSidebarCollapsed && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-700 font-medium">Width</Label>
                          <Input
                            type="number"
                            value={selectedFeature.width}
                            onChange={(e) => updateSelectedFeatures({ width: Number(e.target.value) })}
                            className="h-8 text-xs border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-700 font-medium">Height</Label>
                          <Input
                            type="number"
                            value={selectedFeature.height}
                            onChange={(e) => updateSelectedFeatures({ height: Number(e.target.value) })}
                            className="h-8 text-xs border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Rot' : 'Rotation'}: {selectedFeature.rotation}°
                      </Label>
                      <Slider
                        value={[selectedFeature.rotation]}
                        onValueChange={([value]) => updateSelectedFeatures({ rotation: value })}
                        min={-180}
                        max={180}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Opac' : 'Opacity'}: {Math.round(selectedFeature.opacity * 100)}%
                      </Label>
                      <Slider
                        value={[selectedFeature.opacity * 100]}
                        onValueChange={([value]) => updateSelectedFeatures({ opacity: value / 100 })}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-300 bg-white shadow-lg">
                  <CardHeader className={`pb-3 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'pb-2 lg:pb-3' : 'pb-3'
                  }`}>
                    <CardTitle className={`flex items-center space-x-2 transition-all duration-200 ${
                      rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-sm'
                    } text-slate-900`}>
                      <Palette className={`${rightSidebarCollapsed ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4'}`} />
                      <span className={rightSidebarCollapsed ? 'hidden lg:inline' : ''}>
                        {rightSidebarCollapsed ? 'App' : 'Appearance'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`space-y-4 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4'
                  }`}>
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Bright' : 'Brightness'}: {selectedFeature.brightness}%
                      </Label>
                      <Slider
                        value={[selectedFeature.brightness]}
                        onValueChange={([value]) => updateSelectedFeatures({ brightness: value })}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Cont' : 'Contrast'}: {selectedFeature.contrast}%
                      </Label>
                      <Slider
                        value={[selectedFeature.contrast]}
                        onValueChange={([value]) => updateSelectedFeatures({ contrast: value })}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Scaling Controls */}
                <Card className="border-slate-300 bg-white shadow-lg">
                  <CardHeader className={`pb-3 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'pb-2 lg:pb-3' : 'pb-3'
                  }`}>
                    <CardTitle className={`flex items-center space-x-2 transition-all duration-200 ${
                      rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-sm'
                    } text-slate-900`}>
                      <Settings className={`${rightSidebarCollapsed ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4'}`} />
                      <span className={rightSidebarCollapsed ? 'hidden lg:inline' : ''}>
                        {rightSidebarCollapsed ? 'Scale' : 'Scaling'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`space-y-4 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4'
                  }`}>
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        {rightSidebarCollapsed ? 'Scale' : 'Scale'}: {Math.round(selectedFeature.scale * 100)}%
                      </Label>
                      <Slider
                        value={[selectedFeature.scale]}
                        onValueChange={([value]) => scaleSelectedFeatures(value)}
                        min={0.5}
                        max={2.0}
                        step={0.05}
                        className="mt-2"
                      />
                    </div>
                    
                    {/* Scale Buttons */}
                    <div className="flex items-center justify-between space-x-2">
                      <Button
                        onClick={scaleDown}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                        title="Scale Down (-)"
                      >
                        <span className="hidden sm:inline">-</span>
                        <span className="sm:hidden">-</span>
                      </Button>
                      <Button
                        onClick={scaleUp}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                        title="Scale Up (+)"
                      >
                        <span className="hidden sm:inline">+</span>
                        <span className="sm:hidden">+</span>
                      </Button>
                    </div>
                    
                    {/* Scale Presets */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => scaleSelectedFeatures(0.5)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                        title="50% Scale"
                      >
                        50%
                      </Button>
                      <Button
                        onClick={() => scaleSelectedFeatures(1.0)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                        title="100% Scale (Default)"
                      >
                        100%
                      </Button>
                      <Button
                        onClick={() => scaleSelectedFeatures(1.5)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                        title="150% Scale"
                      >
                        150%
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600 bg-white border border-slate-300 rounded-lg shadow-lg">
                <MousePointer2 className={`opacity-50 transition-all duration-200 ${
                  rightSidebarCollapsed ? 'w-8 h-8 lg:w-12 lg:h-12' : 'w-12 h-12'
                } mb-4`} />
                <p className={`text-center transition-all duration-200 ${
                  rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-sm'
                } text-slate-700`}>
                  {rightSidebarCollapsed ? 'Select feature' : 'Select a feature to view properties'}
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="case" className={`flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 overflow-hidden flex flex-col min-h-0 data-[state=inactive]:hidden ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="flex-1 overflow-y-auto min-h-0">
            <div className={`space-y-4 md:space-y-6 transition-all duration-200 ${
              rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4 md:space-y-6'
            }`}>
              <Card className="border-slate-300 bg-white shadow-lg">
                <CardHeader className={`pb-3 transition-all duration-200 ${
                  rightSidebarCollapsed ? 'pb-2 lg:pb-3' : 'pb-3'
                }`}>
                  <CardTitle className={`flex items-center space-x-2 transition-all duration-200 ${
                    rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-sm'
                  } text-slate-900`}>
                    <FileText className={`${rightSidebarCollapsed ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4'}`} />
                    <span className={rightSidebarCollapsed ? 'hidden lg:inline' : ''}>
                      Case Information
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-4 transition-all duration-200 ${
                  rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {/* Suspect Name */}
                    <div className="md:col-span-2">
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Suspect Name
                      </Label>
                      <Input
                        value={caseInfo.suspect || ''}
                        onChange={(e) => setCaseInfo({ ...caseInfo, suspect: e.target.value })}
                        placeholder="Enter suspect name"
                        className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}
                      />
                    </div>

                    {/* Case Number */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Case Number
                      </Label>
                      <Input
                        value={caseInfo.caseNumber}
                        onChange={(e) => setCaseInfo({ ...caseInfo, caseNumber: e.target.value })}
                        placeholder="Enter case number"
                        className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={caseInfo.date}
                        onChange={(e) => setCaseInfo({ ...caseInfo, date: e.target.value })}
                        className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}
                      />
                    </div>

                    {/* Officer */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Officer
                      </Label>
                      <Input
                        value={caseInfo.officer}
                        onChange={(e) => setCaseInfo({ ...caseInfo, officer: e.target.value })}
                        placeholder="Enter officer name"
                        className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}
                      />
                    </div>

                    {/* Witness */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Witness
                      </Label>
                      <Input
                        value={caseInfo.witness}
                        onChange={(e) => setCaseInfo({ ...caseInfo, witness: e.target.value })}
                        placeholder="Enter witness name"
                        className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Priority
                      </Label>
                      <Select
                        value={caseInfo.priority}
                        onValueChange={(value) => setCaseInfo({ ...caseInfo, priority: value as CaseInfo['priority'] })}
                      >
                        <SelectTrigger className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div>
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Status
                      </Label>
                      <Select
                        value={caseInfo.status}
                        onValueChange={(value) => setCaseInfo({ ...caseInfo, status: value as CaseInfo['status'] })}
                      >
                        <SelectTrigger className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'h-8 lg:h-9 text-xs lg:text-sm' : 'h-9 text-sm'
                        }`}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <Label className={`text-slate-700 font-medium transition-all duration-200 ${
                        rightSidebarCollapsed ? 'text-xs lg:text-xs' : 'text-xs'
                      }`}>
                        Description
                      </Label>
                      <Textarea
                        value={caseInfo.description}
                        onChange={(e) => setCaseInfo({ ...caseInfo, description: e.target.value })}
                        placeholder="Enter case description"
                        rows={4}
                        className={`mt-1.5 border-slate-300 bg-white transition-all duration-200 ${
                          rightSidebarCollapsed ? 'text-xs lg:text-sm' : 'text-sm'
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightPanel;
