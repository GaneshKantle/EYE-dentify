import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { AssetUpload as AssetUploadType } from '../../types/asset';

const AssetUpload: React.FC<{
  onUpload: (asset: AssetUploadType) => Promise<void>;
  onClose: () => void;
}> = ({ onUpload, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'face-shapes',
    description: '',
    tags: [] as string[],
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [newTag, setNewTag] = useState('');

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upload New Asset</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
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
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full"
              rows={3}
            />
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
      </div>
    </div>
  );
};

export default AssetUpload;
