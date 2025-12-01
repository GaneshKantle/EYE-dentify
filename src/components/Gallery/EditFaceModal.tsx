import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Face } from '../../types';
import { ImageIcon } from 'lucide-react';

interface EditFaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  face: Face | null;
  onSave: (data: { name: string; age?: string; crime?: string; description?: string }) => Promise<void>;
  onImageChange?: (file: File) => Promise<void>;
}

const EditFaceModal: React.FC<EditFaceModalProps> = ({
  open,
  onOpenChange,
  face,
  onSave,
  onImageChange,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    crime: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (face) {
      setFormData({
        name: face.name || '',
        age: face.age || '',
        crime: face.crime || '',
        description: face.description || '',
      });
    }
  }, [face]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;
    setImageLoading(true);
    try {
      await onImageChange(file);
    } catch (error) {
      console.error('Failed to change image:', error);
    } finally {
      setImageLoading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-slate-200 shadow-xl max-w-xs xs:max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8">
        <DialogHeader className="mb-4 xs:mb-5 sm:mb-6">
          <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-slate-900">Edit Suspect Information</DialogTitle>
          <DialogDescription className="text-xs xs:text-sm sm:text-base text-slate-600 mt-1 xs:mt-2">
            Update the suspect details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5 sm:space-y-6">
          {/* Image Preview & Change */}
          {face?.image_urls?.[0] && (
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4 sm:gap-5 p-3 xs:p-4 bg-slate-50 rounded-lg xs:rounded-xl border border-slate-200">
              <img 
                src={face.image_urls[0]} 
                alt={face.name} 
                className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg xs:rounded-xl border-2 border-slate-300 shadow-sm"
              />
              <div className="flex-1 w-full xs:w-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                  className="w-full xs:w-auto text-xs xs:text-sm sm:text-base px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3"
                >
                  <ImageIcon className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
                  {imageLoading ? 'Uploading...' : 'Change Image'}
                </Button>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="name" className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter suspect name"
              required
              className="mt-1.5 xs:mt-2 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-5"
            />
          </div>
          <div>
            <Label htmlFor="age" className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700">Age</Label>
            <Input
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter age"
              className="mt-1.5 xs:mt-2 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-5"
            />
          </div>
          <div>
            <Label htmlFor="crime" className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700">Crime</Label>
            <Input
              id="crime"
              value={formData.crime}
              onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
              placeholder="Enter crime type"
              className="mt-1.5 xs:mt-2 h-9 xs:h-10 sm:h-11 md:h-12 text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-5"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              rows={4}
              className="mt-1.5 xs:mt-2 text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-5 py-2 xs:py-3 sm:py-4"
            />
          </div>
          <DialogFooter className="flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 pt-4 xs:pt-5 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full xs:w-auto text-xs xs:text-sm sm:text-base px-4 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
              className="w-full xs:w-auto text-xs xs:text-sm sm:text-base px-4 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFaceModal;

