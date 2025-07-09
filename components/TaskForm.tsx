'use client';

import React, { useState, useEffect } from 'react';
import { useTask } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types/task';
import MultiSelectTags from './MultiSelectTags';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@/components/ui/loader';
import { FileText } from 'lucide-react';

interface TaskFormProps {
  editTask?: Task | null;
  onSuccess?: () => void;
}

export default function TaskForm({ editTask, onSuccess }: TaskFormProps) {
  const { createTask, updateTask, loading, error } = useTask();

  const [formData, setFormData] = useState({
    unitTestLabel: '',
    tags: [] as string[],
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.unitTestLabel.trim()) newErrors.unitTestLabel = 'Unit Test Label is required';
    if (!formData.tags || formData.tags.length === 0) newErrors.tags = 'At least one tag is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const taskData = {
        ...formData,
        testCases: ['Default test case'],
        attachedImages: [],
      };

      if (editTask && editTask._id) {
        await updateTask(editTask._id, taskData);
      } else {
        await createTask(taskData);
      }

      if (!editTask) {
        setFormData({
          unitTestLabel: '',
          tags: [],
          description: '',
          notes: '',
        });
      }

      onSuccess?.();
      router.push('/unit-case-list');
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>{editTask ? 'Edit UTC Case' : 'Create New UTC Case'}</span>
        </CardTitle>
      </CardHeader>
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
              className={(errors?.unitTestLabel || error) ? 'border-red-500' : ''}
            />
            {(errors.unitTestLabel || error) && (
              <p className="text-sm text-red-500">{errors.unitTestLabel || error}</p>
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

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <LoadingButton
                loading={loading}
                loadingText={editTask ? 'Updating...' : 'Saving...'}
              >
                {editTask ? 'Update Task' : 'Save Task'}
              </LoadingButton>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
