"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Tags as TagsIcon, RefreshCw } from "lucide-react";
import axios from "axios";
import { LoadingButton, Loader } from "@/components/ui/loader";

interface Tag {
  _id: string;
  label: string;
  tagType: string;
  description?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const TAG_TYPES = [
  "Feature",
  "Application",
  "BuildVersion",
  "Environment",
  "Device",
  "Sprints",
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    tagType: [] as string[],
    description: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTags();
  }, []);

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

  const resetForm = () => {
    setFormData({
      label: "",
      tagType: [] as string[],
      description: "",
    });
    setFormErrors({});
    setEditingTag(null);
  };

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        label: tag.label,
        tagType: Array.isArray(tag.tagType) ? tag.tagType : [tag.tagType],
        description: tag.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.label.trim()) {
      errors.label = "Label is required";
    }

    if (!formData.tagType.length) {
      errors.tagType = "At least one tag type is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);

      const payload = {
        label: formData.label.trim(),
        tagType: formData.tagType,
        description: formData.description.trim(),
      };

      if (editingTag) {
        await axios.put(`/api/tags/${editingTag._id}`, payload);
      } else {
        await axios.post("/api/tags", payload);
      }

      await fetchTags();
      handleCloseDialog();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save tag");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      await axios.delete(`/api/tags/${id}`);
      await fetchTags();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete tag");
    } finally {
      setDeleteLoading(null);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <TagsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tags Management
            </h1>
            <p className="text-gray-600">
              Manage your project tags and categories
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={fetchTags}
            variant="outline"
            disabled={loading}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <LoadingButton loading={loading} loadingText="Refreshing...">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </LoadingButton>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? "Edit Tag" : "Add New Tag"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    placeholder="Enter tag label"
                    className={formErrors.label ? "border-red-500" : ""}
                  />
                  {formErrors.label && (
                    <p className="text-sm text-red-500">{formErrors.label}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagType">Tag Type(s)</Label>
                  <Select
                    isMulti
                    options={TAG_TYPES.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    value={formData.tagType.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        tagType: selectedOptions.map((opt) => opt.value),
                      }))
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {formErrors.tagType && (
                    <p className="text-sm text-red-500">{formErrors.tagType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what you're working on"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={submitLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <LoadingButton
                      loading={submitLoading}
                      loadingText={editingTag ? "Updating..." : "Creating..."}
                    >
                      {editingTag ? "Update Tag" : "Create Tag"}
                    </LoadingButton>
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tags Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center space-x-2">
            <TagsIcon className="h-5 w-5 text-blue-600" />
            <span>All Tags ({tags.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader size="lg" text="Loading Tags" className="mb-4" />
              <p className="text-gray-500">
                Please wait while we fetch your tags...
              </p>
            </div>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-12 max-w-lg text-center">
                <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-6">
                  <TagsIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-blue-800 font-bold text-xl mb-3">
                  No Tags Found
                </h3>
                <p className="text-blue-600 mb-6 leading-relaxed">
                  Start organizing your project by creating your first tag. Tags
                  help categorize and manage your test cases effectively.
                </p>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Tag
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                    <TableHead className="font-bold text-gray-800">
                      Label
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Tag Type
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Features
                    </TableHead>
                    <TableHead className="font-bold text-gray-800">
                      Updated At
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-800">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow
                      key={tag._id}
                      className="hover:bg-blue-50/50 transition-colors border-b border-gray-100"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {tag.label}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(tag.tagType) ? (
                            tag.tagType.map((type, index) => (
                              <Badge
                                key={index}
                                className={`text-xs font-medium ${getTagTypeColor(
                                  type
                                )}`}
                              >
                                {type}
                              </Badge>
                            ))
                          ) : (
                            <Badge
                              className={`text-xs font-medium ${getTagTypeColor(
                                tag.tagType
                              )}`}
                            >
                              {tag.tagType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {tag.description || "-"}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDate(tag.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(tag)}
                            className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-red-200 text-red-700 hover:bg-red-50"
                                disabled={deleteLoading === tag._id}
                              >
                                {deleteLoading === tag._id ? (
                                  <Loader size="sm" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the tag `
                                  {tag.label}`? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(tag._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <LoadingButton
                                    loading={deleteLoading === tag._id}
                                    loadingText="Deleting..."
                                  >
                                    Delete
                                  </LoadingButton>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
