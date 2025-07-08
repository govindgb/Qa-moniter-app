"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface Tag {
  _id: string;
  label: string;
  tagType: string | string[];
  description?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TagFormData {
  label: string;
  tagType: string[];
  description: string;
}

interface TagsContextType {
  // State
  tags: Tag[];
  loading: boolean;
  error: string | null;
  submitLoading: boolean;
  deleteLoading: string | null;
  
  // Actions
  fetchTags: () => Promise<void>;
  createTag: (data: TagFormData) => Promise<void>;
  updateTag: (id: string, data: TagFormData) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  clearError: () => void;
  
  // Utils
  getTagTypeColor: (tagType: string) => string;
  formatDate: (dateString: string) => string;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const TAG_TYPES = [
  "Feature",
  "Application",
  "BuildVersion",
  "Environment",
  "Device",
  "Sprints",
];

interface TagsProviderProps {
  children: ReactNode;
}

export function TagsProvider({ children }: TagsProviderProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/tags?includeDetails=true");
      if (response.data.success) {
        setTags(response.data.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (data: TagFormData) => {
    try {
      setSubmitLoading(true);
      setError(null);

      const payload = {
        label: data.label.trim(),
        tagType: data.tagType,
        description: data.description.trim(),
      };

      await axios.post("/api/tags", payload);
      await fetchTags();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create tag");
      throw error;
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateTag = async (id: string, data: TagFormData) => {
    try {
      setSubmitLoading(true);
      setError(null);

      const payload = {
        label: data.label.trim(),
        tagType: data.tagType,
        description: data.description.trim(),
      };

      await axios.put(`/api/tags/${id}`, payload);
      await fetchTags();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update tag");
      throw error;
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      setDeleteLoading(id);
      setError(null);
      await axios.delete(`/api/tags/${id}`);
      await fetchTags();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete tag");
      throw error;
    } finally {
      setDeleteLoading(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getTagTypeColor = (tagType: string) => {
    const colors = {
      Feature: "bg-blue-100 text-blue-800",
      Application: "bg-green-100 text-green-800",
      BuildVersion: "bg-purple-100 text-purple-800",
      Environment: "bg-yellow-100 text-yellow-800",
      Device: "bg-red-100 text-red-800",
      Sprints: "bg-indigo-100 text-indigo-800",
    };
    return (
      colors[tagType as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const contextValue: TagsContextType = {
    // State
    tags,
    loading,
    error,
    submitLoading,
    deleteLoading,
    
    // Actions
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    clearError,
    
    // Utils
    getTagTypeColor,
    formatDate,
  };

  return (
    <TagsContext.Provider value={contextValue}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}

export type { Tag, TagFormData };