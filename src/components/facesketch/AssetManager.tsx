import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Upload, Trash2, Search } from 'lucide-react';
import AssetUpload from './AssetUpload';
import { Asset } from '../../types/asset';
import { apiClient } from '../../lib/api';

const AssetManager: React.FC<{
  onAssetSelect: (asset: Asset) => void;
  selectedType?: string;
}> = ({ onAssetSelect, selectedType }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await apiClient.directGet<any[]>('/assets');
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = assets;
    
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType) {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    
    setFilteredAssets(filtered);
  };

  const handleUpload = async (uploadData: any) => {
    try {
      const formData = new FormData();
      formData.append('name', uploadData.name);
      formData.append('type', uploadData.type);
      formData.append('description', uploadData.description || '');
      formData.append('tags', JSON.stringify(uploadData.tags));
      formData.append('file', uploadData.file);

      await apiClient.directUploadFile('/assets/upload', formData);
      await loadAssets();
      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await apiClient.directDelete(`/assets/${assetId}`);
      await loadAssets();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Asset Library</h3>
        <Button onClick={() => setShowUpload(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search assets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="col-span-2 text-center py-8">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No assets found
          </div>
        ) : (
          filteredAssets.map(asset => (
            <Card key={asset.id} className="p-2 cursor-pointer hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <img
                  src={asset.cloudinary_url}
                  alt={asset.name}
                  className="w-full h-16 object-cover rounded"
                  onClick={() => onAssetSelect(asset)}
                />
                <div className="space-y-1">
                  <p className="text-xs font-medium truncate">{asset.name}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {asset.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showUpload && (
        <AssetUpload
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default AssetManager;
