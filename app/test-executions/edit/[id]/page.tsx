'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import TestExecutionForm from '@/components/TestExecutionForm';
import { useTestExecution } from '@/context/TestExecutionContext';
import { TestExecution } from '@/types/testExecution';

export default function EditTestExecutionPage() {
  const { id } = useParams();
  const { testExecutions } = useTestExecution();
  const [editingExecution, setEditingExecution] = useState<TestExecution | null>(null);

  useEffect(() => {
    if (id && testExecutions.length > 0) {
      const execution = testExecutions.find((te) => te._id === id);
      if (execution) {
        setEditingExecution(execution);
      }
    }
  }, [id, testExecutions]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {editingExecution ? (
        <TestExecutionForm editTestExecution={editingExecution} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
