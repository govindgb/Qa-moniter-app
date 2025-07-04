'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTask } from '@/context/TaskContext';
import TaskForm from '@/components/TaskForm'; // your component
import { Task } from '@/types/task';
export default function EditTaskPage() {
  const { id } = useParams();
  const { tasks, getTasks } = useTask();
  const [task, setTask] = useState<Task | null>(null);
  useEffect(() => {
    if (!tasks.length) {
      getTasks(); // fetch if not available
    }
  }, []);

  useEffect(() => {
    if (id && tasks.length) {
      const found = tasks.find((t) => t._id === id);
      if (found) setTask(found);
    }
  }, [id, tasks]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Edit Unit Test Case</h1>
      {task ? <TaskForm editTask={task} /> : <p>Loading task...</p>}
    </div>
  );
}
