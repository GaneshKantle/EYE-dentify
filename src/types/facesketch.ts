export interface FeatureAsset {
  id: string;
  name: string;
  category: string;
  path: string;
  tags: string[];
  description?: string;
}

export interface PlacedFeature {
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

export interface CaseInfo {
  caseNumber: string;
  date: string;
  officer: string;
  description: string;
  witness: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'in-progress' | 'review' | 'completed';
}

export interface CanvasSettings {
  backgroundColor: string;
  showRulers: boolean;
  showSafeArea: boolean;
  quality: 'standard' | 'high';
  getContextAttributes?: () => any;
}

export interface LeftPanelProps {
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAssetClick: (asset: FeatureAsset) => void;
}

export interface CanvasBoardProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasSettings: CanvasSettings;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  features: PlacedFeature[];
  selectedFeatures: string[];
  selectedFeature: PlacedFeature | null;
  filteredAssets: FeatureAsset[];
  caseInfo: CaseInfo;
  setCaseInfo: (info: CaseInfo | ((prev: CaseInfo) => CaseInfo)) => void;
  featureCategories: any;
  selectedCategory: string;
  autoSelectedFeature: string | null;
}

export interface RightPanelProps {
  rightSidebarCollapsed: boolean;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  features: PlacedFeature[];
  selectedFeatures: string[];
  selectedFeature: PlacedFeature | null;
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
  featureCategories: any;
  selectedCategory: string;
  autoSelectedFeature: string | null;
}
