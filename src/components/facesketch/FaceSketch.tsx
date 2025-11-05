/*eslint-disable*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card } from '../ui/card';
import { 
  Save, Download, Undo2, Redo2, FileText, User, Hash, Eye, Minus, Triangle, Smile, Waves, Zap, LucideIcon,
  ChevronDown, Calendar, Settings, Upload, Plus, X, ZoomIn, ZoomOut, Grid3X3, Target, Copy, Trash2
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
  const [activeTab, setActiveTab] = useState('workspace');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [autoSelectedFeature, setAutoSelectedFeature] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Performance optimization: use refs to store pending updates during drag/resize
  const pendingFeaturesRef = useRef<PlacedFeature[] | null>(null);
  const rafUpdateRef = useRef<number | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [caseInfo, setCaseInfo] = useState<CaseInfo>({
    caseNumber: '',
    date: new Date().toISOString().split('T')[0],
    officer: '',
    description: '',
    witness: '',
    priority: 'medium',
    status: 'draft'
  });

  const [canvasSettings, setCanvasSettings] = useState({
    backgroundColor: '#ffffff',
    showRulers: false,
    showSafeArea: false,
    quality: 'high' as 'standard' | 'high'
  });

  // Dynamic asset loading system
  const [featureCategories, setFeatureCategories] = useState<Record<string, {
    name: string;
    icon: LucideIcon;
    color: string;
    assets: FeatureAsset[];
  }>>({});
  const [assetsLoading, setAssetsLoading] = useState(true);
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

  // Asset category configuration
  const assetCategories = React.useMemo(() => ({
    'face-shapes': {
      name: 'Face Shapes',
      icon: User,
      color: 'bg-blue-100 text-blue-700',
      folder: 'head',
      maxAssets: 10
    },
    'eyes': {
      name: 'Eyes',
      icon: Eye,
      color: 'bg-green-100 text-green-700',
      folder: 'eyes',
      maxAssets: 12
    },
    'eyebrows': {
      name: 'Eyebrows',
      icon: Minus,
      color: 'bg-purple-100 text-purple-700',
      folder: 'eyebrows',
      maxAssets: 12
    },
    'nose': {
      name: 'Nose',
      icon: Triangle,
      color: 'bg-orange-100 text-orange-700',
      folder: 'nose',
      maxAssets: 12
    },
    'lips': {
      name: 'Lips',
      icon: Smile,
      color: 'bg-pink-100 text-pink-700',
      folder: 'lips',
      maxAssets: 12
    },
    'hair': {
      name: 'Hair',
      icon: Waves,
      color: 'bg-yellow-100 text-yellow-700',
      folder: 'hair',
      maxAssets: 12
    },
    'facial-hair': {
      name: 'Mustach',
      icon: Zap,
      color: 'bg-gray-100 text-gray-700',
      folder: 'mustach',
      maxAssets: 12
    },
    'accessories': {
      name: 'More',
      icon: Settings,
      color: 'bg-indigo-100 text-indigo-700',
      folder: 'more',
      maxAssets: 6
    }
  }), []);

  // Generate asset names based on category
  const generateAssetNames = (category: string, folder: string, maxAssets: number): Record<string, string> => {
    const names: Record<string, Record<string, string>> = {
      'face-shapes': {
        '01': 'Oval Face',
        '02': 'Round Face',
        '03': 'Square Face',
        '04': 'Heart Face',
        '05': 'Diamond Face',
        '06': 'Triangle Face',
        '07': 'Rectangle Face',
        '08': 'Oblong Face',
        '09': 'Long Face',
        '10': 'Wide Face'
      },
      'eyes': {
        '01': 'Almond Eyes',
        '02': 'Round Eyes',
        '03': 'Hooded Eyes',
        '04': 'Upturned Eyes',
        '05': 'Downturned Eyes',
        '06': 'Wide-Set Eyes',
        '07': 'Close-Set Eyes',
        '08': 'Monolid Eyes',
        '09': 'Deep-Set Eyes',
        '10': 'Prominent Eyes',
        '11': 'Small Eyes',
        '12': 'Large Eyes'
      },
      'eyebrows': {
        '01': 'Straight Brows',
        '02': 'Arched Brows',
        '03': 'Thick Brows',
        '04': 'Thin Brows',
        '05': 'Unibrow',
        '06': 'Bushy Brows',
        '07': 'Angled Brows',
        '08': 'Rounded Brows',
        '09': 'Sparse Brows',
        '10': 'Full Brows',
        '11': 'Natural Brows',
        '12': 'Groomed Brows'
      },
      'nose': {
        '01': 'Straight Nose',
        '02': 'Roman Nose',
        '03': 'Button Nose',
        '04': 'Wide Nose',
        '05': 'Narrow Nose',
        '06': 'Aquiline Nose',
        '07': 'Snub Nose',
        '08': 'Crooked Nose',
        '09': 'Long Nose',
        '10': 'Short Nose',
        '11': 'Pointed Nose',
        '12': 'Flat Nose'
      },
      'lips': {
        '01': 'Full Lips',
        '02': 'Thin Lips',
        '03': 'Cupid\'s Bow',
        '04': 'Wide Lips',
        '05': 'Small Lips',
        '06': 'Downturned Lips',
        '07': 'Upturned Lips',
        '08': 'Heart Lips',
        '09': 'Bow Lips',
        '10': 'Natural Lips',
        '11': 'Plump Lips',
        '12': 'Delicate Lips'
      },
      'hair': {
        '01': 'Short Straight',
        '02': 'Medium Wavy',
        '03': 'Long Curly',
        '04': 'Buzz Cut',
        '05': 'Afro',
        '06': 'Balding',
        '07': 'Ponytail',
        '08': 'Dreadlocks',
        '09': 'Long Straight',
        '10': 'Short Curly',
        '11': 'Medium Straight',
        '12': 'Long Wavy'
      },
      'facial-hair': {
        '01': 'Clean Shaven',
        '02': '5 O\'Clock Shadow',
        '03': 'Goatee',
        '04': 'Full Beard',
        '05': 'Mustache',
        '06': 'Van Dyke',
        '07': 'Soul Patch',
        '08': 'Handlebar',
        '09': 'Stubble',
        '10': 'Chin Strap',
        '11': 'Sideburns',
        '12': 'Full Goatee'
      },
      'accessories': {
        '01': 'Reading Glasses',
        '02': 'Sunglasses',
        '03': 'Baseball Cap',
        '04': 'Beanie',
        '05': 'Earrings',
        '06': 'Scarf'
      }
    };

    return names[category] || {};
  };

  // Generate tags based on category
  const generateAssetTags = (category: string, assetName: string) => {
    const tagMap: Record<string, string[]> = {
      'face-shapes': ['face', 'shape', 'structure'],
      'eyes': ['eyes', 'vision', 'facial'],
      'eyebrows': ['eyebrows', 'brows', 'facial'],
      'nose': ['nose', 'nasal', 'facial'],
      'lips': ['lips', 'mouth', 'facial'],
      'hair': ['hair', 'hairstyle', 'head'],
      'facial-hair': ['beard', 'mustache', 'facial'],
      'accessories': ['accessory', 'wear', 'item']
    };

    const baseTags = tagMap[category] || [];
    const nameWords = assetName.toLowerCase().split(' ').filter(word => word.length > 2);
    return [...baseTags, ...nameWords];
  };

  // Load assets dynamically
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setAssetsLoading(true);
        setAssetsError(null);
        
        const categories: Record<string, {
          name: string;
          icon: LucideIcon;
          color: string;
          assets: FeatureAsset[];
        }> = {};

        // Load local assets
        Object.entries(assetCategories).forEach(([categoryKey, categoryConfig]) => {
          const assets: FeatureAsset[] = [];
          const assetNames = generateAssetNames(categoryKey, categoryConfig.folder, categoryConfig.maxAssets);

          // Generate assets for this category
          for (let i = 1; i <= categoryConfig.maxAssets; i++) {
            const assetNumber = i.toString().padStart(2, '0');
            const assetName = assetNames[assetNumber] || `${categoryConfig.name} ${assetNumber}`;
            const path = `/assets/${categoryConfig.folder}/${assetNumber}.png`;
            
            assets.push({
              id: `${categoryKey}-${assetNumber}`,
              name: assetName,
              path: path,
              category: categoryKey,
              tags: generateAssetTags(categoryKey, assetName),
              description: `${assetName} - ${categoryConfig.name} option`
            });
          }

          categories[categoryKey] = {
            name: categoryConfig.name,
            icon: categoryConfig.icon,
            color: categoryConfig.color,
            assets: assets
          };
        });

        // Load uploaded assets from API
        try {
          const uploadedAssets = await apiClient.directGet<any[]>('/assets');
          
          // Add uploaded assets to their respective categories
          uploadedAssets.forEach((asset: any) => {
            if (categories[asset.type]) {
              const featureAsset: FeatureAsset = {
                id: asset.id,
                name: asset.name,
                path: asset.cloudinary_url,
                category: asset.type,
                tags: asset.tags,
                description: asset.description
              };
              categories[asset.type].assets.push(featureAsset);
            }
          });
        } catch (apiError) {
          console.warn('Failed to load uploaded assets:', apiError);
          // Continue with local assets only
        }

        setFeatureCategories(categories);
        setAssetsLoading(false);
      } catch (error) {
        console.error('Error loading assets:', error);
        setAssetsError('Failed to load assets. Please refresh the page.');
        setAssetsLoading(false);
      }
    };

    loadAssets();
  }, [assetCategories]);

  // Load uploaded assets
  useEffect(() => {
    const loadUploadedAssets = async () => {
      try {
        const assets = await apiClient.directGet<any[]>('/assets');
        setUploadedAssets(assets);
      } catch (error) {
        console.warn('Backend server not available, using mock data:', error);
        // Mock data for testing
        setUploadedAssets([
          {
            id: 'mock-1',
            name: 'Sample Face Shape',
            type: 'face-shapes',
            category: 'face-shapes',
            cloudinary_url: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=Face+Shape',
            tags: ['sample', 'face'],
            description: 'Sample face shape for testing',
            upload_date: new Date().toISOString(),
            usage_count: 0,
            metadata: { width: 200, height: 200, file_size: 1000, format: 'png' }
          }
        ]);
      }
    };

    loadUploadedAssets();
  }, []);

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

  // Asset upload handler
  const handleAssetUpload = async (uploadData: AssetUploadType) => {
    try {
      const formData = new FormData();
      formData.append('name', uploadData.name);
      formData.append('type', uploadData.type);
      formData.append('description', uploadData.description || '');
      formData.append('tags', JSON.stringify(uploadData.tags));
      formData.append('file', uploadData.file);

      const newAsset = await apiClient.directUploadFile<any>('/assets/upload', formData);
      setUploadedAssets(prev => [...prev, newAsset]);
      setShowAssetUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
      // Show user-friendly message
      alert('Backend server is not available. Please start the backend server to enable asset uploads.');
    }
  };

  // Asset delete handler
  const handleAssetDelete = async (assetId: string) => {
    try {
      await apiClient.directDelete(`/assets/${assetId}`);
      setUploadedAssets(prev => prev.filter(asset => asset.id !== assetId));
    } catch (error) {
      console.error('Delete error:', error);
      // For mock data, just remove from local state
      setUploadedAssets(prev => prev.filter(asset => asset.id !== assetId));
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
    const index = filteredUploadedAssets.findIndex(a => a.id === asset.id);
    setFullscreenIndex(index);
    setFullscreenAsset(asset);
  };

  const handleFullscreenClose = () => {
    setFullscreenAsset(null);
    setFullscreenIndex(0);
  };

  const handleFullscreenNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (fullscreenIndex + 1) % filteredUploadedAssets.length
      : (fullscreenIndex - 1 + filteredUploadedAssets.length) % filteredUploadedAssets.length;
    
    setFullscreenIndex(newIndex);
    setFullscreenAsset(filteredUploadedAssets[newIndex]);
  };

  // Asset edit handler
  const handleAssetEdit = async (assetId: string, newName: string) => {
    try {
      await apiClient.directPut(`/assets/${assetId}/name`, { name: newName });
      // Update local state
      setUploadedAssets(prev => 
        prev.map(asset => 
          asset.id === assetId ? { ...asset, name: newName } : asset
        )
      );
    } catch (error) {
      console.error('Edit error:', error);
      // For mock data, just update local state
      setUploadedAssets(prev => 
        prev.map(asset => 
          asset.id === assetId ? { ...asset, name: newName } : asset
        )
      );
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
        img.src = feature.asset.path;
        imageCacheRef.current.set(feature.asset.path, img);
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
      if (selectedFeature && selectedFeature.visible) {
        const handle = getResizeHandle(x, y, selectedFeature);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setResizeStart({ x, y, width: selectedFeature.width, height: selectedFeature.height });
          return;
        }
      }
    }

    // Find all features at this location (including overlapping ones)
    const featuresAtLocation = features.filter(feature => {
      if (!feature.visible) return false;
      
      const featureX = feature.x;
      const featureY = feature.y;
      const featureWidth = feature.width;
      const featureHeight = feature.height;
      
      return x >= featureX && x <= featureX + featureWidth &&
             y >= featureY && y <= featureY + featureHeight;
    });

    if (featuresAtLocation.length > 0) {
      if (featuresAtLocation.length === 1) {
        // Single feature - select it directly
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
        
        setIsDragging(true);
        setDragStart({ x: x - clickedFeature.x, y: y - clickedFeature.y });
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
        
        // Auto-select the smallest feature instead of showing picker
        const smallestFeature = sortedFeatures[0];
        setSelectedFeatures([smallestFeature.id]);
        setIsDragging(true);
        setDragStart({ x: x - smallestFeature.x, y: y - smallestFeature.y });
        
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
      if (!selectedFeature) return;

      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = selectedFeature.x;
      let newY = selectedFeature.y;

      // Apply resize based on handle type
      switch (resizeHandle) {
        case 'nw': // top-left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newX = selectedFeature.x + (resizeStart.width - newWidth);
          newY = selectedFeature.y + (resizeStart.height - newHeight);
          break;
        case 'n': // top
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = selectedFeature.y + (resizeStart.height - newHeight);
          break;
        case 'ne': // top-right
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          newY = selectedFeature.y + (resizeStart.height - newHeight);
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
          newX = selectedFeature.x + (resizeStart.width - newWidth);
          break;
        case 'w': // left
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newX = selectedFeature.x + (resizeStart.width - newWidth);
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

    // Handle dragging
    if (isDragging && selectedFeatures.length > 0) {
      const newFeatures = features.map(feature => {
        if (selectedFeatures.includes(feature.id)) {
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


  // Resize selected features
  const resizeSelectedFeatures = useCallback((newWidth: number, newHeight: number) => {
    console.log('Resizing features:', { newWidth, newHeight, selectedFeatures });
    const newFeatures = features.map(f => {
      if (selectedFeatures.includes(f.id)) {
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
      const assetData = e.dataTransfer.getData('application/json');
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
        selectedFeatures
      };
      
      // Create FormData
      const formData = new FormData();
      formData.append('name', saveData.name);
      formData.append('suspect', saveData.suspect || '');
      formData.append('eyewitness', saveData.eyewitness || '');
      formData.append('officer', saveData.officer || '');
      formData.append('date', saveData.date || new Date().toISOString());
      formData.append('reason', saveData.reason || '');
      formData.append('description', saveData.description || '');
      formData.append('priority', saveData.priority);
      formData.append('status', saveData.status);
      formData.append('sketch_state', JSON.stringify(sketchState));
      formData.append('image', imageBlob, `${saveData.name.replace(/\s+/g, '_')}.png`);
      
      // Call API
      if (currentSketchId) {
        // Update existing sketch - use PUT with FormData
        await apiClient.directUploadFile<{ status: string; message: string; sketch_id: string }>(
          `/sketches/${currentSketchId}`,
          formData,
          'PUT'
        );
        
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
        
        alert('Sketch updated successfully!');
      } else {
        // Create new sketch
        const result = await apiClient.directUploadFile<{ status: string; message: string; sketch_id: string }>('/sketches/save', formData);
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
        
        alert('Sketch saved successfully!');
        
        // Update URL with sketch ID
        const url = new URL(window.location.href);
        url.searchParams.set('id', sketchId);
        window.history.pushState({}, '', url.toString());
      }
      
      setShowSaveModal(false);
    } catch (error: any) {
      console.error('Error saving sketch:', error);
      alert(`Failed to save sketch: ${error?.response?.data?.detail || error?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [features, canvasSettings, zoom, panOffset, selectedFeatures, exportCanvasAsBlob, currentSketchId]);

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
      if (feature) {
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
      selectedFeatures.includes(f.id) ? { ...f, zIndex: maxZ + 1 } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  const sendToBack = useCallback(() => {
    if (selectedFeatures.length === 0) return;
    const minZ = Math.min(...features.map(f => f.zIndex));
    const newFeatures = features.map(f => 
      selectedFeatures.includes(f.id) ? { ...f, zIndex: minZ - 1 } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory]);

  // Reorder layer: when dragging feature X over feature Y, set X's zIndex to be below Y
  const reorderLayer = useCallback((draggedFeatureId: string, targetFeatureId: string) => {
    const draggedFeature = features.find(f => f.id === draggedFeatureId);
    const targetFeature = features.find(f => f.id === targetFeatureId);
    
    if (!draggedFeature || !targetFeature || draggedFeature.id === targetFeature.id) return;
    
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

  // Property updates for selected features
  const updateSelectedFeatures = useCallback((updates: Partial<PlacedFeature>) => {
    const newFeatures = features.map(f => 
      selectedFeatures.includes(f.id) ? { ...f, ...updates } : f
    );
    setFeatures(newFeatures);
    addToHistory(newFeatures);
  }, [features, selectedFeatures, addToHistory, getFeatureDefaultSize]);

  // Scale selected features
  const scaleSelectedFeatures = useCallback((newScale: number) => {
    const newFeatures = features.map(f => {
      if (selectedFeatures.includes(f.id)) {
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

  // Load sketch from URL params on mount
  useEffect(() => {
    const loadSketchFromURL = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sketchId = urlParams.get('id');
      
      if (!sketchId) {
        // No sketch ID in URL, start with empty state
        if (history.length === 0) {
          addToHistory([]);
        }
        return;
      }
      
      setIsLoadingSketch(true);
      setCurrentSketchId(sketchId);
      
      try {
        const sketchData = await apiClient.directGet<{
          sketch_state: any;
          name: string;
          suspect?: string;
          eyewitness?: string;
          officer?: string;
          date?: string;
          reason?: string;
          description?: string;
          priority?: string;
          status?: string;
        }>(`/sketches/${sketchId}`);
        
        if (sketchData.sketch_state) {
          const state = sketchData.sketch_state;
          
          // Restore features
          if (state.features && Array.isArray(state.features)) {
            const restoredFeatures: PlacedFeature[] = state.features.map((f: any) => ({
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
            addToHistory(restoredFeatures);
            
            // Update state hash for auto-save tracking (prevent immediate auto-save after load)
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
                locked: f.locked
              })),
              zoom: state.zoom || zoom,
              panOffset: state.panOffset || panOffset
            });
            setLastSavedStateHash(stateHash);
          }
          
          // Restore case info if available
          if (sketchData.name) {
            setCaseInfo(prev => ({
              ...prev,
              caseNumber: sketchData.name,
              officer: sketchData.officer || '',
              description: sketchData.description || '',
              witness: sketchData.eyewitness || '',
              date: sketchData.date ? new Date(sketchData.date).toISOString().split('T')[0] : prev.date,
              priority: (sketchData.priority as any) || 'medium',
              status: (sketchData.status as any) || 'draft'
            }));
          }
        }
      } catch (error: any) {
        console.error('Failed to load sketch:', error);
        alert(`Failed to load sketch: ${error?.response?.data?.detail || error?.message || 'Unknown error'}`);
        // Clear sketch ID from URL if loading failed
        const url = new URL(window.location.href);
        url.searchParams.delete('id');
        window.history.replaceState({}, '', url.toString());
        setCurrentSketchId(null);
        if (history.length === 0) {
          addToHistory([]);
        }
      } finally {
        setIsLoadingSketch(false);
      }
    };
    
    loadSketchFromURL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally excluding dependencies

  // Auto-save functionality (every 30 seconds if changes detected)
  useEffect(() => {
    if (!currentSketchId) {
      // No sketch saved yet, don't auto-save
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
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show alert for auto-save failures to avoid annoying user
      }
    }, 30000); // 30 seconds
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [features, zoom, panOffset, canvasSettings, selectedFeatures, currentSketchId, lastSavedStateHash]);

  // Responsive defaults: collapse panels on screens < 1024px
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        setLeftSidebarCollapsed(true);
        setRightSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Canvas Controls - Left Side */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
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
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  variant={snapToGrid ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 w-7 p-0 transition-all duration-200 ${
                    snapToGrid 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                      : "hover:bg-blue-100 text-blue-700 hover:text-blue-800"
                  }`}
                  title="Snap to Grid"
                >
                  <Target className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 hidden sm:block bg-amber-300" />

              {/* Edit Controls */}
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border-2 border-slate-200 shadow-sm">
                <Button 
                  onClick={duplicateFeature} 
                  disabled={selectedFeatures.length === 0} 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-green-100 text-green-700 hover:text-green-800 disabled:opacity-50 transition-all duration-200" 
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
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
            
            {/* Action Buttons - Right Side */}
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <Button onClick={undo} disabled={historyIndex <= 0} variant="outline" size="sm" className="text-slate-600 border-slate-300 h-7 w-7 sm:w-auto sm:px-3">
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1 text-xs">Undo</span>
              </Button>
              <Button onClick={redo} disabled={historyIndex >= history.length - 1} variant="outline" size="sm" className="text-slate-600 border-slate-300 h-7 w-7 sm:w-auto sm:px-3">
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1 text-xs">Redo</span>
              </Button>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <Button onClick={() => setShowAssetUpload(true)} size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 w-7 sm:w-auto sm:px-3">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1 text-xs">Upload</span>
              </Button>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-7 w-7 sm:w-auto sm:px-3" size="sm">
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline ml-1 text-xs">Download</span>
                    <ChevronDown className="hidden sm:block ml-1 h-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportPNG}>
                    <FileText className="mr-2 h-4 w-4" />
                    PNG Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSaveModal(true)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Database
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveProject}>
                    <FileText className="mr-2 h-4 w-4" />
                    FFB Project
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

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Enhanced Left Sidebar */}
        <LeftPanel
          leftSidebarCollapsed={leftSidebarCollapsed}
          setLeftSidebarCollapsed={setLeftSidebarCollapsed}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAssetClick={addFeature}
          featureCategories={featureCategories}
          assetsLoading={assetsLoading}
          assetsError={assetsError}
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
          setRightSidebarCollapsed={setRightSidebarCollapsed}
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
        />
      </div>

      {/* Save Sketch Modal */}
      <SaveSketchModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onSave={handleSaveSketch}
        isLoading={isSaving}
      />

      {/* Enhanced Status Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-amber-200 px-3 sm:px-4 md:px-6 py-2 shadow-sm">
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
            {filteredUploadedAssets.length > 1 && (
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
                {filteredUploadedAssets.length > 1 && (
                  <p className="text-xs opacity-60 mt-2">
                    {fullscreenIndex + 1} of {filteredUploadedAssets.length}
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