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
import { 
  Maximize2, Minimize2, Layers, Settings, ClipboardList, 
  Eye, EyeOff, Lock, Unlock, Palette, Archive, Hash, 
  MousePointer2, Grid3X3, Target, Crop, Search, Upload, Trash2,
  EyeIcon, Edit3, X, Check
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
  duplicateFeature: () => void;
  deleteSelectedFeatures: () => void;
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
  duplicateFeature,
  deleteSelectedFeatures,
  exportPNG,
  saveProject,
  exportMetadata,
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
  return (
    <div className={`${rightSidebarCollapsed ? 'w-20 lg:w-24' : 'w-full lg:w-96'} bg-white/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-amber-200 flex flex-col shadow-sm order-3 transition-all duration-300 ease-in-out ${rightSidebarCollapsed ? 'bg-gradient-to-b from-white/95 to-slate-50/90' : ''}`}>
      {/* Panel Header with Toggle */}
      <div className={`${rightSidebarCollapsed ? 'p-2 justify-center' : 'p-3 md:p-4 justify-between'} border-b border-amber-200 flex items-center transition-all duration-200`}>
        <h3 className={`font-semibold text-slate-800 transition-opacity duration-200 ${rightSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          {activeTab === 'workspace' && 'Asset Library'}
          {activeTab === 'layers' && 'Layer Management'}
          {activeTab === 'properties' && 'Properties Panel'}
          {activeTab === 'case' && 'Case Information'}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className={`grid bg-slate-100 m-2 transition-all duration-200 ${
          rightSidebarCollapsed 
            ? 'grid-cols-1 gap-2 p-2' 
            : 'grid-cols-2 lg:grid-cols-4 gap-1'
        }`}>
          <TabsTrigger 
            value="workspace" 
            className={`text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-12 w-full p-2 flex-col justify-center' : 'h-8'
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
            value="layers" 
            className={`text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-12 w-full p-2 flex-col justify-center' : 'h-8'
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
            value="properties" 
            className={`text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-12 w-full p-2 flex-col justify-center' : 'h-8'
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
            value="case" 
            className={`text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-12 w-full p-2 flex-col justify-center' : 'h-8'
            }`}
            title="Case"
          >
            {rightSidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-1">
                <ClipboardList className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-medium text-slate-700">Case</span>
              </div>
            ) : (
              'Case'
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="assets" 
            className={`text-xs transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${
              rightSidebarCollapsed ? 'h-12 w-full p-2 flex-col justify-center' : 'h-8'
            }`}
            title="Upload Assets"
          >
            {rightSidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-1">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-medium text-slate-700">Upload</span>
              </div>
            ) : (
              'Upload'
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className={`flex-1 p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="h-full">
            
            {/* Asset Grid Container with Fixed Height */}
            <div className="space-y-3">
              {/* Asset Grid */}
              <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAssets.map((asset) => (
                  <Card 
                    key={asset.id} 
                    className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-amber-300 group bg-white shadow-sm hover:shadow-md"
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(asset));
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
                      className="p-2 transition-all duration-200" 
                      onClick={() => addFeature(asset)}
                    >
                      {/* Compact Asset Thumbnail */}
                      <div className="aspect-square bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-1.5 mb-2 flex items-center justify-center shadow-inner group-hover:shadow-md transition-all duration-200">
                        <img
                          src={asset.path}
                          alt={asset.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                      
                      {/* Asset Name */}
                      <h4 className="font-medium text-slate-900 text-center group-hover:text-amber-600 transition-colors text-xs leading-tight mb-1">
                        {asset.name}
                      </h4>
                      
                      {/* Asset Tags - Compact Display */}
                      <div className="flex flex-wrap gap-1 justify-center">
                        {asset.tags.slice(0, 1).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Drag Indicator */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Search className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No assets found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms</p>
                </div>
              )}

              {/* Uploaded Assets Section */}
              {uploadedAssets.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Uploaded Assets</h3>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {uploadedAssets.map(asset => (
                      <Card key={asset.id} className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-amber-300 group bg-white shadow-sm hover:shadow-md">
                        <CardContent className="p-3 transition-all duration-200">
                          {/* Asset Image */}
                          <div className="aspect-square bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-1.5 mb-3 flex items-center justify-center shadow-inner group-hover:shadow-md transition-all duration-200">
                            <img
                              src={asset.cloudinary_url}
                              alt={asset.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                              draggable={false}
                            />
                          </div>
                          
                          {/* Asset Name */}
                          <h4 className="font-medium text-slate-900 text-center group-hover:text-amber-600 transition-colors text-xs leading-tight mb-2">
                            {asset.name}
                          </h4>
                          
                          {/* Asset Type Badge */}
                          <div className="flex justify-center mb-3">
                            <Badge variant="outline" className="text-xs">
                              {asset.type}
                            </Badge>
                          </div>
                          
                          {/* Action Buttons - Clean and Aesthetic */}
                          <div className="flex justify-center space-x-1">
                            <button
                              className="h-7 w-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssetView?.(asset);
                              }}
                              title="View Fullscreen"
                            >
                              <EyeIcon className="w-3 h-3" />
                            </button>
                            <button
                              className="h-7 w-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStart(asset);
                              }}
                              title="Edit Name"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              className="h-7 w-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssetDelete?.(asset.id);
                              }}
                              title="Delete Asset"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset Count */}
              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  {filteredAssets.length} built-in asset{filteredAssets.length !== 1 ? 's' : ''} available
                  {uploadedAssets.length > 0 && (
                    <span className="ml-2 text-green-600">
                      + {uploadedAssets.length} uploaded asset{uploadedAssets.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layers" className={`flex-1 p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`flex items-center rounded-lg border transition-all duration-200 ${
                    selectedFeatures.includes(feature.id)
                      ? 'bg-blue-50 border-blue-200 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-300 shadow-lg'
                  } ${
                    rightSidebarCollapsed ? 'p-2 lg:p-3' : 'p-2 md:p-3'
                  }`}
                >
                  <div className={`bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-inner flex-shrink-0 ${
                    rightSidebarCollapsed ? 'w-6 h-6 lg:w-8 lg:h-8' : 'w-8 h-8 md:w-10 md:h-10'
                  }`}>
                    <img
                      src={feature.asset.path}
                      alt={feature.asset.name}
                      className="w-full h-full object-contain"
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
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => toggleVisibility(feature.id)}
                          variant="ghost"
                          size="sm"
                          className={`hover:bg-slate-200 p-0 ${
                            rightSidebarCollapsed ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6 md:h-7 md:w-7'
                          }`}
                          title={feature.visible ? "Hide" : "Show"}
                        >
                          {feature.visible ? 
                            <Eye className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} /> : 
                            <EyeOff className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} />
                          }
                        </Button>
                        <Button
                          onClick={() => toggleLock(feature.id)}
                          variant="ghost"
                          size="sm"
                          className={`hover:bg-slate-200 p-0 ${
                            rightSidebarCollapsed ? 'h-5 w-5 lg:h-6 lg:w-6' : 'h-6 w-6 md:h-7 md:w-7'
                          }`}
                          title={feature.locked ? "Unlock" : "Lock"}
                        >
                          {feature.locked ? 
                            <Lock className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} /> : 
                            <Unlock className={`${rightSidebarCollapsed ? 'w-2.5 h-2.5 lg:w-3 lg:h-3' : 'w-3 md:w-3.5 h-3 md:h-3.5'}`} />
                          }
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="properties" className={`flex-1 p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="h-full">
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

        <TabsContent value="case" className={`flex-1 p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          <ScrollArea className="h-full">
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
                    <ClipboardList className={`${rightSidebarCollapsed ? 'w-3 h-3 lg:w-4 lg:h-4' : 'w-4 h-4'}`} />
                    <span className={rightSidebarCollapsed ? 'hidden lg:inline' : ''}>
                      {rightSidebarCollapsed ? 'Case' : 'Case Information'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-4 transition-all duration-200 ${
                  rightSidebarCollapsed ? 'space-y-3 lg:space-y-4' : 'space-y-4'
                }`}>
                  {!rightSidebarCollapsed && (
                    <>
                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Case Number</Label>
                        <Input
                          value={caseInfo.caseNumber}
                          onChange={(e) => setCaseInfo(prev => ({ ...prev, caseNumber: e.target.value }))}
                          className="h-8 text-xs mt-1 border-slate-300 bg-white"
                          placeholder="Enter case number..."
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Date</Label>
                        <Input
                          type="date"
                          value={caseInfo.date}
                          onChange={(e) => setCaseInfo(prev => ({ ...prev, date: e.target.value }))}
                          className="h-8 text-xs mt-1 border-slate-300 bg-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Officer</Label>
                        <Input
                          value={caseInfo.officer}
                          onChange={(e) => setCaseInfo(prev => ({ ...prev, officer: e.target.value }))}
                          className="h-8 text-xs mt-1 border-slate-300 bg-white"
                          placeholder="Officer name..."
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Witness</Label>
                        <Input
                          value={caseInfo.witness}
                          onChange={(e) => setCaseInfo(prev => ({ ...prev, witness: e.target.value }))}
                          className="h-8 text-xs mt-1 border-slate-300 bg-white"
                          placeholder="Witness name..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-700 font-medium">Priority</Label>
                          <select
                            value={caseInfo.priority}
                            onChange={(e) => setCaseInfo(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                            className="h-8 text-xs mt-1 border border-slate-300 rounded-md px-2 bg-white w-full"
                            title="Select priority level"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-slate-700 font-medium">Status</Label>
                          <select
                            value={caseInfo.status}
                            onChange={(e) => setCaseInfo(prev => ({ ...prev, status: e.target.value as 'draft' | 'in-progress' | 'review' | 'completed' }))}
                            className="h-8 text-xs mt-1 border border-slate-300 rounded-md px-2 bg-white w-full"
                            title="Select case status"
                          >
                            <option value="draft">Draft</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Description</Label>
                        <textarea
                          value={caseInfo.description}
                          onChange={(e) => setCaseInfo(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full h-20 text-xs mt-1 p-2 border border-slate-300 rounded-md resize-none bg-white"
                          placeholder="Case description and notes..."
                        />
                      </div>
                    </>
                  )}

                  {/* Compact view for collapsed state */}
                  {rightSidebarCollapsed && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-200 shadow-inner">
                          <Hash className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-xs font-medium text-slate-900">{caseInfo.caseNumber || 'No Case'}</p>
                        <p className="text-xs text-slate-700">{caseInfo.priority}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Features:</span>
                          <span className="font-medium text-slate-900">{features.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Status:</span>
                          <span className="font-medium text-slate-900">{caseInfo.status}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Canvas Settings - Only show when expanded */}
              {!rightSidebarCollapsed && (
                <>
                  <Card className="border-slate-300 bg-white shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2 text-slate-900">
                        <Settings className="w-4 h-4" />
                        <span>Canvas Settings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Background Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            type="color"
                            value={canvasSettings.backgroundColor}
                            onChange={(e) => setCanvasSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-8 h-8 rounded border border-slate-300 bg-white"
                            title="Select background color"
                          />
                          <Input
                            value={canvasSettings.backgroundColor}
                            onChange={(e) => setCanvasSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="h-8 text-xs flex-1 border-slate-300 bg-white"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Grid Size: {gridSize}px</Label>
                        <Slider
                          value={[gridSize]}
                          onValueChange={([value]) => setGridSize(value)}
                          min={10}
                          max={50}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-700 font-medium">Show Grid</Label>
                          <Button
                            onClick={() => setShowGrid(!showGrid)}
                            variant={showGrid ? "default" : "outline"}
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Grid3X3 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-700 font-medium">Snap to Grid</Label>
                          <Button
                            onClick={() => setSnapToGrid(!snapToGrid)}
                            variant={snapToGrid ? "default" : "outline"}
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Target className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-700 font-medium">Show Rulers</Label>
                          <Button
                            onClick={() => setCanvasSettings(prev => ({ ...prev, showRulers: !prev.showRulers }))}
                            variant={canvasSettings.showRulers ? "default" : "outline"}
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Hash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-700 font-medium">Safe Area</Label>
                          <Button
                            onClick={() => setCanvasSettings(prev => ({ ...prev, showSafeArea: !prev.showSafeArea }))}
                            variant={canvasSettings.showSafeArea ? "default" : "outline"}
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Crop className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-700 font-medium">Export Quality</Label>
                        <select
                          value={canvasSettings.quality}
                          onChange={(e) => setCanvasSettings(prev => ({ ...prev, quality: e.target.value as 'standard' | 'high' }))}
                          className="w-full h-8 text-xs mt-1 border border-slate-300 rounded-md px-2 bg-white"
                          title="Select export quality"
                        >
                          <option value="standard">Standard (1x)</option>
                          <option value="high">High Quality (2x)</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-300 bg-white shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2 text-slate-900">
                        <Archive className="w-4 h-4" />
                        <span>Project Statistics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">Total Features:</span>
                          <span className="font-mono text-slate-900">{features.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">Visible Features:</span>
                          <span className="font-mono text-slate-900">{features.filter(f => f.visible).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">Locked Features:</span>
                          <span className="font-mono text-slate-900">{features.filter(f => f.locked).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-medium">Canvas Size:</span>
                          <span className="font-mono text-slate-900">600 × 700</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

            <TabsContent value="assets" className={`flex-1 p-2 md:p-3 lg:p-4 m-0 transition-all duration-200 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          {/* DEBUG: Assets tab is rendering */}
          <div className="bg-green-100 p-2 border-2 border-green-500 rounded mb-4">
            <p className="text-sm font-bold text-green-800">✅ ASSETS TAB IS RENDERING</p>
          </div>
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {/* DEBUG: Show what we're receiving */}
                  <div className="bg-red-100 p-3 border-2 border-red-500 rounded">
                    <h3 className="text-lg font-bold text-red-800">DEBUG: Assets Tab Active</h3>
                    <p className="text-sm">uploadedAssets.length: {uploadedAssets.length}</p>
                    <p className="text-sm">assetSearchTerm: "{assetSearchTerm}"</p>
                    <p className="text-sm">selectedCategory: "{selectedCategory}"</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Asset Library</h3>
                    <Button onClick={onShowUpload} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assets by name..."
                    value={assetSearchTerm}
                    onChange={(e) => setAssetSearchTerm?.(e.target.value)}
                    className="pl-10 h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {uploadedAssets.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>No assets found</p>
                    <p className="text-xs mt-2">Upload assets to see action buttons</p>
                  </div>
                ) : (
                  <div className="col-span-2 text-xs text-green-600 mb-2">
                    Found {uploadedAssets.length} assets with action buttons
                  </div>
                )}
                {uploadedAssets.length > 0 && (
                  uploadedAssets.map(asset => (
                    <Card key={asset.id} className="p-4 border-2 border-red-500 bg-yellow-100">
                      <div className="space-y-3">
                        {/* DEBUG: Asset Info */}
                        <div className="bg-blue-100 p-2 rounded">
                          <p className="text-sm font-bold text-blue-800">DEBUG: Asset Card</p>
                          <p className="text-xs">ID: {asset.id}</p>
                          <p className="text-xs">Name: {asset.name}</p>
                          <p className="text-xs">Type: {asset.type}</p>
                        </div>
                        
                        {/* DEBUG: Action Buttons */}
                        <div className="bg-green-100 p-2 rounded">
                          <p className="text-sm font-bold text-green-800 mb-2">DEBUG: Action Buttons</p>
                          <div className="flex justify-center space-x-2">
                            <button
                              className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('VIEW BUTTON CLICKED!');
                                onAssetView?.(asset);
                              }}
                            >
                              👁️ VIEW
                            </button>
                            <button
                              className="h-10 px-4 bg-green-500 hover:bg-green-600 text-white rounded font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('EDIT BUTTON CLICKED!');
                                handleEditStart(asset);
                              }}
                            >
                              ✏️ EDIT
                            </button>
                            <button
                              className="h-10 px-4 bg-red-500 hover:bg-red-600 text-white rounded font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('DELETE BUTTON CLICKED!');
                                onAssetDelete?.(asset.id);
                              }}
                            >
                              🗑️ DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightPanel;
