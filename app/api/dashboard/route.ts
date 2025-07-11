// /app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/QaMonitorTasks';
import QaMonitorExecutions from '@/models/QaMonitorExecutions';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all tasks (fetch only _id, unitTestLabel, tags)
    const tasks = await Task.find({}, '_id unitTestLabel tags').sort({ createdAt: -1 }).lean();

    // Get the latest execution per taskId
    const latestExecutions = await QaMonitorExecutions.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$taskId',
          latestExecution: {
            $first: {
              status: '$status', // only select 'status'
              taskId: '$taskId',
              testerName: '$testerName'
            }
          },
        },
      },
    ]);

    // Map: taskId => { status }
    const executionMap = new Map();
    latestExecutions.forEach(({ latestExecution }) => {
      executionMap.set(latestExecution.taskId.toString(), {
        status: latestExecution.status,
        testerName: latestExecution.testerName || 'N/A'  // ✅ Fallback if testerName is missing
      });
    });

    // Construct the response with only required fields
    const dashboardData = tasks.map(task => ({
      _id: task._id,
      unitTestLabel: task.unitTestLabel,
      tags: task.tags,
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
