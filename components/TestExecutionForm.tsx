"use client";

import React, { useState, useEffect } from "react";
import { useTestExecution } from "@/context/TestExecutionContext";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestExecution } from "@/types/testExecution";
import { Task } from "@/types/task";
import ImageUpload from "./ImageUpload";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hash,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
interface TestExecutionFormProps {
  editTestExecution?: TestExecution | null;
  onSuccess?: () => void;
}

export default function TestExecutionForm({
  editTestExecution,
  onSuccess,
}: TestExecutionFormProps) {
  const { createTestExecution, updateTestExecution, loading, uploadImages } =
    useTestExecution();
  const { tasks, getTasks } = useTask();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    taskId: "",
    status: "" as "" | "pass" | "fail",
    feedback: "",
    attachedImages: [] as string[],
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  useEffect(() => {
    getTasks();
  }, []);

  useEffect(() => {
    if (editTestExecution) {
      setFormData({
        taskId: editTestExecution.taskId?._id || "",
        status: editTestExecution.status,
        feedback: editTestExecution.feedback,
        attachedImages: editTestExecution.attachedImages || [],
      });
      const task = tasks.find((t:any) => t._id === editTestExecution.taskId);
      if (task) setSelectedTask(task);
    }
  }, [editTestExecution, tasks]);

  const generateexecId = () => {
    const prefix = "TEST";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task) setSelectedTask(task);
    setFormData((prev) => ({ ...prev, taskId }));
    if (errors.taskId) setErrors((prev) => ({ ...prev, taskId: "" }));
  };

  const handleStatusChange = (status: "pass" | "fail") => {
    setFormData((prev) => ({ ...prev, status }));
    if (errors.status) setErrors((prev) => ({ ...prev, status: "" }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({ ...prev, attachedImages: images }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.taskId) newErrors.taskId = "Task selection is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.feedback.trim()) newErrors.feedback = "Feedback is required";
    if (!user?.name) newErrors.user = "User not authenticated";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      execId: generateexecId(),
      testerName: user?.name || "",
      feedback: formData.feedback.trim(),
      testCases: [
        {
          testCase: "Default test case",
          passed: formData.status === "pass",
          notes: formData.feedback,
        },
      ],
    };

    try {
      if (editTestExecution?._id) {
        await updateTestExecution(editTestExecution._id, {
          ...payload,
          status: formData.status === "pass" ? "pass" : "fail",
        });
      } else {
        await createTestExecution({
          ...payload,
          status: formData.status === "pass" ? "pass" : "fail",
        });
      }
      if (!editTestExecution) {
        setFormData({ taskId: "", status: "", feedback: "", attachedImages: [] });
        setSelectedTask(null);
      }
      onSuccess?.();
      router.push("/test-executions");
    } catch (err) {
      console.error("Error saving test execution:", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>{editTestExecution ? "Edit Test Execution" : "Create Test Execution"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Task Selector */}
            <div className="space-y-2">
              <Label htmlFor="taskId" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Select Unit Test Label</span>
              </Label>
              <Select value={formData.taskId} onValueChange={handleTaskSelect} disabled={!!editTestExecution}>
                <SelectTrigger className={`h-12 ${errors.taskId ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-blue-500`}>
                  <SelectValue placeholder="Select a unit test label" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t:any) => (
                    <SelectItem key={t._id} value={t._id}>
                      <span className="font-medium text-gray-900">{t.unitTestLabel}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taskId && <p className="text-sm text-red-500">{errors.taskId}</p>}
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                {getStatusIcon(formData.status)}
                <span>Status</span>
              </Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger className={`h-12 ${errors.status ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-blue-500`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check" disabled>
                    <span className="text-gray-500">Select status</span>
                  </SelectItem>
                  <SelectItem value="pass">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Pass</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fail">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Fail</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Feedback</span>
            </Label>
            <Textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              placeholder="Enter detailed feedback about the testing..."
              rows={5}
              className={`${errors.feedback ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.feedback && <p className="text-sm text-red-500">{errors.feedback}</p>}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Attach Images</Label>
            <ImageUpload images={formData.attachedImages} onImagesChange={handleImagesChange} onUpload={uploadImages} />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-500">
              {/* {editTestExecution ? "Update existing test execution" : "Create new test execution"} */}
            </div>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200">
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editTestExecution ? "Update Test Execution" : "Save Test Execution"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
