'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✨ The chariot of navigation
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
import { Edit, Trash2, Plus } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskTableProps {
  onEditTask: (task: Task) => void;
}

export default function TaskTable({ onEditTask }: TaskTableProps) {
  const { tasks, loading, error, getTasks, deleteTask } = useTask();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter(); // 🚀 The router cometh

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
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <CardTitle>Created UTC Cases</CardTitle>
        <Button
          onClick={() => router.push('/create-task')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Unit Test Case
        </Button>
      </CardHeader>
      <CardContent>
        {loading && tasks.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">No UTC cases found. Create your first case above!</p>
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
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {task.notes && (
                          <p className="text-sm text-gray-500 mt-1">{task.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs"
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
                        onClick={() => router.push(`/edit-task/${task._id}`)} // 🔁 instead of onEditTask
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
                              <Trash2 className="h-4 w-4" />
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
                                {deleteLoading === task._id ? 'Deleting...' : 'Delete'}
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
