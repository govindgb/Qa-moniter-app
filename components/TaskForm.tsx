'use client';

import React, { useState, useEffect } from 'react';
import { useTask } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/types/task';
import MultiSelectTags from './MultiSelectTags';

interface TaskFormProps {
  editTask?: Task | null;
  onSuccess?: () => void;
}

export default function TaskForm({ editTask, onSuccess }: TaskFormProps) {
  const { createTask, updateTask, loading } = useTask();
  
  const [formData, setFormData] = useState({
    unitTestLabel: '',
    tags: [] as string[],
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pre-populate form if editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        unitTestLabel: editTask.unitTestLabel || '',
        tags: editTask.tags || [],
        description: editTask.description || '',
        notes: editTask.notes || '',
      });
    }
  }, [editTask]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags,
    }));

    // Clear tags error
    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.unitTestLabel.trim()) {
      newErrors.unitTestLabel = 'Unit Test Label is required';
    }

    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        ...formData,
        testCases: ['Default test case'], // Add default test case
        attachedImages: [],
      };

      if (editTask && editTask._id) {
        await updateTask(editTask._id, taskData);
      } else {
        await createTask(taskData);
      }

      // Reset form after successful submission
      if (!editTask) {
        setFormData({
          unitTestLabel: '',
          tags: [],
          description: '',
          notes: '',
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="unitTestLabel">Unit Test Label</Label>
            <Input
              id="unitTestLabel"
              name="unitTestLabel"
              value={formData.unitTestLabel}
              onChange={handleInputChange}
              placeholder="Enter unique unit test label"
              className={errors.unitTestLabel ? 'border-red-500' : ''}
            />
            {errors.unitTestLabel && (
              <p className="text-sm text-red-500">{errors.unitTestLabel}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Unit Test Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <MultiSelectTags
              selectedTags={formData.tags}
              onTagsChange={handleTagsChange}
              placeholder="Select or add tags..."
              error={errors.tags}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Saving...' : editTask ? 'Update Task' : 'Save Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}