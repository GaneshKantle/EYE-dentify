import React, { useState, useEffect } from 'react';
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

interface EditFaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  face: Face | null;
  onSave: (data: { name: string; age?: string; crime?: string; description?: string }) => Promise<void>;
}

const EditFaceModal: React.FC<EditFaceModalProps> = ({
  open,
  onOpenChange,
  face,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    crime: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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
      <DialogContent className="bg-white border border-slate-200 shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Suspect Information</DialogTitle>
          <DialogDescription>
            Update the suspect details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter suspect name"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter age"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="crime">Crime</Label>
            <Input
              id="crime"
              value={formData.crime}
              onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
              placeholder="Enter crime type"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              rows={3}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFaceModal;

