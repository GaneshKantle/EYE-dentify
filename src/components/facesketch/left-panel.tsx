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
    <div className={`${leftSidebarCollapsed ? 'w-12 sm:w-14 md:w-16' : 'w-36 sm:w-40 md:w-44'} bg-white/90 backdrop-blur-sm border-r border-amber-200 flex flex-col transition-all duration-300 shadow-sm order-2 lg:order-1 flex-shrink-0 lg:sticky lg:top-0 lg:self-start`} style={{ maxHeight: 'calc(100vh - 8rem)' }}>
      <div className={`p-1.5 sm:p-2 border-b border-amber-200 flex-shrink-0`}>
        <div className={`flex items-center ${leftSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Button 
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)} 
            variant="outline" 
            size="sm"
            className="text-slate-600 border-slate-300 h-6 w-6 sm:h-7 sm:w-7 p-0 flex-shrink-0"
          >
            {leftSidebarCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          {!leftSidebarCollapsed && (
            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm hidden md:block">Library</h3>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto min-h-0">
        <div className="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5">
          {/* Loading State */}
          {assetsLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {assetsError && (
            <div className="flex items-center justify-center py-6">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          )}

          {/* Categories */}
          {!assetsLoading && !assetsError && Object.entries(featureCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full flex items-center ${leftSidebarCollapsed ? 'justify-center flex-col space-y-0.5' : 'gap-1.5 sm:gap-2'} p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
                title={category.name}
              >
                <div className={`p-0.5 sm:p-1 rounded-md ${category.color} flex-shrink-0`}>
                  <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                {!leftSidebarCollapsed && (
                  <>
                    <span className="font-medium text-[10px] sm:text-xs text-left min-w-0 flex-1 leading-tight truncate">
                      {category.name}
                    </span>
                    <Badge className="bg-slate-100 text-slate-600 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap">
                      {category.assets.length}
                    </Badge>
                  </>
                )}
                {leftSidebarCollapsed && (
                  <Badge className="bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] px-0.5 sm:px-1 py-0 mt-0.5">
                    {category.assets.length}
                  </Badge>
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