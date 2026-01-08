/*eslint-disable*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card } from '../ui/card';
import { 
  Save, Download, Undo2, Redo2, FileText, User, Hash, Eye, Minus, Triangle, Smile, Waves, Zap, LucideIcon,
  ChevronDown, Calendar, Settings, Upload, Plus, X, ZoomIn, ZoomOut, Grid3X3, Target, Copy, Trash2, Clock, Loader2,
  Headphones, Circle, PanelLeftOpen, PanelRightOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Import the new separated components
import LeftPanel from './left-panel';
import RightPanel from './right-panel';
import CanvasBoard from './canva-board';
import SaveSketchModal from './SaveSketchModal';
import { 
  FeatureAsset, 
  PlacedFeature, 
  CaseInfo
} from '../../types/facesketch';
import { Asset, AssetUpload as AssetUploadType } from '../../types/asset';
import { apiClient } from '../../lib/api';
import { getSketchById, invalidateSketchDetail, invalidateSketchList, listSketches } from '../../lib/sketchService';
import { loadAssets, getCachedAssets, invalidateAssetsCache, getCategoryCounts } from '../../lib/assetService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';


const createInitialCaseInfo = (): CaseInfo => ({
  caseNumber: '',
  date: new Date().toISOString().split('T')[0],
  officer: '',
  description: '',
  witness: '',
  suspect: '',
  priority: 'medium',
  status: 'draft',
});

const createInitialSaveDetails = () => ({
  name: '',
  suspect: '',
  eyewitness: '',
  officer: '',
  date: new Date().toISOString().split('T')[0],
  reason: '',
  description: '',
  priority: 'normal',
  status: 'draft',
});

const createInitialCanvasSettings = () => ({
  backgroundColor: '#ffffff',
  showRulers: false,
  showSafeArea: false,
  quality: 'high' as 'standard' | 'high',
});

/**
 * Extracts saveDetails from database response (sketchData and sketchState)
 * This ensures database is the single source of truth for saveDetails
 * Handles both sketch_state.saveDetails and top-level fields
 */
const extractSaveDetailsFromSketch = (
  sketchData: {
    name?: string;
    suspect?: string;
    eyewitness?: string;
    officer?: string;
    date?: string;
    reason?: string;
    description?: string;
    priority?: string;
    status?: string;
  },
  sketchState?: any
): {
  name: string;
  suspect: string;
  eyewitness: string;
  officer: string;
  date: string;
  reason: string;
  description: string;
  priority: string;
  status: string;
} => {
  // Prefer saveDetails from sketch_state if available (most accurate)
  if (sketchState?.saveDetails) {
    return {
      ...createInitialSaveDetails(),
      ...sketchState.saveDetails
    };
  }
  
  // Fallback to top-level sketchData fields
  return {
    name: sketchData.name || '',
    suspect: sketchData.suspect || '',
    eyewitness: sketchData.eyewitness || '',
    officer: sketchData.officer || '',
    date: sketchData.date ? new Date(sketchData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    reason: sketchData.reason || '',
    description: sketchData.description || '',
    priority: sketchData.priority || 'normal',
    status: sketchData.status || 'draft',
  };
};

const FaceSketch: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [features, setFeatures] = useState<PlacedFeature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('face-shapes');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<PlacedFeature[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('properties');
  // Initialize panels as closed on mobile screens
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [autoSelectedFeature, setAutoSelectedFeature] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ 
    mouseX: 0, 
    mouseY: 0, 
    featureX: 0, 
    featureY: 0, 
    width: 0, 
    height: 0 
  });
  
  // Performance optimization: use refs to store pending updates during drag/resize
  const pendingFeaturesRef = useRef<PlacedFeature[] | null>(null);
  const rafUpdateRef = useRef<number | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadedSketchIdRef = useRef<string | null>(null);

  const [caseInfo, setCaseInfo] = useState<CaseInfo>(() => createInitialCaseInfo());

  const [canvasSettings, setCanvasSettings] = useState(createInitialCanvasSettings);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedSketchId = searchParams.get('id');
  const isNewSketchRequested = searchParams.get('mode') === 'new';

  // Asset category configuration - stable constant (moved to ref for stability)
  const assetCategoriesConfigRef = useRef<Record<string, {
    name: string;
    icon: LucideIcon;
    color: string;
  }>>({
    'face-shapes': {
      name: 'Face Shapes',
      icon: User,
      color: 'bg-blue-100 text-blue-700'
    },
    'eyes': {
      name: 'Eyes',
      icon: Eye,
      color: 'bg-green-100 text-green-700'
    },
    'eyebrows': {
      name: 'Eyebrows',
      icon: Minus,
      color: 'bg-purple-100 text-purple-700'
    },
    'nose': {
      name: 'Nose',
      icon: Triangle,
      color: 'bg-orange-100 text-orange-700'
    },
    'lips': {
      name: 'Lips',
      icon: Smile,
      color: 'bg-pink-100 text-pink-700'
    },
    'hair': {
      name: 'Hair',
      icon: Waves,
      color: 'bg-yellow-100 text-yellow-700'
    },
    'facial-hair': {
      name: 'Facial Hair',
      icon: Zap,
      color: 'bg-gray-100 text-gray-700'
    },
    'ears': {
      name: 'Ears',
      icon: Headphones,
      color: 'bg-teal-100 text-teal-700'
    },
    'neck': {
      name: 'Neck',
      icon: Circle,
      color: 'bg-cyan-100 text-cyan-700'
    },
    'accessories': {
      name: 'More',
      icon: Settings,
      color: 'bg-indigo-100 text-indigo-700'
    }
  });

  // Keep state for dynamic updates (renaming categories)
  const [assetCategories, setAssetCategories] = useState(assetCategoriesConfigRef.current);

  // Helper function to build categories from assets data
  const buildCategoriesFromAssets = useCallback((assets: any[]): Record<string, {
    name: string;
    icon: LucideIcon;
    color: string;
    assets: FeatureAsset[];
  }> => {
    const categories: Record<string, {
      name: string;
      icon: LucideIcon;
      color: string;
      assets: FeatureAsset[];
    }> = {};

    // Use current assetCategories state to get latest names (including renames)
    const categoryConfig = assetCategories;

    // Initialize all categories with empty assets
    Object.entries(categoryConfig).forEach(([categoryKey, config]) => {
      categories[categoryKey] = {
        name: config.name,
        icon: config.icon,
        color: config.color,
        assets: []
      };
    });

    // Add assets to their respective categories
    assets.forEach((asset: any) => {
      if (categories[asset.type]) {
        const featureAsset: FeatureAsset = {
          id: asset.id,
          name: asset.name,
          path: asset.cloudinary_url,
          category: asset.type,
          tags: asset.tags || [],
          description: asset.description
        };
        categories[asset.type].assets.push(featureAsset);
      }
    });

    return categories;
  }, [assetCategories]);

  // Initialize from cache immediately for instant loading
  const cachedAssets = getCachedAssets();
  // Build initial categories helper (before state is available)
  const buildInitialCategories = (assets: any[], config: Record<string, { name: string; icon: LucideIcon; color: string }>) => {
    const categories: Record<string, { name: string; icon: LucideIcon; color: string; assets: FeatureAsset[] }> = {};
    Object.entries(config).forEach(([categoryKey, categoryConfig]) => {
      categories[categoryKey] = {
        name: categoryConfig.name,
        icon: categoryConfig.icon,
        color: categoryConfig.color,
        assets: []
      };
    });
    assets.forEach((asset: any) => {
      if (categories[asset.type]) {
        categories[asset.type].assets.push({
          id: asset.id,
          name: asset.name,
          path: asset.cloudinary_url,
          category: asset.type,
          tags: asset.tags || [],
          description: asset.description
        });
      }
    });
    return categories;
  };
  const initialCategories = cachedAssets 
    ? buildInitialCategories(cachedAssets.data, assetCategoriesConfigRef.current)
    : {};

  // Dynamic asset loading system
  const [featureCategories, setFeatureCategories] = useState<Record<string, {
    name: string;
    icon: LucideIcon;
    color: string;
    assets: FeatureAsset[];
  }>>(initialCategories);
  const [assetsLoading, setAssetsLoading] = useState(!cachedAssets); // Only loading if no cache
  const [assetsError, setAssetsError] = useState<string | null>(null);

  // Asset management state
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);
  const [showAssetUpload, setShowAssetUpload] = useState(false);
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [filteredUploadedAssets, setFilteredUploadedAssets] = useState<Asset[]>([]);
  
  // Save sketch modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSketchId, setCurrentSketchId] = useState<string | null>(null);
  const [isLoadingSketch, setIsLoadingSketch] = useState(false);
  const [lastSavedStateHash, setLastSavedStateHash] = useState<string>('');
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localStorageSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notifications = useNotifications();
  const { isOnline } = useOnlineStatus();
  const [saveDetails, setSaveDetails] = useState(createInitialSaveDetails);
  const hasRestoredFromLocalStorageRef = useRef<boolean>(false);

  const resetSketchState = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    loadedSketchIdRef.current = null;
    setFeatures([]);
    setSelectedFeatures([]);
    setHistory([]);
    setHistoryIndex(-1);
    setPanOffset({ x: 0, y: 0 });
    setZoom(100);
    setCurrentSketchId(null);
    setLastSavedStateHash('');
    setCaseInfo(createInitialCaseInfo());
    setCanvasSettings(createInitialCanvasSettings());
    setAutoSelectedFeature(null);
    setSaveDetails(createInitialSaveDetails());
  }, []);

  // localStorage persistence functions
  const getLocalStorageKey = useCallback(() => {
    return `sketch_draft_${currentSketchId || 'new'}`;
  }, [currentSketchId]);

  const saveToLocalStorage = useCallback(() => {
    try {
      const sketchState = {
        features: features.map(f => ({
          id: f.id,
          asset: {
            id: f.asset.id,
            name: f.asset.name,
            category: f.asset.category,
            path: f.asset.path,
            tags: f.asset.tags || [],
            description: f.asset.description
          },
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          rotation: f.rotation,
          opacity: f.opacity,
          zIndex: f.zIndex,
          locked: f.locked,
          visible: f.visible,
          flipH: f.flipH,
          flipV: f.flipV,
          brightness: f.brightness,
          contrast: f.contrast,
          scale: f.scale
        })),
        canvasSettings,
        zoom,
        panOffset,
        selectedFeatures,
        caseInfo,
        saveDetails,
        timestamp: Date.now()
      };
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(sketchState));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [features, zoom, panOffset, canvasSettings, selectedFeatures, caseInfo, saveDetails, getLocalStorageKey]);

  const restoreFromLocalStorage = useCallback(() => {
    if (hasRestoredFromLocalStorageRef.current) {
      return false;
    }
    
    try {
      const key = getLocalStorageKey();
      const saved = localStorage.getItem(key);
      if (!saved) {
        return false;
      }

      const sketchState = JSON.parse(saved);
      
      if (sketchState.features && Array.isArray(sketchState.features)) {
        const restoredFeatures: PlacedFeature[] = sketchState.features.map((f: any) => ({
          id: f.id,
          asset: {
            id: f.asset.id,
            name: f.asset.name,
            path: f.asset.path,
            category: f.asset.category,
            tags: f.asset.tags || [],
            description: f.asset.description
          },
          x: f.x || 0,
          y: f.y || 0,
          width: f.width || 100,
          height: f.height || 100,
          rotation: f.rotation || 0,
          opacity: f.opacity ?? 1,
          zIndex: f.zIndex ?? 0,
          selected: false,
          locked: f.locked || false,
          visible: f.visible !== undefined ? f.visible : true,
          flipH: f.flipH || false,
          flipV: f.flipV || false,
          brightness: f.brightness ?? 100,
          contrast: f.contrast ?? 100,
          scale: f.scale ?? 1
        }));

        setFeatures(restoredFeatures);
        const snapshot = restoredFeatures.map(feature => ({
          ...feature,
          asset: { ...feature.asset },
        }));
        setHistory([snapshot]);
        setHistoryIndex(0);
      }

      if (sketchState.zoom !== undefined) {
        setZoom(sketchState.zoom);
      }
      if (sketchState.panOffset) {
        setPanOffset(sketchState.panOffset);
      }
      if (sketchState.canvasSettings) {
        setCanvasSettings({
          ...createInitialCanvasSettings(),
          ...sketchState.canvasSettings
        });
      }
      if (sketchState.selectedFeatures) {
        setSelectedFeatures(sketchState.selectedFeatures);
      }
      if (sketchState.caseInfo) {
        setCaseInfo({
          ...createInitialCaseInfo(),
          ...sketchState.caseInfo
        });
      }
      if (sketchState.saveDetails) {
        setSaveDetails({
          ...createInitialSaveDetails(),
          ...sketchState.saveDetails
        });
      }

      hasRestoredFromLocalStorageRef.current = true;
      return true;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      return false;
    }
  }, [getLocalStorageKey]);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(getLocalStorageKey());
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [getLocalStorageKey]);

  // Reload assets function for real-time updates - optimized with cache
  const reloadAssets = useCallback(async (force = false) => {
    try {
      // Check cache first - instant return if valid
      const cache = getCachedAssets();
      if (!force && cache) {
        const categories = buildCategoriesFromAssets(cache.data);
        setFeatureCategories(categories);
        setUploadedAssets(cache.data);
        setAssetsLoading(false);
        setAssetsError(null);
        return;
      }

      // Only show loading if we don't have cache
      if (!cache) {
        setAssetsLoading(true);
      }
      setAssetsError(null);

      // Load assets from API (uses cache internally)
      const uploadedAssetsData = await loadAssets(force);
      
      // Update state with fresh data
      setUploadedAssets(uploadedAssetsData);
      const categories = buildCategoriesFromAssets(uploadedAssetsData);
      setFeatureCategories(categories);
      setAssetsLoading(false);
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssetsError('Failed to load assets. Please refresh the page.');
      setAssetsLoading(false);
    }
  }, [buildCategoriesFromAssets]);

  // Category management functions
  const handleRenameCategory = useCallback((categoryKey: string, newName: string) => {
    if (!newName.trim()) return;
    
    const trimmedName = newName.trim();
    
    // Update ref to persist rename
    if (assetCategoriesConfigRef.current[categoryKey]) {
      assetCategoriesConfigRef.current[categoryKey] = {
        ...assetCategoriesConfigRef.current[categoryKey],
        name: trimmedName
      };
    }
    
    setAssetCategories(prev => {
      if (!prev[categoryKey]) return prev;
      return {
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          name: trimmedName
        }
      };
    });
    
    // Update featureCategories to reflect the name change
    setFeatureCategories(prev => {
      if (!prev[categoryKey]) return prev;
      return {
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          name: trimmedName
        }
      };
    });
  }, []);

  const handleDeleteCategory = useCallback((categoryKey: string) => {
    // Don't allow deleting if it's the currently selected category
    if (selectedCategory === categoryKey) {
      setSelectedCategory('face-shapes');
    }
    
    setAssetCategories(prev => {
      const updated = { ...prev };
      delete updated[categoryKey];
      return updated;
    });
    
    // Update featureCategories to remove the category
    setFeatureCategories(prev => {
      const updated = { ...prev };
      delete updated[categoryKey];
      return updated;
    });
  }, [selectedCategory]);

  // Load assets dynamically - only if cache is missing/expired
  useEffect(() => {
    const cache = getCachedAssets();
    if (!cache) {
      // Only fetch if no cache exists
      reloadAssets(false);
    } else {
      // Cache exists, ensure state is synced
      const categories = buildCategoriesFromAssets(cache.data);
      setFeatureCategories(categories);
      setUploadedAssets(cache.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount


  // Filter uploaded assets based on search term
  useEffect(() => {
    let filtered = uploadedAssets;
    
    if (assetSearchTerm) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(asset => asset.type === selectedCategory);
    }
    
    setFilteredUploadedAssets(filtered);
  }, [uploadedAssets, assetSearchTerm, selectedCategory]);

  useEffect(() => {
    if (!isNewSketchRequested) {
      return;
    }
    resetSketchState();
    setIsLoadingSketch(false);
    const params = new URLSearchParams(location.search);
    params.delete('mode');
    params.delete('id');
    const next = params.toString();
    navigate(next ? `/sketch?${next}` : '/sketch', { replace: true });
  }, [isNewSketchRequested, location.search, navigate, resetSketchState]);

  useEffect(() => {
    if (!requestedSketchId && currentSketchId) {
      resetSketchState();
    }
    if (!requestedSketchId) {
      loadedSketchIdRef.current = null;
    }
  }, [requestedSketchId, currentSketchId, resetSketchState]);

  // Asset upload handler
  const handleAssetUpload = async (uploadData: AssetUploadType) => {
    try {
      const formData = new FormData();
      formData.append('name', uploadData.name);
      formData.append('type', uploadData.type);
      formData.append('description', uploadData.description || '');
      formData.append('tags', JSON.stringify(uploadData.tags));
      formData.append('file', uploadData.file);

      await apiClient.directUploadFile<any>('/assets/upload', formData);
      setShowAssetUpload(false);
      // Invalidate cache and reload assets to show new upload in real-time
      invalidateAssetsCache();
      await reloadAssets(true);
      notifications.success('Asset uploaded', 'Your asset is now available.');
    } catch (error) {
      console.error('Upload error:', error);
      notifications.error('Upload failed', 'Failed to upload asset. Please try again.');
    }
  };

  // Asset delete handler
  const handleAssetDelete = async (assetId: string) => {
    try {
      await apiClient.directDelete(`/assets/${assetId}`);
      // Invalidate cache and reload assets to update both featureCategories and uploadedAssets in real-time
      invalidateAssetsCache();
      await reloadAssets(true);
      notifications.success('Asset deleted', 'Asset has been removed.');
    } catch (error) {
      console.error('Delete error:', error);
      notifications.error('Delete failed', 'Failed to delete asset. Please try again.');
    }
  };

  // Asset select handler
  const handleAssetSelect = (asset: Asset) => {
    const featureAsset: FeatureAsset = {
      id: asset.id,
      name: asset.name,
      path: asset.cloudinary_url,
      category: asset.type,
      tags: asset.tags,
      description: asset.description
    };
    addFeature(featureAsset);
  };

  // Asset view handler (fullscreen)
  const [fullscreenAsset, setFullscreenAsset] = React.useState<Asset | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = React.useState(0);

  const handleAssetView = (asset: Asset) => {
    const allUploadedAssets = uploadedAssets;
    const index = allUploadedAssets.findIndex(a => a.id === asset.id);
    setFullscreenIndex(index >= 0 ? index : 0);
    setFullscreenAsset(asset);
  };

  const handleFullscreenClose = () => {
    setFullscreenAsset(null);
    setFullscreenIndex(0);
  };

  const handleFullscreenNavigate = (direction: 'prev' | 'next') => {
    const allUploadedAssets = uploadedAssets;
    if (allUploadedAssets.length === 0) return;
    
    const newIndex = direction === 'next' 
      ? (fullscreenIndex + 1) % allUploadedAssets.length
      : (fullscreenIndex - 1 + allUploadedAssets.length) % allUploadedAssets.length;
    
    setFullscreenIndex(newIndex);
    setFullscreenAsset(allUploadedAssets[newIndex]);
  };

  // Asset edit handler
  const handleAssetEdit = async (assetId: string, newName: string) => {
    try {
      await apiClient.directPut(`/assets/${assetId}/name`, { name: newName });
      // Invalidate cache and reload assets to update both featureCategories and uploadedAssets in real-time
      invalidateAssetsCache();
      await reloadAssets(true);
      notifications.success('Asset updated', 'Asset name has been changed.');
    } catch (error) {
      console.error('Edit error:', error);
      notifications.error('Update failed', 'Failed to update asset. Please try again.');
    }
  };

  // Priority colors (removed - not used)
  // Status colors (removed - not used)

  // Filter assets based on search
  const filteredAssets = featureCategories[selectedCategory]?.assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Canvas drawing with enhanced features
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom / 100, zoom / 100);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1 / (zoom / 100);
      
      for (let x = 0; x <= 600; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 700);
        ctx.stroke();
      }
      
      for (let y = 0; y <= 700; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(600, y);
        ctx.stroke();
      }
    }

    // Draw safe area guidelines
    if (canvasSettings.showSafeArea) {
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2 / (zoom / 100);
      ctx.strokeRect(50, 50, 500, 600);
      ctx.setLineDash([]);
    }

    // Sort features by zIndex
    const sortedFeatures = [...features].sort((a, b) => a.zIndex - b.zIndex);

    // Draw features with image caching to prevent flickering
    sortedFeatures.forEach(feature => {
      if (!feature.visible) return;

      // Check cache first
      let img = imageCacheRef.current.get(feature.asset.path);
      
      if (!img) {
        // Create and cache image
        img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = feature.asset.path;
        imageCacheRef.current.set(feature.asset.path, img);
      } else if (!img.crossOrigin) {
        img.crossOrigin = 'anonymous';
      }
      
      // Draw function
      const drawFeature = () => {
        ctx.save();
        
        // Apply transformations
        ctx.translate(feature.x + feature.width / 2, feature.y + feature.height / 2);
        ctx.rotate(feature.rotation * Math.PI / 180);
        ctx.scale(feature.flipH ? -1 : 1, feature.flipV ? -1 : 1);
        ctx.globalAlpha = feature.opacity;
        
        // Apply filters
        ctx.filter = `brightness(${feature.brightness}%) contrast(${feature.contrast}%)`;
        
        ctx.drawImage(
          img!,
          -feature.width / 2,
          -feature.height / 2,
          feature.width,
          feature.height
        );
        
        // Reset filter
        ctx.filter = 'none';
        
        // Draw selection indicators
        if (selectedFeatures.includes(feature.id)) {
          // Check if this is an auto-selected feature
          const isAutoSelected = autoSelectedFeature === feature.id;
          
          ctx.strokeStyle = isAutoSelected ? '#10b981' : '#ef4444'; // Green for auto-selected, red for normal
          ctx.lineWidth = isAutoSelected ? 3 / (zoom / 100) : 2 / (zoom / 100); // Thicker for auto-selected
          ctx.setLineDash(isAutoSelected ? [5, 5] : [3, 3]);
          ctx.strokeRect(
            -feature.width / 2,
            -feature.height / 2,
            feature.width,
            feature.height
          );
          ctx.setLineDash([]);
          
          // Draw resize handles (8 handles: 4 corners + 4 edges)
          const handleSize = 10 / (zoom / 100);
          const handleColor = isAutoSelected ? '#10b981' : '#3b82f6';
          const handles = [
            { x: -feature.width / 2, y: -feature.height / 2, type: 'nw' }, // top-left corner
            { x: 0, y: -feature.height / 2, type: 'n' }, // top edge
            { x: feature.width / 2, y: -feature.height / 2, type: 'ne' }, // top-right corner
            { x: feature.width / 2, y: 0, type: 'e' }, // right edge
            { x: feature.width / 2, y: feature.height / 2, type: 'se' }, // bottom-right corner
            { x: 0, y: feature.height / 2, type: 's' }, // bottom edge
            { x: -feature.width / 2, y: feature.height / 2, type: 'sw' }, // bottom-left corner
            { x: -feature.width / 2, y: 0, type: 'w' }, // left edge
          ];
          
          handles.forEach(handle => {
            // Draw handle with shadow for prominence
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 2 / (zoom / 100);
            ctx.shadowOffsetX = 1 / (zoom / 100);
            ctx.shadowOffsetY = 1 / (zoom / 100);
            
            ctx.fillStyle = handleColor;
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5 / (zoom / 100);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          });
        }
        
        // Draw lock indicator
        if (feature.locked) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(feature.width / 2 - 10, -feature.height / 2, 20, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔒', feature.width / 2, -feature.height / 2 + 15);
        }
        
        ctx.restore();
      };
      
      // Draw immediately if image is already loaded, otherwise wait for load
      if (img.complete && img.naturalWidth > 0) {
        // Image already loaded, draw immediately
        drawFeature();
      } else {
        // Wait for image to load, then redraw
        img.onload = () => {
          requestAnimationFrame(() => drawCanvas());
        };
      }
    });

    ctx.restore();
  }, [features, zoom, panOffset, showGrid, gridSize, canvasSettings, autoSelectedFeature, selectedFeatures]);

  // History management
  const addToHistory = useCallback((newFeatures: PlacedFeature[]) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), [...newFeatures]];
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFeatures([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFeatures([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  // Smart positioning function based on category
  const getSmartPosition = useCallback((category: string, defaultSize: { width: number; height: number }): { x: number; y: number } => {
    const canvasWidth = 600;
    const canvasHeight = 700;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Check if there's already a face feature to position relative to it
    const existingFace = features.find(f => f.asset.category === 'face-shapes');
    
    let baseX = centerX;
    let baseY = centerY;
    
    if (existingFace) {
      // Position relative to existing face
      baseX = existingFace.x + existingFace.width / 2;
      baseY = existingFace.y + existingFace.height / 2;
    }
    
    const positions: Record<string, { x: number; y: number }> = {
      'face-shapes': {
        x: centerX - defaultSize.width / 2,
        y: centerY - defaultSize.height / 2
      },
      'eyes': {
        // Check if we have two eyes already, then position left/right accordingly
        x: features.filter(f => f.asset.category === 'eyes').length % 2 === 0 
          ? baseX - 80 - defaultSize.width / 2  // Left eye
          : baseX + 80 - defaultSize.width / 2,  // Right eye
        y: baseY - 70 - defaultSize.height / 2
      },
      'eyebrows': {
        // Position above eyes
        x: features.filter(f => f.asset.category === 'eyebrows').length % 2 === 0
          ? baseX - 80 - defaultSize.width / 2   // Left eyebrow
          : baseX + 80 - defaultSize.width / 2,  // Right eyebrow
        y: baseY - 100 - defaultSize.height / 2
      },
      'nose': {
        x: baseX - defaultSize.width / 2,
        y: baseY - defaultSize.height / 2
      },
      'lips': {
        x: baseX - defaultSize.width / 2,
        y: baseY + 70 - defaultSize.height / 2  // Below nose
      },
      'hair': {
        x: baseX - defaultSize.width / 2,
        y: baseY - defaultSize.height / 2 - 100  // Above face
      },
      'facial-hair': {
        x: baseX - defaultSize.width / 2,
        y: baseY + 110 - defaultSize.height / 2  // Below lips
      },
      'accessories': {
        // Default to center, can be adjusted manually
        x: centerX - defaultSize.width / 2,
        y: centerY - defaultSize.height / 2
      }
    };
    
    const position = positions[category] || { x: centerX - defaultSize.width / 2, y: centerY - defaultSize.height / 2 };
    
    // Apply snap to grid if enabled
    if (snapToGrid) {
      position.x = Math.round(position.x / gridSize) * gridSize;
      position.y = Math.round(position.y / gridSize) * gridSize;
    }
    
    return position;
  }, [features, snapToGrid, gridSize]);

  // Feature-specific default sizes and scaling rules
  const getFeatureDefaultSize = useCallback((category: string): { width: number; height: number; scale: number } => {
    const baseSizes = {
      'face-shapes': { width: 400, height: 500, scale: 1.0 },      // Largest - base layer
      'eyes': { width: 80, height: 60, scale: 0.8 },               // Smaller, proportional
      'eyebrows': { width: 90, height: 40, scale: 0.85 },          // Slightly above eye size
      'nose': { width: 120, height: 150, scale: 0.9 },             // Medium, centered
      'lips': { width: 100, height: 80, scale: 0.75 },             // Smaller width than nose
      'hair': { width: 450, height: 550, scale: 1.1 },             // Slightly larger than face
      'facial-hair': { width: 140, height: 120, scale: 0.8 },      // Proportional to lips/jaw
      'accessories': { width: 200, height: 200, scale: 0.9 }       // Fits relative to head/face
    };
    
    return baseSizes[category as keyof typeof baseSizes] || { width: 100, height: 100, scale: 1.0 };
  }, []);

  // Add feature with enhanced properties and smart positioning
  const addFeature = useCallback((asset: FeatureAsset) => {
    const defaultSize = getFeatureDefaultSize(asset.category);
    const smartPosition = getSmartPosition(asset.category, defaultSize);
    
    const newFeature: PlacedFeature = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      asset,
      x: smartPosition.x,
      y: smartPosition.y,
      width: defaultSize.width,
      height: defaultSize.height,
      rotation: 0,
      opacity: 1,
      zIndex: features.length,
      selected: false,
      locked: false,
      visible: true,
      flipH: false,
      flipV: false,
      brightness: 100,
      contrast: 100,
      scale: defaultSize.scale
    };

    const newFeatures = [...features, newFeature];
    setFeatures(newFeatures);
    addToHistory(newFeatures);
    setSelectedFeatures([newFeature.id]);
  }, [features, addToHistory, getSmartPosition, getFeatureDefaultSize]);

  // Feature picker for overlapping features
  const [featurePicker, setFeaturePicker] = useState<{
    x: number;
    y: number;
    features: PlacedFeature[];
  } | null>(null);

  // Helper function to detect resize handle
  const getResizeHandle = useCallback((x: number, y: number, feature: PlacedFeature): string | null => {
    const handleSize = 10 / (zoom / 100);
    const centerX = feature.x + feature.width / 2;
    const centerY = feature.y + feature.height / 2;
    const relX = x - centerX;
    const relY = y - centerY;
    
    const handles = [
      { x: -feature.width / 2, y: -feature.height / 2, type: 'nw' },
      { x: 0, y: -feature.height / 2, type: 'n' },
      { x: feature.width / 2, y: -feature.height / 2, type: 'ne' },
      { x: feature.width / 2, y: 0, type: 'e' },
      { x: feature.width / 2, y: feature.height / 2, type: 'se' },
      { x: 0, y: feature.height / 2, type: 's' },
      { x: -feature.width / 2, y: feature.height / 2, type: 'sw' },
      { x: -feature.width / 2, y: 0, type: 'w' },
    ];
    
    for (const handle of handles) {
      const dx = relX - handle.x;
      const dy = relY - handle.y;
      if (Math.abs(dx) <= handleSize / 2 && Math.abs(dy) <= handleSize / 2) {
        return handle.type;
      }
    }
    return null;
  }, [zoom]);

  // Enhanced canvas event handlers would go here...
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / (zoom / 100);
    const y = (e.clientY - rect.top - panOffset.y) / (zoom / 100);

    // Check for resize handle on selected features first
    if (selectedFeatures.length === 1) {
      const selectedFeature = features.find(f => f.id === selectedFeatures[0]);
      if (selectedFeature && selectedFeature.visible && !selectedFeature.locked) {
        const handle = getResizeHandle(x, y, selectedFeature);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          // Store both mouse position and feature position/size for accurate resize calculation
          setResizeStart({ 
            mouseX: x,
            mouseY: y,
            featureX: selectedFeature.x, 
            featureY: selectedFeature.y, 
            width: selectedFeature.width, 
            height: selectedFeature.height 
          });
          return;
        }
      }
    }

    // Find all features at this location (including overlapping ones) - exclude locked features
    const featuresAtLocation = features.filter(feature => {
      if (!feature.visible || feature.locked) return false;
      
      const featureX = feature.x;
      const featureY = feature.y;
      const featureWidth = feature.width;
      const featureHeight = feature.height;
      
      return x >= featureX && x <= featureX + featureWidth &&
             y >= featureY && y <= featureY + featureHeight;
    });

    if (featuresAtLocation.length > 0) {
      if (featuresAtLocation.length === 1) {
        // Single feature - select it directly (already filtered to exclude locked)
        const clickedFeature = featuresAtLocation[0];
        
        if (e.shiftKey) {
          // Multi-select with shift
          setSelectedFeatures(prev => 
            prev.includes(clickedFeature.id) 
              ? prev.filter(id => id !== clickedFeature.id)
              : [...prev, clickedFeature.id]
          );
        } else {
          // Single select
          setSelectedFeatures([clickedFeature.id]);
        }
        
        // Only allow dragging if feature is not locked
        if (!clickedFeature.locked) {
          setIsDragging(true);
          setDragStart({ x: x - clickedFeature.x, y: y - clickedFeature.y });
        }
      } else {
        // Multiple features - prioritize the SMALLEST feature (most likely what user wants to click)
        // Sort by size first (smallest first), then by zIndex (top layer first)
        const sortedFeatures = featuresAtLocation.sort((a, b) => {
          const aArea = a.width * a.height;
          const bArea = b.width * b.height;
          
          // First priority: smallest area (smallest feature)
          if (aArea !== bArea) {
            return aArea - bArea;
          }
          
          // Second priority: higher zIndex (top layer)
          return b.zIndex - a.zIndex;
        });
        
        // Auto-select the smallest feature instead of showing picker (already filtered to exclude locked)
        const smallestFeature = sortedFeatures[0];
        setSelectedFeatures([smallestFeature.id]);
        // Only allow dragging if feature is not locked
        if (!smallestFeature.locked) {
          setIsDragging(true);
          setDragStart({ x: x - smallestFeature.x, y: y - smallestFeature.y });
        }
        
        // Show auto-selection indicator
        setAutoSelectedFeature(smallestFeature.id);
        
        // Clear the indicator after 2 seconds
        setTimeout(() => {
          setAutoSelectedFeature(null);
        }, 2000);
        
        // Show a brief tooltip indicating which feature was selected
        console.log(`Auto-selected: ${smallestFeature.asset.name} (${smallestFeature.width}×${smallestFeature.height}px)`);
      }
    } else {
      // Clicked on empty space - deselect all
      setSelectedFeatures([]);
      setFeaturePicker(null);
    }
  }, [features, panOffset, zoom, selectedFeatures, getResizeHandle]);

  // Handle feature selection from picker
  const selectFeatureFromPicker = useCallback((featureId: string) => {
    setSelectedFeatures([featureId]);
    setFeaturePicker(null);
    
    // Set up dragging for the selected feature
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      setIsDragging(true);
      setDragStart({ x: 0, y: 0 });
    }
  }, [features]);

  // Close feature picker
  const closeFeaturePicker = useCallback(() => {
    setFeaturePicker(null);
  }, []);

  // Optimized update function that batches state updates using requestAnimationFrame
  const updateFeaturesOptimized = useCallback((newFeatures: PlacedFeature[]) => {
    pendingFeaturesRef.current = newFeatures;
    
    if (rafUpdateRef.current === null) {
      rafUpdateRef.current = requestAnimationFrame(() => {
        if (pendingFeaturesRef.current) {
          setFeatures(pendingFeaturesRef.current);
          pendingFeaturesRef.current = null;
        }
        rafUpdateRef.current = null;
      });
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / (zoom / 100);
    const y = (e.clientY - rect.top - panOffset.y) / (zoom / 100);

    // Handle resizing
    if (isResizing && resizeHandle && selectedFeatures.length === 1) {
      const selectedFeature = features.find(f => f.id === selectedFeatures[0]);
      if (!selectedFeature || selectedFeature.locked) return;

      // Calculate delta from initial mouse position
      const deltaX = x - resizeStart.mouseX;
      const deltaY = y - resizeStart.mouseY;
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.featureX;
      let newY = resizeStart.featureY;

      // Apply resize based on handle type
      switch (resizeHandle) {
        case 'nw': // top-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = resizeStart.featureX + deltaX;
          newY = resizeStart.featureY + deltaY;
          break;
        case 'n': // top
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = resizeStart.featureY + deltaY;
          break;
        case 'ne': // top-right
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = resizeStart.featureY + deltaY;
          break;
        case 'e': // right
          newWidth = Math.max(20, resizeStart.width + deltaX);
          break;
        case 'se': // bottom-right
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 's': // bottom
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          newX = resizeStart.featureX + deltaX;
          break;
        case 'w': // left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newX = resizeStart.featureX + deltaX;
          break;
      }

      // Apply grid snapping if enabled
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      const newFeatures = features.map(f => 
        f.id === selectedFeatures[0] 
          ? { ...f, width: newWidth, height: newHeight, x: newX, y: newY }
          : f
      );
      updateFeaturesOptimized(newFeatures);
      return;
    }

    // Handle dragging - skip locked features
    if (isDragging && selectedFeatures.length > 0) {
      const newFeatures = features.map(feature => {
        if (selectedFeatures.includes(feature.id) && !feature.locked) {
          let newX = x - dragStart.x;
          let newY = y - dragStart.y;

          // Apply grid snapping if enabled
          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          return { ...feature, x: newX, y: newY };
        }
        return feature;
      });

      updateFeaturesOptimized(newFeatures);
    }
  }, [isDragging, isResizing, resizeHandle, resizeStart, selectedFeatures, features, panOffset, zoom, dragStart, snapToGrid, gridSize, updateFeaturesOptimized]);

  const handleCanvasMouseUp = useCallback(() => {
    // Cancel any pending RAF updates
    if (rafUpdateRef.current !== null) {
      cancelAnimationFrame(rafUpdateRef.current);
      rafUpdateRef.current = null;
    }
    
    // Apply any pending updates immediately
    if (pendingFeaturesRef.current) {
      setFeatures(pendingFeaturesRef.current);
      pendingFeaturesRef.current = null;
    }
    
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      addToHistory(features);
    } else if (isDragging) {
      setIsDragging(false);
      addToHistory(features);
    }
  }, [isDragging, isResizing, features, addToHistory]);


  // Resize selected features - skip locked features
  const resizeSelectedFeatures = useCallback((newWidth: number, newHeight: number) => {
    console.log('Resizing features:', { newWidth, newHeight, selectedFeatures });
    const newFeatures = features.map(f => {
      if (selectedFeatures.includes(f.id) && !f.locked) {
        console.log('Resizing feature:', f.id, 'from', f.width, 'x', f.height, 'to', newWidth, 'x', newHeight);
        return {
          ...f,
          width: Math.max(20, newWidth),
          height: Math.max(20, newHeight)
        };
      }
      return f;
    });
    setFeatures(newFeatures);
    addToHistory(newFeatures);
    console.log('Features updated:', newFeatures);
    
    // Force canvas redraw
    setTimeout(() => {
      if (canvasRef.current) {
        drawCanvas();
      }
    }, 0);
  }, [features, selectedFeatures, addToHistory, drawCanvas]);

  // Handle drag and drop for features
  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    try {
      let assetData = e.dataTransfer.getData('application/json');
      if (!assetData) {
        assetData = e.dataTransfer.getData('text/plain');
      }
      if (assetData) {
        const asset: FeatureAsset = JSON.parse(assetData);
        
        // Get canvas rect and calculate drop position
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Apply zoom and pan transformations
        const adjustedX = (x - panOffset.x) / (zoom / 100);
        const adjustedY = (y - panOffset.y) / (zoom / 100);
        
        // Snap to grid if enabled
        const finalX = snapToGrid ? Math.round(adjustedX / gridSize) * gridSize : adjustedX;
        const finalY = snapToGrid ? Math.round(adjustedY / gridSize) * gridSize : adjustedY;
        
        // Create new feature at drop position
        const newFeature: PlacedFeature = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          asset,
          x: finalX,
          y: finalY,
          width: getFeatureDefaultSize(asset.category).width,
          height: getFeatureDefaultSize(asset.category).height,
          rotation: 0,
          opacity: 1,
          zIndex: features.length,
          selected: false,
          locked: false,
          visible: true,
          flipH: false,
          flipV: false,
          brightness: 100,
          contrast: 100,
          scale: getFeatureDefaultSize(asset.category).scale
        };

        const newFeatures = [...features, newFeature];
        setFeatures(newFeatures);
        addToHistory(newFeatures);
        setSelectedFeatures([newFeature.id]);
        
        // Show success feedback
        console.log(`Added ${asset.name} at position (${finalX}, ${finalY})`);
      }
    } catch (error) {
      console.error('Error processing dropped asset:', error);
    }
  }, [features, addToHistory, snapToGrid, gridSize, zoom, panOffset, getFeatureDefaultSize]);

  // Export functionality with metadata
  const exportCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    const resolution = canvasSettings.quality === 'high' ? 2 : 1;
    exportCanvas.width = 600 * resolution;
    exportCanvas.height = 700 * resolution;
    
    exportCtx.scale(resolution, resolution);
    exportCtx.fillStyle = canvasSettings.backgroundColor;
    exportCtx.fillRect(0, 0, 600, 700);

    // Export with metadata
    const metadata = {
      caseInfo,
      exportDate: new Date().toISOString(),
      features: features.length,
      software: 'Forensic Face Builder v2.0'
    };

    try {
      const imagePromises = features
        .filter(f => f.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(feature => {
          return new Promise<{ feature: PlacedFeature; img: HTMLImageElement }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ feature, img });
            img.src = feature.asset.path;
          });
        });

      const loadedImages = await Promise.all(imagePromises);
      
      loadedImages.forEach(({ feature, img }) => {
        exportCtx.save();
        exportCtx.translate(feature.x + feature.width / 2, feature.y + feature.height / 2);
        exportCtx.rotate(feature.rotation * Math.PI / 180);
        exportCtx.scale(feature.flipH ? -1 : 1, feature.flipV ? -1 : 1);
        exportCtx.globalAlpha = feature.opacity;
        exportCtx.filter = `brightness(${feature.brightness}%) contrast(${feature.contrast}%)`;
        
        exportCtx.drawImage(
          img,
          -feature.width / 2,
          -feature.height / 2,
          feature.width,
          feature.height
        );
        
        exportCtx.restore();
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `forensic-sketch-${caseInfo.caseNumber || 'case'}-${timestamp}.png`;
      link.download = fileName;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();

      // Also save metadata as JSON
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const metadataLink = document.createElement('a');
      metadataLink.download = `forensic-metadata-${caseInfo.caseNumber || 'case'}-${timestamp}.json`;
      metadataLink.href = URL.createObjectURL(metadataBlob);
      metadataLink.click();
    } catch (error) {
      console.error('Error exporting canvas:', error);
    }
  }, [caseInfo, features, canvasSettings]);

  // Export canvas as PNG blob (for save/upload)
  const exportCanvasAsBlob = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const exportCanvas = document.createElement('canvas');
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const resolution = canvasSettings.quality === 'high' ? 2 : 1;
      exportCanvas.width = 600 * resolution;
      exportCanvas.height = 700 * resolution;
      
      exportCtx.scale(resolution, resolution);
      exportCtx.fillStyle = canvasSettings.backgroundColor;
      exportCtx.fillRect(0, 0, 600, 700);

      const imagePromises = features
        .filter(f => f.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(feature => {
          return new Promise<{ feature: PlacedFeature; img: HTMLImageElement }>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ feature, img });
            img.onerror = () => reject(new Error(`Failed to load image: ${feature.asset.path}`));
            img.src = feature.asset.path;
          });
        });

      Promise.all(imagePromises)
        .then(loadedImages => {
          loadedImages.forEach(({ feature, img }) => {
            exportCtx.save();
            exportCtx.translate(feature.x + feature.width / 2, feature.y + feature.height / 2);
            exportCtx.rotate(feature.rotation * Math.PI / 180);
            exportCtx.scale(feature.flipH ? -1 : 1, feature.flipV ? -1 : 1);
            exportCtx.globalAlpha = feature.opacity;
            exportCtx.filter = `brightness(${feature.brightness}%) contrast(${feature.contrast}%)`;
            
            exportCtx.drawImage(
              img,
              -feature.width / 2,
              -feature.height / 2,
              feature.width,
              feature.height
            );
            
            exportCtx.restore();
          });

          exportCanvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        })
        .catch(reject);
    });
  }, [features, canvasSettings]);

  // Export PNG image only (without metadata JSON)
  const exportPNG = useCallback(async () => {
    try {
      const blob = await exportCanvasAsBlob();
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `forensic-sketch-${caseInfo.caseNumber || 'case'}-${timestamp}.png`;
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export PNG. Please try again.');
    }
  }, [caseInfo, exportCanvasAsBlob]);

  // Save sketch to MongoDB and Cloudinary
  const handleSaveSketch = useCallback(async (saveData: {
    name: string;
    suspect: string;
    eyewitness: string;
    officer: string;
    date: string;
    reason: string;
    description: string;
    priority: string;
    status: string;
  }) => {
    try {
      setIsSaving(true);
      
      // Export canvas as blob
      const imageBlob = await exportCanvasAsBlob();
      
      // Prepare sketch state
      const sketchState = {
        features: features.map(f => ({
          id: f.id,
          asset: {
            id: f.asset.id,
            name: f.asset.name,
            category: f.asset.category,
            path: f.asset.path
          },
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          rotation: f.rotation,
          opacity: f.opacity,
          zIndex: f.zIndex,
          locked: f.locked,
          visible: f.visible,
          flipH: f.flipH,
          flipV: f.flipV,
          brightness: f.brightness,
          contrast: f.contrast,
          scale: f.scale
        })),
        canvasSettings,
        zoom,
        panOffset,
        selectedFeatures,
        saveDetails: saveData,
        caseInfo: {
          ...caseInfo,
          caseNumber: saveData.name || caseInfo.caseNumber,
          officer: saveData.officer || caseInfo.officer,
          description: saveData.description || caseInfo.description,
          witness: saveData.eyewitness || caseInfo.witness,
          suspect: saveData.suspect || caseInfo.suspect,
          date: saveData.date ? saveData.date.split('T')[0] : caseInfo.date,
          priority: (saveData.priority as CaseInfo['priority']) || caseInfo.priority,
          status: (saveData.status as CaseInfo['status']) || caseInfo.status,
        }
      };
      
      // Validate required data before creating FormData
      if (!saveData.name || !saveData.name.trim()) {
        throw new Error('Sketch name is required');
      }
      
      if (!imageBlob) {
        throw new Error('Image is required. Please ensure the canvas has content.');
      }
      
      // Create FormData
      const formData = new FormData();
      formData.append('name', saveData.name.trim());
      formData.append('suspect', saveData.suspect || '');
      formData.append('eyewitness', saveData.eyewitness || '');
      formData.append('officer', saveData.officer || '');
      formData.append('date', saveData.date || new Date().toISOString());
      formData.append('reason', saveData.reason || '');
      formData.append('description', saveData.description || '');
      formData.append('priority', saveData.priority || 'normal');
      formData.append('status', saveData.status || 'draft');
      
      // Ensure sketch_state is valid JSON
      const sketchStateJson = JSON.stringify(sketchState);
      if (!sketchStateJson || sketchStateJson === '{}') {
        throw new Error('Sketch state is empty. Please add some content to the sketch.');
      }
      
      // Log sketch state for debugging
      console.log('💾 Saving sketch_state:', {
        featuresCount: sketchState.features?.length || 0,
        hasCanvasSettings: !!sketchState.canvasSettings,
        jsonLength: sketchStateJson.length
      });
      
      // Append sketch_state FIRST (before image) to ensure it's always included
      formData.append('sketch_state', sketchStateJson);
      
      // Ensure image has proper filename
      const filename = `${saveData.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`;
      formData.append('image', imageBlob, filename);
      
      // Verify FormData contents before sending (after all appends)
      const hasSketchState = formData.has('sketch_state');
      if (!hasSketchState) {
        throw new Error('Critical error: sketch_state is missing from FormData');
      }
      
      console.log('📦 FormData contents (verified):', {
        hasName: formData.has('name'),
        hasSketchState: formData.has('sketch_state'),
        hasImage: formData.has('image'),
        nameValue: saveData.name.trim(),
        sketchStateLength: sketchStateJson.length,
        imageSize: imageBlob?.size || 0
      });
      
      // Call API
      if (currentSketchId) {
        console.log('🔄 Updating existing sketch:', currentSketchId);
        // Update existing sketch - use PUT with FormData
        const updateResult = await apiClient.directUploadFile<{ status: string; message: string; sketch_id: string }>(
          `/sketches/${currentSketchId}`,
          formData,
          'PUT'
        );
        
        console.log('📥 Update response:', updateResult);
        
        // Verify response
        if (!updateResult || updateResult.status !== 'ok') {
          throw new Error(updateResult?.message || 'Failed to update sketch');
        }
        
        // Update state hash for auto-save tracking
        const stateHash = JSON.stringify({
          features: features.map(f => ({
            id: f.id,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            rotation: f.rotation,
            opacity: f.opacity,
            zIndex: f.zIndex,
            visible: f.visible,
            locked: f.locked
          })),
          zoom,
          panOffset
        });
        setLastSavedStateHash(stateHash);

        // Invalidate caches first - CRITICAL: must invalidate detail cache
        invalidateSketchList();
        invalidateSketchDetail(currentSketchId ?? undefined);
        
        // Clear localStorage to prevent it from overriding database data
        clearLocalStorage();
        
        // Reset loaded sketch ID so it will reload from database next time
        if (loadedSketchIdRef.current === currentSketchId) {
          loadedSketchIdRef.current = null;
        }
        
        // Force immediate refetch to ensure data is up to date
        // Wait for refetch to complete before showing success
        try {
          await listSketches(true);
          // Also refetch the detail to update cache
          const updatedSketch = await getSketchById(currentSketchId, true);
          console.log('✅ Sketch list and detail refetched after update');
          console.log('📊 Updated sketch state:', {
            featuresCount: updatedSketch.sketch_state?.features?.length || 0,
            hasCanvasSettings: !!updatedSketch.sketch_state?.canvasSettings,
          });
          
          // Reload sketch state from database to ensure UI shows latest saved data
          if (updatedSketch.sketch_state) {
            const state = updatedSketch.sketch_state;
            const restoredFeatures: PlacedFeature[] = state?.features && Array.isArray(state.features)
              ? state.features.map((f: any) => ({
                  id: f.id,
                  asset: {
                    id: f.asset.id,
                    name: f.asset.name,
                    path: f.asset.path,
                    category: f.asset.category,
                    tags: f.asset.tags || [],
                    description: f.asset.description
                  },
                  x: f.x || 0,
                  y: f.y || 0,
                  width: f.width || 100,
                  height: f.height || 100,
                  rotation: f.rotation || 0,
                  opacity: f.opacity ?? 1,
                  zIndex: f.zIndex ?? 0,
                  selected: false,
                  locked: f.locked || false,
                  visible: f.visible !== undefined ? f.visible : true,
                  flipH: f.flipH || false,
                  flipV: f.flipV || false,
                  brightness: f.brightness ?? 100,
                  contrast: f.contrast ?? 100,
                  scale: f.scale ?? 1
                }))
              : [];
            
            setFeatures(restoredFeatures);
            if (state?.zoom !== undefined) setZoom(state.zoom);
            if (state?.panOffset) setPanOffset(state.panOffset);
            if (state?.canvasSettings) setCanvasSettings({ ...createInitialCanvasSettings(), ...state.canvasSettings });
            console.log('✅ Sketch state reloaded from database after save');
          }
          
          // Update saveDetails from database response (single source of truth)
          const extractedSaveDetails = extractSaveDetailsFromSketch(updatedSketch, updatedSketch.sketch_state);
          setSaveDetails(extractedSaveDetails);
          
          // Update caseInfo from database response
          const stateWithExtras = updatedSketch.sketch_state as any;
          if (stateWithExtras?.caseInfo) {
            setCaseInfo({
              ...createInitialCaseInfo(),
              ...stateWithExtras.caseInfo
            });
          } else {
            setCaseInfo((prev) => ({
              ...createInitialCaseInfo(),
              caseNumber: extractedSaveDetails.name || prev.caseNumber,
              officer: extractedSaveDetails.officer || '',
              description: extractedSaveDetails.description || '',
              witness: extractedSaveDetails.eyewitness || '',
              date: extractedSaveDetails.date ? extractedSaveDetails.date.split('T')[0] : prev.date,
              priority: (extractedSaveDetails.priority as CaseInfo['priority']) || prev.priority,
              status: (extractedSaveDetails.status as CaseInfo['status']) || prev.status,
            }));
          }
        } catch (err) {
          console.error('❌ Failed to refetch after update:', err);
          // Don't fail the save operation if refetch fails, but log it
        }

        notifications.success('Sketch updated', 'All changes saved to the database.');
      } else {
        // Create new sketch
        console.log('🆕 Creating new sketch');
        const result = await apiClient.directUploadFile<{ status: string; message: string; sketch_id: string }>('/sketches/save', formData);
        
        console.log('📥 Save response:', result);
        
        // Verify response
        if (!result || result.status !== 'ok' || !result.sketch_id) {
          throw new Error(result?.message || 'Failed to save sketch: Invalid response');
        }
        
        const sketchId = result.sketch_id;
        setCurrentSketchId(sketchId);
        
        // Update state hash for auto-save tracking
        const stateHash = JSON.stringify({
          features: features.map(f => ({
            id: f.id,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            rotation: f.rotation,
            opacity: f.opacity,
            zIndex: f.zIndex,
            visible: f.visible,
            locked: f.locked
          })),
          zoom,
          panOffset
        });
        setLastSavedStateHash(stateHash);
        
        // Invalidate caches first - CRITICAL: must invalidate detail cache
        invalidateSketchList();
        invalidateSketchDetail(sketchId);
        
        // Clear localStorage to prevent it from overriding database data
        clearLocalStorage();
        
        // Reset loaded sketch ID so it will reload from database next time
        if (loadedSketchIdRef.current === sketchId) {
          loadedSketchIdRef.current = null;
        }
        
        // Force immediate refetch to ensure data is up to date
        // Wait for refetch to complete before showing success
        try {
          await listSketches(true);
          // Also refetch the detail to update cache
          const savedSketch = await getSketchById(sketchId, true);
          console.log('✅ Sketch list and detail refetched after save');
          console.log('📊 Saved sketch state:', {
            featuresCount: savedSketch.sketch_state?.features?.length || 0,
            hasCanvasSettings: !!savedSketch.sketch_state?.canvasSettings,
          });
          
          // Reload sketch state from database to ensure UI shows latest saved data
          if (savedSketch.sketch_state) {
            const state = savedSketch.sketch_state;
            const restoredFeatures: PlacedFeature[] = state?.features && Array.isArray(state.features)
              ? state.features.map((f: any) => ({
                  id: f.id,
                  asset: {
                    id: f.asset.id,
                    name: f.asset.name,
                    path: f.asset.path,
                    category: f.asset.category,
                    tags: f.asset.tags || [],
                    description: f.asset.description
                  },
                  x: f.x || 0,
                  y: f.y || 0,
                  width: f.width || 100,
                  height: f.height || 100,
                  rotation: f.rotation || 0,
                  opacity: f.opacity ?? 1,
                  zIndex: f.zIndex ?? 0,
                  selected: false,
                  locked: f.locked || false,
                  visible: f.visible !== undefined ? f.visible : true,
                  flipH: f.flipH || false,
                  flipV: f.flipV || false,
                  brightness: f.brightness ?? 100,
                  contrast: f.contrast ?? 100,
                  scale: f.scale ?? 1
                }))
              : [];
            
            setFeatures(restoredFeatures);
            if (state?.zoom !== undefined) setZoom(state.zoom);
            if (state?.panOffset) setPanOffset(state.panOffset);
            if (state?.canvasSettings) setCanvasSettings({ ...createInitialCanvasSettings(), ...state.canvasSettings });
            console.log('✅ Sketch state reloaded from database after save');
          }
          
          // Update saveDetails from database response (single source of truth)
          const extractedSaveDetails = extractSaveDetailsFromSketch(savedSketch, savedSketch.sketch_state);
          setSaveDetails(extractedSaveDetails);
          
          // Update caseInfo from database response
          const stateWithExtras = savedSketch.sketch_state as any;
          if (stateWithExtras?.caseInfo) {
            setCaseInfo({
              ...createInitialCaseInfo(),
              ...stateWithExtras.caseInfo
            });
          } else {
            setCaseInfo((prev) => ({
              ...createInitialCaseInfo(),
              caseNumber: extractedSaveDetails.name || prev.caseNumber,
              officer: extractedSaveDetails.officer || '',
              description: extractedSaveDetails.description || '',
              witness: extractedSaveDetails.eyewitness || '',
              date: extractedSaveDetails.date ? extractedSaveDetails.date.split('T')[0] : prev.date,
              priority: (extractedSaveDetails.priority as CaseInfo['priority']) || prev.priority,
              status: (extractedSaveDetails.status as CaseInfo['status']) || prev.status,
            }));
          }
        } catch (err) {
          console.error('❌ Failed to refetch after save:', err);
          // Don't fail the save operation if refetch fails, but log it
        }
        
        notifications.success('Sketch saved', 'Your sketch is now available in recent sketches.');
        
        // Update URL with sketch ID
        const url = new URL(window.location.href);
        url.searchParams.set('id', sketchId);
        window.history.pushState({}, '', url.toString());
      }
      
      setShowSaveModal(false);
    } catch (error: any) {
      console.error('Error saving sketch:', error);
      
      // Extract detailed error message from FastAPI validation errors
      let errorMessage = 'Failed to save sketch';
      
      if (error?.response?.status === 422) {
        // FastAPI validation error - extract details
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          // Multiple validation errors
          const errors = detail.map((err: any) => {
            const field = err.loc?.join('.') || 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation error: ${errors}`;
        } else if (typeof detail === 'string') {
          errorMessage = `Validation error: ${detail}`;
        } else if (detail?.message) {
          errorMessage = `Validation error: ${detail.message}`;
        } else {
          errorMessage = 'Validation error: Invalid request format. Please check all fields are filled correctly.';
        }
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notifications.error('Save failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [features, canvasSettings, zoom, panOffset, selectedFeatures, exportCanvasAsBlob, currentSketchId, notifications, setCaseInfo, clearLocalStorage]);

  // Wrapper to handle save from modal - updates saveDetails state first
  const handleSaveFromModal = useCallback(async (saveData: {
    name: string;
    suspect: string;
    eyewitness: string;
    officer: string;
    date: string;
    reason: string;
    description: string;
    priority: string;
    status: string;
  }) => {
    // Update saveDetails state immediately to keep it in sync
    setSaveDetails(saveData);
    // Then call the actual save function
    await handleSaveSketch(saveData);
  }, [handleSaveSketch]);

  const handlePrimarySaveClick = useCallback(() => {
    if (isSaving) {
      return;
    }
    // Always show modal if no sketch ID (new sketch)
    // For existing sketches, use current saveDetails (which should be synced from DB)
    if (!currentSketchId) {
      setShowSaveModal(true);
      return;
    }
    // For existing sketches, validate and save directly
    // Note: saveDetails should already be synced from database
    if (!saveDetails.name || !saveDetails.name.trim()) {
      setShowSaveModal(true);
      return;
    }
    void handleSaveSketch(saveDetails);
  }, [currentSketchId, handleSaveSketch, isSaving, saveDetails]);

  // Handler to update sketch details only (without image)
  const handleUpdateSketchDetails = useCallback(async (updateData: {
    name: string;
    suspect: string;
    eyewitness: string;
    officer: string;
    date: string;
    reason: string;
    description: string;
    priority: string;
    status: string;
  }) => {
    if (!currentSketchId) {
      notifications.error('Error', 'No sketch ID available');
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare sketch state with updated details
      const sketchState = {
        features: features.map(f => ({
          id: f.id,
          asset: {
            id: f.asset.id,
            name: f.asset.name,
            category: f.asset.category,
            path: f.asset.path
          },
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          rotation: f.rotation,
          opacity: f.opacity,
          zIndex: f.zIndex,
          locked: f.locked,
          visible: f.visible,
          flipH: f.flipH,
          flipV: f.flipV,
          brightness: f.brightness,
          contrast: f.contrast,
          scale: f.scale
        })),
        canvasSettings,
        zoom,
        panOffset,
        selectedFeatures,
        saveDetails: updateData,
        caseInfo: {
          ...caseInfo,
          caseNumber: updateData.name || caseInfo.caseNumber,
          officer: updateData.officer || caseInfo.officer,
          description: updateData.description || caseInfo.description,
          witness: updateData.eyewitness || caseInfo.witness,
          suspect: updateData.suspect || caseInfo.suspect,
          date: updateData.date ? updateData.date.split('T')[0] : caseInfo.date,
          priority: (updateData.priority as CaseInfo['priority']) || caseInfo.priority,
          status: (updateData.status as CaseInfo['status']) || caseInfo.status,
        }
      };
      
      // Create FormData with only metadata (no image)
      const formData = new FormData();
      formData.append('name', updateData.name);
      formData.append('suspect', updateData.suspect || '');
      formData.append('eyewitness', updateData.eyewitness || '');
      formData.append('officer', updateData.officer || '');
      formData.append('date', updateData.date || new Date().toISOString());
      formData.append('reason', updateData.reason || '');
      formData.append('description', updateData.description || '');
      formData.append('priority', updateData.priority);
      formData.append('status', updateData.status);
      
      // Ensure sketch_state is valid JSON before appending
      const sketchStateJson = JSON.stringify(sketchState);
      if (!sketchStateJson || sketchStateJson === '{}') {
        throw new Error('Sketch state is empty. Cannot update without sketch state.');
      }
      
      formData.append('sketch_state', sketchStateJson);
      
      // Verify sketch_state is in FormData before sending
      if (!formData.has('sketch_state')) {
        throw new Error('Critical error: sketch_state is missing from FormData');
      }
      
      console.log('📦 Update FormData contents (verified):', {
        hasName: formData.has('name'),
        hasSketchState: formData.has('sketch_state'),
        sketchStateLength: sketchStateJson.length
      });
      
      // Update existing sketch - use PUT with FormData (no image)
      await apiClient.directUploadFile<{ status: string; message: string; sketch_id: string }>(
        `/sketches/${currentSketchId}`,
        formData,
        'PUT'
      );
      
      // Invalidate cache to force refetch from DB
      invalidateSketchList();
      invalidateSketchDetail(currentSketchId);
      
      // Refetch sketch data from DB to ensure we have latest
      const updatedSketch = await getSketchById(currentSketchId, true);
      
      // Update local state from DB data (single source of truth)
      const extractedSaveDetails = extractSaveDetailsFromSketch(updatedSketch, updatedSketch.sketch_state);
      setSaveDetails(extractedSaveDetails);
      
      const stateWithExtras = updatedSketch.sketch_state as any;
      if (stateWithExtras?.caseInfo) {
        setCaseInfo({
          ...createInitialCaseInfo(),
          ...stateWithExtras.caseInfo
        });
      } else {
        setCaseInfo({
          ...createInitialCaseInfo(),
          caseNumber: updatedSketch.name || '',
          officer: updatedSketch.officer || '',
          description: updatedSketch.description || '',
          witness: updatedSketch.eyewitness || '',
          suspect: updatedSketch.suspect || '',
          date: updatedSketch.date ? new Date(updatedSketch.date).toISOString().split('T')[0] : createInitialCaseInfo().date,
          priority: (updatedSketch.priority as CaseInfo['priority']) || 'medium',
          status: (updatedSketch.status as CaseInfo['status']) || 'draft',
        });
      }

      notifications.success('Details updated', 'Sketch details have been updated in the database.');
    } catch (error: any) {
      console.error('Error updating sketch details:', error);
      notifications.error(
        'Update failed',
        error?.response?.data?.detail || error?.message || 'Unknown error'
      );
    } finally {
      setIsSaving(false);
    }
  }, [currentSketchId, features, canvasSettings, zoom, panOffset, selectedFeatures, caseInfo, notifications]);

  // Export JSON metadata only
  const exportMetadata = useCallback(() => {
    const metadata = {
      caseInfo,
      features: features.map(f => ({
        id: f.id,
        asset: {
          id: f.asset.id,
          name: f.asset.name,
          category: f.asset.category,
          path: f.asset.path
        },
        position: { x: f.x, y: f.y },
        size: { width: f.width, height: f.height },
        rotation: f.rotation,
        opacity: f.opacity,
        zIndex: f.zIndex,
        locked: f.locked,
        visible: f.visible,
        flipH: f.flipH,
        flipV: f.flipV,
        brightness: f.brightness,
        contrast: f.contrast,
        scale: f.scale
      })),
      canvasSettings,
      exportDate: new Date().toISOString(),
      software: 'Forensic Face Builder v2.0',
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `forensic-metadata-${caseInfo.caseNumber || 'case'}-${timestamp}.json`;
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
  }, [caseInfo, features, canvasSettings]);

  // Enhanced save project
  const saveProject = useCallback(() => {
    const projectData = {
      caseInfo,
      features,
      canvasSettings,
      metadata: {
        version: '2.0',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        featureCount: features.length,
        software: 'Forensic Face Builder v2.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `forensic-project-${caseInfo.caseNumber || 'case'}-${timestamp}.ffb`;
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
  }, [caseInfo, features, canvasSettings]);

  // Feature manipulation functions
  const duplicateFeature = useCallback(() => {
    if (selectedFeatures.length === 0) return;
    
    const newFeatures = [...features];
    selectedFeatures.forEach(id => {
      const feature = features.find(f => f.id === id);
      if (feature && !feature.locked) {
        const duplicate: PlacedFeature = {
          ...feature,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: feature.x + 20,
          y: feature.y + 20,
          zIndex: features.length + newFeatures.length - features.length,
          selected: false
        };
        newFeatures.push(duplicate);
      }
    });
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  const deleteSelectedFeatures = useCallback(() => {
    const newFeatures = features.filter(f => !selectedFeatures.includes(f.id));
    setFeatures(newFeatures);
    setSelectedFeatures([]);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  const bringToFront = useCallback(() => {
    if (selectedFeatures.length === 0) return;
    const maxZ = Math.max(...features.map(f => f.zIndex));
    const newFeatures = features.map(f => 
      selectedFeatures.includes(f.id) && !f.locked ? { ...f, zIndex: maxZ + 1 } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  const sendToBack = useCallback(() => {
    if (selectedFeatures.length === 0) return;
    const minZ = Math.min(...features.map(f => f.zIndex));
    const newFeatures = features.map(f => 
      selectedFeatures.includes(f.id) && !f.locked ? { ...f, zIndex: minZ - 1 } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  // Individual layer ordering functions for per-feature controls
  const bringFeatureToFront = useCallback((featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature || feature.locked) return;
    
    const maxZ = Math.max(...features.map(f => f.zIndex));
    const newFeatures = features.map(f => 
      f.id === featureId ? { ...f, zIndex: maxZ + 1 } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, addToHistory]);

  const sendFeatureToBack = useCallback((featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature || feature.locked) return;
    
    const minZ = Math.min(...features.map(f => f.zIndex));
    const newFeatures = features.map(f => 
      f.id === featureId ? { ...f, zIndex: minZ - 1 } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, addToHistory]);

  // Reorder layer: when dragging feature X over feature Y, set X's zIndex to be below Y
  const reorderLayer = useCallback((draggedFeatureId: string, targetFeatureId: string) => {
    const draggedFeature = features.find(f => f.id === draggedFeatureId);
    const targetFeature = features.find(f => f.id === targetFeatureId);
    
    if (!draggedFeature || !targetFeature || draggedFeature.id === targetFeature.id) return;
    if (draggedFeature.locked || targetFeature.locked) return;
    
    // Sort features by zIndex (lowest first for z-index calculation)
    const sortedFeatures = [...features].sort((a, b) => a.zIndex - b.zIndex);
    const draggedIndex = sortedFeatures.findIndex(f => f.id === draggedFeatureId);
    const targetIndex = sortedFeatures.findIndex(f => f.id === targetFeatureId);
    
    // If dragging to same position, no change needed
    if (draggedIndex === targetIndex) return;
    
    // Remove dragged feature from array
    const withoutDragged = sortedFeatures.filter(f => f.id !== draggedFeatureId);
    
    // Calculate insert position (insert before target)
    let insertIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      // Dragging down - target index decreases by 1 since we removed dragged item before it
      insertIndex = targetIndex - 1;
    }
    
    // Insert dragged feature at new position
    const newOrder = [
      ...withoutDragged.slice(0, insertIndex),
      draggedFeature,
      ...withoutDragged.slice(insertIndex)
    ];
    
    // Reassign z-indexes sequentially starting from 0 (lowest zIndex = bottom layer)
    const newFeatures = newOrder.map((f, index) => ({
      ...f,
      zIndex: index
    }));
    
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, addToHistory]);

  const toggleVisibility = useCallback((featureId: string) => {
    const newFeatures = features.map(f => 
      f.id === featureId ? { ...f, visible: !f.visible } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, addToHistory]);

  const toggleLock = useCallback((featureId: string) => {
    const newFeatures = features.map(f => 
      f.id === featureId ? { ...f, locked: !f.locked } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, addToHistory]);

  // Property updates for selected features - skip locked features
  const updateSelectedFeatures = useCallback((updates: Partial<PlacedFeature>) => {
    const newFeatures = features.map(f => 
      selectedFeatures.includes(f.id) && !f.locked ? { ...f, ...updates } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory, getFeatureDefaultSize]);

  // Scale selected features
  const scaleSelectedFeatures = useCallback((newScale: number) => {
    const newFeatures = features.map(f => {
      if (selectedFeatures.includes(f.id) && !f.locked) {
        const defaultSize = getFeatureDefaultSize(f.asset.category);
        const clampedScale = Math.max(0.5, Math.min(2.0, newScale));
        return {
          ...f,
          scale: clampedScale,
          width: defaultSize.width * clampedScale,
          height: defaultSize.height * clampedScale
        };
      }
      return f;
    });
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  // Incremental scaling functions
  const scaleUp = useCallback(() => {
    if (selectedFeatures.length > 0) {
      const selectedFeature = features.find(f => f.id === selectedFeatures[0]);
      if (selectedFeature) {
        const newScale = Math.min(2.0, selectedFeature.scale + 0.1);
        scaleSelectedFeatures(newScale);
      }
    }
  }, [selectedFeatures, features, scaleSelectedFeatures]);

  const scaleDown = useCallback(() => {
    if (selectedFeatures.length > 0) {
      const selectedFeature = features.find(f => f.id === selectedFeatures[0]);
      if (selectedFeature) {
        const newScale = Math.max(0.5, selectedFeature.scale - 0.1);
        scaleSelectedFeatures(newScale);
      }
    }
  }, [selectedFeatures, features, scaleSelectedFeatures]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't trigger when typing in inputs

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'd':
            e.preventDefault();
            duplicateFeature();
            break;
          case 's':
            e.preventDefault();
            saveProject();
            break;
          case 'e':
            e.preventDefault();
            exportCanvas();
            break;
          case 'a':
            e.preventDefault();
            setSelectedFeatures(features.map(f => f.id));
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            deleteSelectedFeatures();
            break;
          case 'Escape':
            setSelectedFeatures([]);
            break;
          case 'h':
            if (selectedFeatures.length > 0) {
              updateSelectedFeatures({ flipH: !features.find(f => selectedFeatures.includes(f.id))?.flipH });
            }
            break;
          case 'v':
            if (selectedFeatures.length > 0) {
              updateSelectedFeatures({ flipV: !features.find(f => selectedFeatures.includes(f.id))?.flipV });
            }
            break;
          case '[':
            bringToFront();
            break;
          case ']':
            sendToBack();
            break;
          case '+':
          case '=':
            e.preventDefault();
            scaleUp();
            break;
          case '-':
            e.preventDefault();
            scaleDown();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateFeature, saveProject, exportCanvas, deleteSelectedFeatures, updateSelectedFeatures, bringToFront, sendToBack, features, selectedFeatures, scaleUp, scaleDown]);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      addToHistory([]);
    }
  }, [history.length, addToHistory]);

  // Restore from localStorage on mount (for new sketches or if server load fails)
  useEffect(() => {
    if (requestedSketchId) {
      // If there's a sketch ID, wait for server load first
      return;
    }
    
    // For new sketches, try to restore from localStorage
    if (!hasRestoredFromLocalStorageRef.current) {
      const restored = restoreFromLocalStorage();
      if (restored) {
        notifications.info('Draft Restored', 'Your previous work has been restored from local storage.');
      }
    }
  }, [requestedSketchId, restoreFromLocalStorage, notifications]);

  // Save to localStorage on changes (debounced)
  useEffect(() => {
    if (localStorageSaveTimeoutRef.current) {
      clearTimeout(localStorageSaveTimeoutRef.current);
    }

    localStorageSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 2000); // 2 second debounce

    return () => {
      if (localStorageSaveTimeoutRef.current) {
        clearTimeout(localStorageSaveTimeoutRef.current);
      }
    };
  }, [features, zoom, panOffset, canvasSettings, selectedFeatures, caseInfo, saveDetails, saveToLocalStorage]);

  // Save to localStorage before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveToLocalStorage]);

  // Load sketch whenever the requested ID changes
  useEffect(() => {
    if (!requestedSketchId) {
      // If no sketch ID, try to restore from localStorage
      if (!hasRestoredFromLocalStorageRef.current) {
        restoreFromLocalStorage();
      }
      return;
    }

    // Always reload from database when sketch ID is requested
    // Don't skip reload - we need fresh data from database
    // The cache will be used by getSketchById, but we force refresh with true

    let cancelled = false;

    const fetchSketch = async (sketchId: string) => {
      setIsLoadingSketch(true);
      try {
        const sketchData = await getSketchById(sketchId, true);
        if (cancelled) {
          return;
        }

        const state = sketchData.sketch_state;
        const restoredFeatures: PlacedFeature[] = state?.features && Array.isArray(state.features)
          ? state.features.map((f: any) => ({
              id: f.id,
              asset: {
                id: f.asset.id,
                name: f.asset.name,
                path: f.asset.path,
                category: f.asset.category,
                tags: f.asset.tags || [],
                description: f.asset.description
              },
              x: f.x || 0,
              y: f.y || 0,
              width: f.width || 100,
              height: f.height || 100,
              rotation: f.rotation || 0,
              opacity: f.opacity ?? 1,
              zIndex: f.zIndex ?? 0,
              selected: false,
              locked: f.locked || false,
              visible: f.visible !== undefined ? f.visible : true,
              flipH: f.flipH || false,
              flipV: f.flipV || false,
              brightness: f.brightness ?? 100,
              contrast: f.contrast ?? 100,
              scale: f.scale ?? 1
            }))
          : [];

        setFeatures(restoredFeatures);
        const snapshot = restoredFeatures.map(feature => ({
          ...feature,
          asset: { ...feature.asset },
        }));
        setHistory([snapshot]);
        setHistoryIndex(0);

        const restoredZoom = state?.zoom ?? 100;
        setZoom(restoredZoom);

        const restoredPanOffset = state?.panOffset ?? { x: 0, y: 0 };
        setPanOffset(restoredPanOffset);

        if (state?.selectedFeatures) {
          setSelectedFeatures(state.selectedFeatures);
        } else {
          setSelectedFeatures([]);
        }

        setCanvasSettings({
          ...createInitialCanvasSettings(),
          ...(state?.canvasSettings || {}),
        });

        const stateHash = JSON.stringify({
          features: restoredFeatures.map((f: PlacedFeature) => ({
            id: f.id,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            rotation: f.rotation,
            opacity: f.opacity,
            zIndex: f.zIndex,
            visible: f.visible,
            locked: f.locked,
          })),
          zoom: restoredZoom,
          panOffset: restoredPanOffset,
        });
        setLastSavedStateHash(stateHash);

        // Restore caseInfo from sketch_state if available, otherwise from sketchData
        const baseCase = createInitialCaseInfo();
        const stateWithExtras = state as any;
        if (stateWithExtras?.caseInfo) {
          setCaseInfo({
            ...baseCase,
            ...stateWithExtras.caseInfo
          });
        } else {
          setCaseInfo({
            ...baseCase,
            caseNumber: sketchData.name || baseCase.caseNumber,
            officer: sketchData.officer || '',
            description: sketchData.description || '',
            witness: sketchData.eyewitness || '',
            suspect: sketchData.suspect || '',
            date: sketchData.date ? new Date(sketchData.date).toISOString().split('T')[0] : baseCase.date,
            priority: (sketchData.priority as CaseInfo['priority']) || 'medium',
            status: (sketchData.status as CaseInfo['status']) || 'draft',
          });
        }

        // Restore saveDetails from database (single source of truth)
        const extractedSaveDetails = extractSaveDetailsFromSketch(sketchData, state);
        setSaveDetails(extractedSaveDetails);

        setCurrentSketchId(sketchId);
        loadedSketchIdRef.current = sketchId;
        hasRestoredFromLocalStorageRef.current = false; // Allow localStorage restore if server fails next time
        
        // Clear any localStorage data for this sketch to prevent conflicts with database data
        clearLocalStorage();
      } catch (error: any) {
        if (cancelled) {
          return;
        }
        console.error('Failed to load sketch:', error);
        
        // Try to restore from localStorage as fallback
        const restored = restoreFromLocalStorage();
        if (restored) {
          notifications.warning('Server Load Failed', 'Loaded from local storage instead. Some data may be outdated.');
        } else {
          alert(`Failed to load sketch: ${error?.response?.data?.detail || error?.message || 'Unknown error'}`);
          invalidateSketchDetail(sketchId);
          resetSketchState();
          navigate('/sketch', { replace: true });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSketch(false);
        }
      }
    };

    fetchSketch(requestedSketchId);

    return () => {
      cancelled = true;
    };
  }, [requestedSketchId, navigate, resetSketchState]);

  // Auto-save functionality (every 30 seconds if changes detected, only when online)
  useEffect(() => {
    if (!currentSketchId) {
      // No sketch saved yet, don't auto-save to server (but still save to localStorage)
      return;
    }

    if (!isOnline) {
      // Don't auto-save to server when offline (localStorage is handled separately)
      return;
    }
    
    // Calculate state hash for change detection
    const stateHash = JSON.stringify({
      features: features.map(f => ({
        id: f.id,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        rotation: f.rotation,
        opacity: f.opacity,
        zIndex: f.zIndex,
        visible: f.visible,
        locked: f.locked
      })),
      zoom,
      panOffset
    });
    
    // Only auto-save if state has changed
    if (stateHash === lastSavedStateHash) {
      return;
    }
    
    // Clear existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }
    
    // Set up auto-save interval
    autoSaveIntervalRef.current = setInterval(async () => {
      if (!isOnline) {
        return; // Skip if offline
      }

      const currentHash = JSON.stringify({
        features: features.map(f => ({
          id: f.id,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          rotation: f.rotation,
          opacity: f.opacity,
          zIndex: f.zIndex,
          visible: f.visible,
          locked: f.locked
        })),
        zoom,
        panOffset
      });
      
      if (currentHash === lastSavedStateHash) {
        return; // No changes
      }
      
      try {
        // Use a minimal save (only state, no image update)
        const sketchState = {
          features: features.map(f => ({
            id: f.id,
            asset: {
              id: f.asset.id,
              name: f.asset.name,
              category: f.asset.category,
              path: f.asset.path
            },
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            rotation: f.rotation,
            opacity: f.opacity,
            zIndex: f.zIndex,
            locked: f.locked,
            visible: f.visible,
            flipH: f.flipH,
            flipV: f.flipV,
            brightness: f.brightness,
            contrast: f.contrast,
            scale: f.scale
          })),
          canvasSettings,
          zoom,
          panOffset,
          selectedFeatures
        };
        
        // Auto-save: Update only state (no image)
        const formData = new FormData();
        formData.append('sketch_state', JSON.stringify(sketchState));
        await apiClient.directUploadFile(`/sketches/${currentSketchId}`, formData, 'PUT');
        
        setLastSavedStateHash(currentHash);
        // Clear localStorage after successful server save
        clearLocalStorage();
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show alert for auto-save failures to avoid annoying user
        // localStorage will still have the data
      }
    }, 30000); // 30 seconds
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [features, zoom, panOffset, canvasSettings, selectedFeatures, currentSketchId, lastSavedStateHash, isOnline, clearLocalStorage]);

  // Responsive defaults: collapse panels on screens < 1024px
  // Handle screen size changes and ensure panels are closed on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarCollapsed(true);
        setRightSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile panel toggle handlers - ensure only one panel is open at a time on mobile
  const handleLeftPanelToggle = useCallback(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // On mobile, if opening left panel, close right panel
      if (leftSidebarCollapsed) {
        setRightSidebarCollapsed(true);
      }
      setLeftSidebarCollapsed(!leftSidebarCollapsed);
    } else {
      setLeftSidebarCollapsed(!leftSidebarCollapsed);
    }
  }, [leftSidebarCollapsed]);

  const handleRightPanelToggle = useCallback(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // On mobile, if opening right panel, close left panel
      if (rightSidebarCollapsed) {
        setLeftSidebarCollapsed(true);
      }
      setRightSidebarCollapsed(!rightSidebarCollapsed);
    } else {
      setRightSidebarCollapsed(!rightSidebarCollapsed);
    }
  }, [rightSidebarCollapsed]);

  // Redraw canvas with performance optimization
  const redrawCanvasRef = useRef<number | null>(null);
  useEffect(() => {
    if (redrawCanvasRef.current) {
      cancelAnimationFrame(redrawCanvasRef.current);
    }
    redrawCanvasRef.current = requestAnimationFrame(() => {
      drawCanvas();
      redrawCanvasRef.current = null;
    });
    return () => {
      if (redrawCanvasRef.current) {
        cancelAnimationFrame(redrawCanvasRef.current);
      }
    };
  }, [drawCanvas, features, selectedFeatures, zoom, showGrid, gridSize]);

  // Get selected feature for property panel
  const selectedFeature = selectedFeatures.length === 1 ? features.find(f => f.id === selectedFeatures[0]) || null : null;

  // Show loading indicator while loading sketch
  if (isLoadingSketch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading sketch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Enhanced Header - Reorganized */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 shadow-sm flex-shrink-0 text-align:center;">
        <div className="px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 text-align:center;">
          {/* Sketch Info Section */}
          <div className="mb-1 sm:mb-1.5 pb-1 sm:pb-1.5 border-b border-amber-200/50">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-slate-900 text-center">
                  {saveDetails.name || 'Unsaved Sketch'}
                </h2>
              </div>
              {(saveDetails.suspect || saveDetails.officer) && (
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                  {saveDetails.suspect && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">{saveDetails.suspect}</span>
                    </div>
                  )}
                  {saveDetails.officer && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">{saveDetails.officer}</span>
                    </div>
                  )}
                </div>
              )}
              {!currentSketchId && (
                <Button
                  onClick={handlePrimarySaveClick}
                  disabled={isSaving}
                  className="mt-1 sm:mt-0 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Save Sketch</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Main Toolbar - Reorganized */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-2.5">
            {/* Left Group: View & Edit Controls */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
              {/* History Controls - Moved First */}
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border-2 border-slate-200 shadow-sm">
                <Button onClick={undo} disabled={historyIndex <= 0} variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-100 text-slate-700 hover:text-slate-800 disabled:opacity-50 transition-all duration-200" title="Undo (Ctrl+Z)">
                  <Undo2 className="w-3.5 h-3.5" />
                </Button>
                <Button onClick={redo} disabled={historyIndex >= history.length - 1} variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-100 text-slate-700 hover:text-slate-800 disabled:opacity-50 transition-all duration-200" title="Redo (Ctrl+Shift+Z)">
                  <Redo2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6 hidden sm:block bg-amber-300" />
              
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border-2 border-slate-200 shadow-sm">
                <Button 
                  onClick={() => setZoom(Math.max(zoom - 25, 25))} 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-amber-100 text-amber-700 hover:text-amber-800 transition-all duration-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs text-slate-800 min-w-[45px] text-center font-mono px-2 py-0.5 bg-amber-50 rounded border border-amber-200 font-semibold">{zoom}%</span>
                <Button 
                  onClick={() => setZoom(Math.min(zoom + 25, 300))} 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-amber-100 text-amber-700 hover:text-amber-800 transition-all duration-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6 hidden sm:block bg-amber-300" />
              
              {/* Grid Controls */}
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border-2 border-slate-200 shadow-sm">
                <Button
                  onClick={() => setShowGrid(!showGrid)}
                  variant={showGrid ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 w-7 p-0 transition-all duration-200 ${
                    showGrid 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                      : "hover:bg-blue-100 text-blue-700 hover:text-blue-800"
                  }`}
                  title="Toggle Grid"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  onClick={deleteSelectedFeatures} 
                  disabled={selectedFeatures.length === 0} 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 disabled:opacity-50 transition-all duration-200" 
                  title="Delete (Del)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
           
            </div>
            
            {/* Right Group: File & Export Actions - Reorganized */}
            <div className="flex items-center justify-center lg:justify-end gap-1.5 sm:gap-2">
              <Button
                onClick={() => navigate('/sketches/recent')}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1 text-slate-600 border-slate-300 h-7 px-2 sm:h-7 sm:w-auto sm:px-3 hover:bg-amber-100/70"
                title="Recent sketches"
              >
                <Clock className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:hidden">Recent</span>
                <span className="hidden sm:inline text-xs">View Recent Sketches </span>
              </Button>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <Button onClick={() => setShowAssetUpload(true)} size="sm" className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white h-7 px-2 sm:h-7 sm:w-auto sm:px-3">
                <Upload className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:hidden">Upload</span>
                <span className="hidden sm:inline ml-1 text-xs">Assets Upload</span>
              </Button>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <Button
                onClick={handlePrimarySaveClick}
                size="sm"
                disabled={isSaving}
                className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 sm:h-7 sm:w-auto sm:px-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                )}
                <span className="text-[10px] sm:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
                <span className="hidden sm:inline text-xs">{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-7 px-2 sm:h-7 sm:w-auto sm:px-3" size="sm">
                    <Download className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[10px] sm:hidden">Download</span>
                    <span className="hidden sm:inline ml-1 text-xs">Download</span>
                    <ChevronDown className="hidden sm:block ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportPNG}>
                    <FileText className="mr-2 h-4 w-4" />
                    PNG Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportMetadata}>
                    <FileText className="mr-2 h-4 w-4" />
                    JSON Metadata
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row lg:items-stretch min-h-0 overflow-hidden relative">
        {/* Floating Toggle Buttons for Mobile - Ultra minimal design */}
        {isMobile && (
          <>
            <button
              onClick={handleLeftPanelToggle}
              className="fixed left-2 top-28 z-[100] lg:hidden bg-white/80 backdrop-blur-sm rounded p-1.5 hover:bg-white/90 transition-opacity duration-100"
              aria-label={leftSidebarCollapsed ? "Open Left Panel" : "Close Left Panel"}
              title={leftSidebarCollapsed ? "Open Asset Library" : "Close Asset Library"}
            >
              {leftSidebarCollapsed ? (
                <PanelLeftOpen className="w-3.5 h-3.5 text-slate-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <button
              onClick={handleRightPanelToggle}
              className="fixed right-2 top-28 z-[100] lg:hidden bg-white/80 backdrop-blur-sm rounded p-1.5 hover:bg-white/90 transition-opacity duration-100"
              aria-label={rightSidebarCollapsed ? "Open Right Panel" : "Close Right Panel"}
              title={rightSidebarCollapsed ? "Open Properties Panel" : "Close Properties Panel"}
            >
              {rightSidebarCollapsed ? (
                <PanelRightOpen className="w-3.5 h-3.5 text-slate-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          </>
        )}

        {/* Enhanced Left Sidebar */}
        <LeftPanel
          leftSidebarCollapsed={leftSidebarCollapsed}
          setLeftSidebarCollapsed={handleLeftPanelToggle}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAssetClick={addFeature}
          featureCategories={featureCategories}
          assetsLoading={assetsLoading}
          assetsError={assetsError}
          onRenameCategory={handleRenameCategory}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* Main Canvas Area */}
        <CanvasBoard
          canvasRef={canvasRef}
          showGrid={showGrid}
          gridSize={gridSize}
          zoom={zoom}
          panOffset={panOffset}
          handleCanvasMouseDown={handleCanvasMouseDown}
          handleCanvasMouseMove={handleCanvasMouseMove}
          handleCanvasMouseUp={handleCanvasMouseUp}
          handleCanvasDragOver={handleCanvasDragOver}
          handleCanvasDrop={handleCanvasDrop}
          featurePicker={featurePicker}
          onSelectFeatureFromPicker={selectFeatureFromPicker}
          onCloseFeaturePicker={closeFeaturePicker}
        />


        {/* Enhanced Right Panel */}
        <RightPanel
          rightSidebarCollapsed={rightSidebarCollapsed}
          setRightSidebarCollapsed={handleRightPanelToggle}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          features={features}
          selectedFeatures={selectedFeatures}
          selectedFeature={selectedFeature}
          featureCategories={featureCategories}
          filteredAssets={filteredAssets}
          caseInfo={caseInfo}
          setCaseInfo={setCaseInfo}
          canvasSettings={canvasSettings}
          setCanvasSettings={setCanvasSettings}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          gridSize={gridSize}
          setGridSize={setGridSize}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          addFeature={addFeature}
          toggleVisibility={toggleVisibility}
          toggleLock={toggleLock}
          updateSelectedFeatures={updateSelectedFeatures}
          scaleSelectedFeatures={scaleSelectedFeatures}
          scaleUp={scaleUp}
          scaleDown={scaleDown}
          resizeSelectedFeatures={resizeSelectedFeatures}
          selectedCategory={selectedCategory}
          bringToFront={bringToFront}
          sendToBack={sendToBack}
          bringFeatureToFront={bringFeatureToFront}
          sendFeatureToBack={sendFeatureToBack}
          duplicateFeature={duplicateFeature}
          reorderLayer={reorderLayer}
          deleteSelectedFeatures={deleteSelectedFeatures}
          exportPNG={exportPNG}
          saveProject={saveProject}
          exportMetadata={exportMetadata}
          uploadedAssets={filteredUploadedAssets}
          assetSearchTerm={assetSearchTerm}
          setAssetSearchTerm={setAssetSearchTerm}
          onAssetSelect={handleAssetSelect}
          onAssetDelete={handleAssetDelete}
          onShowUpload={() => setShowAssetUpload(true)}
          onAssetView={handleAssetView}
          onAssetEdit={handleAssetEdit}
          currentSketchId={currentSketchId}
          saveDetails={saveDetails}
          onSaveClick={handlePrimarySaveClick}
          onUpdateDetails={handleUpdateSketchDetails}
          isSaving={isSaving}
        />
      </div>

      {/* Save Sketch Modal */}
      <SaveSketchModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onSave={handleSaveFromModal}
        initialData={saveDetails}
        isLoading={isSaving}
      />

      {/* Enhanced Status Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-amber-200 px-3 sm:px-4 md:px-6 py-2 shadow-sm flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Ready</span>
            </div>
            {caseInfo.caseNumber && (
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Hash className="w-3 h-3" />
                <span>Case: {caseInfo.caseNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <Calendar className="w-3 h-3" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center justify-center sm:justify-end space-x-4">
              <span className="hidden sm:inline">Features: {features.length}</span>
              <span className="sm:hidden">F: {features.length}</span>
              <span className="hidden sm:inline">Selected: {selectedFeatures.length}</span>
              <span className="sm:hidden">S: {selectedFeatures.length}</span>
              <span>Zoom: {zoom}%</span>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                caseInfo.priority === 'urgent' ? 'bg-red-500' :
                caseInfo.priority === 'high' ? 'bg-orange-500' :
                caseInfo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="capitalize hidden sm:inline">{caseInfo.priority} Priority</span>
              <span className="capitalize sm:hidden">{caseInfo.priority}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Tooltip (Hidden by default, could be toggled) */}
      <div className="fixed bottom-4 right-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
        <Card className="bg-slate-900 text-white text-xs p-3 max-w-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Ctrl+Z</span><span>Undo</span>
            </div>
            <div className="flex justify-between">
              <span>Ctrl+Y</span><span>Redo</span>
            </div>
            <div className="flex justify-between">
              <span>Ctrl+D</span><span>Duplicate</span>
            </div>
            <div className="flex justify-between">
              <span>Del</span><span>Delete</span>
            </div>
            <div className="flex justify-between">
              <span>H</span><span>Flip Horizontal</span>
            </div>
            <div className="flex justify-between">
              <span>V</span><span>Flip Vertical</span>
            </div>
            <div className="flex justify-between">
              <span>Esc</span><span>Deselect All</span>
            </div>
            <div className="flex justify-between">
              <span>+</span><span>Scale Up</span>
            </div>
            <div className="flex justify-between">
              <span>-</span><span>Scale Down</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Upload Modal */}
      {showAssetUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload New Asset</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAssetUpload(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <AssetUploadForm onUpload={handleAssetUpload} onClose={() => setShowAssetUpload(false)} />
          </div>
        </div>
      )}

      {/* Fullscreen Asset Viewer */}
      {fullscreenAsset && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
              onClick={handleFullscreenClose}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation arrows */}
            {uploadedAssets.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => handleFullscreenNavigate('prev')}
                >
                  <ChevronDown className="w-6 h-6 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => handleFullscreenNavigate('next')}
                >
                  <ChevronDown className="w-6 h-6 -rotate-90" />
                </Button>
              </>
            )}

            {/* Asset image */}
            <div className="max-w-full max-h-full flex flex-col items-center">
              <img
                src={fullscreenAsset.cloudinary_url}
                alt={fullscreenAsset.name}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="text-xl font-semibold">{fullscreenAsset.name}</h3>
                <p className="text-sm opacity-80">{fullscreenAsset.type}</p>
                {uploadedAssets.length > 1 && (
                  <p className="text-xs opacity-60 mt-2">
                    {fullscreenIndex + 1} of {uploadedAssets.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Asset Upload Form Component
const AssetUploadForm: React.FC<{
  onUpload: (data: AssetUploadType) => Promise<void>;
  onClose: () => void;
}> = ({ onUpload, onClose }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'face-shapes',
    description: '',
    tags: [] as string[],
    file: null as File | null
  });
  const [isUploading, setIsUploading] = React.useState(false);
  const [newTag, setNewTag] = React.useState('');

  const assetTypes = [
    { value: 'face-shapes', label: 'Face Shapes' },
    { value: 'eyes', label: 'Eyes' },
    { value: 'eyebrows', label: 'Eyebrows' },
    { value: 'nose', label: 'Nose' },
    { value: 'lips', label: 'Lips' },
    { value: 'hair', label: 'Hair' },
    { value: 'facial-hair', label: 'Facial Hair' },
    { value: 'ears', label: 'Ears' },
    { value: 'neck', label: 'Neck' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;
    
    setIsUploading(true);
    try {
      await onUpload({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        tags: formData.tags,
        file: formData.file
      });
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Asset Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter asset name"
          required
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Asset Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          title="Select asset type"
        >
          {assetTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  tags: prev.tags.filter((_, i) => i !== index) 
                }))}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newTag.trim()) {
                  setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
                  setNewTag('');
                }
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => {
              if (newTag.trim()) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
                setNewTag('');
              }
            }}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Image File</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
            className="hidden"
            id="asset-file"
            required
          />
          <label htmlFor="asset-file" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {formData.file ? formData.file.name : 'Click to select image'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, JPEG, GIF, WebP
            </p>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading || !formData.file}>
          {isUploading ? 'Uploading...' : 'Upload Asset'}
        </Button>
      </div>
    </form>
  );
};

export default FaceSketch;  