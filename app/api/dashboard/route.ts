// /app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/QaMonitorTasks';
import QaMonitorExecutions from '@/models/QaMonitorExecutions';

export async function GET() {
  try {
    
    await connectToDatabase();

    // Get all tasks
    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

    // Get the latest test execution for each task
    const latestExecutions = await QaMonitorExecutions.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$taskId',
          latestExecution: { $first: '$$ROOT' },
        },
      },
    ]);

    // Map taskId => latest execution
    const executionMap = new Map();
    latestExecutions.forEach(({ latestExecution }) => {
      executionMap.set(latestExecution.taskId.toString(), latestExecution);
    });

    // Merge task with execution
    const dashboardData = tasks.map(task => ({
      ...task,
      latestExecution: executionMap.get(task._id?.toString()) || null,
    }));

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard data',
      },
      { status: 500 }
    );
  }
}
