'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTask } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, FileText } from 'lucide-react';
import { Task } from '@/types/task';
import { LoadingButton, Loader } from '@/components/ui/loader';

interface TaskTableProps {
  onEditTask: (task: Task) => void;
}

export default function TaskTable({ onEditTask }: TaskTableProps) {
  const { tasks, loading, error, getTasks, deleteTask } = useTask();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getTasks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      setDeleteLoading(id);
      await deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Created UTC Cases
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/create-task')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Unit Test Case
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
              <FileText className="h-4 w-4" />
              <span>{tasks.length} cases</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading && tasks.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader text="Loading tasks..." />
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-12 max-w-lg text-center">
              <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-6">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-blue-800 font-bold text-xl mb-3">
                No UTC Cases Found
              </h3>
              <p className="text-blue-600 mb-6 leading-relaxed">
                Create your first unit test case using the Add Unit Test Case button above!
              </p>
              <Button
                onClick={() => router.push('/create-task')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Case
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Case ID</TableHead>
                  <TableHead>Unit Test Label</TableHead>
                  <TableHead>Associated Tags</TableHead>
                  <TableHead className="w-24">Test Cases</TableHead>
                  <TableHead className="w-24">Created</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={task._id}>
                    <TableCell className="font-medium">
                      {(index + 1).toString().padStart(3, '0')}
                    </TableCell>
                    <TableCell className="font-medium text-blue-700">
                      {task.unitTestLabel}
                      {task.notes && (
                        <p className="text-xs text-gray-500 mt-1">{task.notes}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {task.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs whitespace-nowrap"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {task.testCases.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {task.createdAt && formatDate(task.createdAt.toString())}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/edit-task/${task._id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deleteLoading === task._id}
                            >
                              {deleteLoading === task._id ? (
                                <Loader size="sm" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete UTC Case</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you absolutely certain? Once gone, this case shall vanish into the coding void.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => task._id && handleDelete(task._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <LoadingButton 
                                  loading={deleteLoading === task._id} 
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
  );
}