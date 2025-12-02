/*eslint-disable*/
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Search, Maximize2, Minimize2, LucideIcon, AlertTriangle, Edit2, Trash2, Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

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
  onRenameCategory: (categoryKey: string, newName: string) => void;
  onDeleteCategory: (categoryKey: string) => void;
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
  assetsError,
  onRenameCategory,
  onDeleteCategory
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleStartEdit = (categoryKey: string, currentName: string) => {
    setEditingCategory(categoryKey);
    setEditValue(currentName);
  };

  const handleSaveEdit = (categoryKey: string) => {
    if (editValue.trim()) {
      onRenameCategory(categoryKey, editValue.trim());
    }
    setEditingCategory(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleDeleteClick = (categoryKey: string) => {
    setDeleteConfirm(categoryKey);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDeleteCategory(deleteConfirm);
      setDeleteConfirm(null);
    }
  };
  return (
    <div className={`${leftSidebarCollapsed ? 'w-0 hidden lg:flex lg:w-16' : 'w-64 sm:w-72 md:w-80 lg:w-36 lg:sm:w-40 lg:md:w-44'} ${leftSidebarCollapsed ? '' : 'lg:relative absolute lg:static inset-y-0 left-0 z-40'} bg-white/95 backdrop-blur-sm border-r border-amber-200 flex flex-col transition-all duration-300 shadow-lg lg:shadow-sm order-2 lg:order-1 flex-shrink-0 self-stretch overflow-hidden`}>
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
            const isEditing = editingCategory === key;
            
            return (
              <div
                key={key}
                className={`group relative w-full flex items-center ${leftSidebarCollapsed ? 'justify-center flex-col space-y-0.5' : 'gap-1.5 sm:gap-2'} p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setSelectedCategory(key)}
                      className="w-full flex items-center gap-1.5 sm:gap-2"
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
                    {!leftSidebarCollapsed && (
                      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 text-slate-500 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(key, category.name);
                          }}
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 text-slate-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(key);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full flex items-center gap-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(key);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="h-6 text-[10px] sm:text-xs px-1.5 py-0.5 flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 text-green-600 hover:text-green-700"
                      onClick={() => handleSaveEdit(key)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-xs sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Delete Category?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete "{deleteConfirm && featureCategories[deleteConfirm]?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="text-xs sm:text-sm h-8 sm:h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm h-8 sm:h-9"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeftPanel;