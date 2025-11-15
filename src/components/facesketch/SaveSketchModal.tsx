import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from 'lucide-react';

interface SaveSketchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    suspect: string;
    eyewitness: string;
    officer: string;
    date: string;
    reason: string;
    description: string;
    priority: string;
    status: string;
  }) => Promise<void>;
  initialData?: {
    name?: string;
    suspect?: string;
    eyewitness?: string;
    officer?: string;
    date?: string;
    reason?: string;
    description?: string;
    priority?: string;
    status?: string;
  };
  isLoading?: boolean;
}

const SaveSketchModal: React.FC<SaveSketchModalProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    suspect: initialData?.suspect || '',
    eyewitness: initialData?.eyewitness || '',
    officer: initialData?.officer || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    reason: initialData?.reason || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'normal',
    status: initialData?.status || 'draft',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        suspect: initialData.suspect || '',
        eyewitness: initialData.eyewitness || '',
        officer: initialData.officer || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        reason: initialData.reason || '',
        description: initialData.description || '',
        priority: initialData.priority || 'normal',
        status: initialData.status || 'draft',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Sketch name is required');
      return;
    }
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle>Save Sketch</DialogTitle>
          <DialogDescription>
            Save your sketch with case details. All fields will be stored in MongoDB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sketch Name - Required */}
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Sketch Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter sketch name"
                required
                className="mt-1"
              />
            </div>

            {/* Suspect Name */}
            <div>
              <Label htmlFor="suspect">Suspect Name</Label>
              <Input
                id="suspect"
                value={formData.suspect}
                onChange={(e) => setFormData({ ...formData, suspect: e.target.value })}
                placeholder="Enter suspect name"
                className="mt-1"
              />
            </div>

            {/* Eyewitness */}
            <div>
              <Label htmlFor="eyewitness">Eyewitness</Label>
              <Input
                id="eyewitness"
                value={formData.eyewitness}
                onChange={(e) => setFormData({ ...formData, eyewitness: e.target.value })}
                placeholder="Enter eyewitness name"
                className="mt-1"
              />
            </div>

            {/* Officer */}
            <div>
              <Label htmlFor="officer">Officer</Label>
              <Input
                id="officer"
                value={formData.officer}
                onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
                placeholder="Enter officer name"
                className="mt-1"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter reason for sketch"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter additional description or notes"
                rows={4}
                className="mt-1"
              />
            </div>
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
              {isLoading ? 'Saving...' : 'Save Sketch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSketchModal;

