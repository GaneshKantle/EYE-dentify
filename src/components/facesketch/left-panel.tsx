/*eslint-disable*/
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Search, Maximize2, Minimize2, LucideIcon, AlertTriangle } from 'lucide-react';

interface FeatureAsset {
  id: string;
  name: string;
  category: string;
  path: string;
  tags: string[];
  description?: string;
}

interface LeftPanelProps {
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAssetClick: (asset: FeatureAsset) => void;
  featureCategories: Record<string, {
    name: string;
    icon: LucideIcon;
    color: string;
    assets: FeatureAsset[];
  }>;
  assetsLoading: boolean;
  assetsError: string | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  leftSidebarCollapsed,
  setLeftSidebarCollapsed,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  onAssetClick,
  featureCategories,
  assetsLoading,
  assetsError
}) => {
  return (
    <div className={`${leftSidebarCollapsed ? 'w-17' : 'w-full lg:w-80'} bg-white/90 backdrop-blur-sm border-r border-amber-200 flex flex-col transition-all duration-300 shadow-sm order-2 lg:order-1`}>
      <div className="p-3 md:p-4 border-b border-amber-200">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className={`font-semibold text-slate-800 ${leftSidebarCollapsed ? 'hidden' : ''}`}>Feature Library</h3>
          <Button 
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)} 
            variant="outline" 
            size="sm"
            className="text-slate-600 border-slate-300 h-8 w-8 p-0"
          >
            {leftSidebarCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>
        
        {!leftSidebarCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 md:p-4 space-y-2">
          {/* Loading State */}
          {assetsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-slate-600">Loading assets...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {assetsError && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <p className="text-sm text-red-600">{assetsError}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Categories */}
          {!assetsLoading && !assetsError && Object.entries(featureCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
                title={leftSidebarCollapsed ? category.name : ''}
              >
                <div className={`p-1.5 rounded-md ${category.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                {!leftSidebarCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left text-sm">{category.name}</span>
                    <Badge className="bg-slate-100 text-slate-600 text-xs">
                      {category.assets.length}
                    </Badge>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LeftPanel;