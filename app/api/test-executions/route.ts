import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TestExecution from "@/models/TestExecution";
import Task from "@/models/Task";

// GET - Fetch all test executions with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const taskId = searchParams.get("taskId");
    const testId = searchParams.get("testId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter object
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (taskId) {
      filter.taskId = taskId;
    }

    if (testId) {
      filter.testId = { $regex: testId, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { testId: { $regex: search, $options: "i" } },
        { testerName: { $regex: search, $options: "i" } },
        { feedback: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const testExecutions = await TestExecution.find(filter)
      .populate("taskId", "unitTestLabel description tags")
      .sort(sort);

    return NextResponse.json({
      success: true,
      data: testExecutions,
    });
  } catch (error) {
    console.error("Error fetching test executions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch test executions",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new test execution
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { taskId, testId, status, feedback, attachedImages, testerName } =
      body;

    console.log("Received test execution data:", body);

    // Validation
    if (!taskId || !testId || !feedback || !testerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Task ID, Test ID, feedback, and tester name are required",
        },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    let normalizedStatus = "fail";
    if (typeof status === "string") {
      if (
        status.toLowerCase() === "pass" ||
        status.toLowerCase() === "passed" ||
        status.toLowerCase() === "completed"
      ) {
        normalizedStatus = "pass";
      } else if (
        status.toLowerCase() === "fail" ||
        status.toLowerCase() === "failed"
      ) {
        normalizedStatus = "fail";
      }
    }

    // Check if test execution with same testId already exists
    const existingExecution = await TestExecution.findOne({
      testId: testId.trim(),
    });

    if (existingExecution) {
      // Update existing execution instead of creating new one
      const updatedExecution = await TestExecution.findByIdAndUpdate(
        existingExecution._id,
        {
          taskId,
          status: normalizedStatus,
          feedback: feedback.trim(),
          attachedImages: attachedImages || [],
          testerName: testerName.trim(),
        },
        { new: true, runValidators: true }
      ).populate("taskId", "unitTestLabel description tags");

      return NextResponse.json({
        success: true,
        data: updatedExecution,
        message: "Test execution updated successfully",
      });
    }

    // Create new test execution
    const testExecution = new TestExecution({
      taskId,
      testId: testId.trim(),
      status: normalizedStatus,
      feedback: feedback.trim(),
      attachedImages: attachedImages || [],
      testerName: testerName.trim(),
    });

    const savedTestExecution = await testExecution.save();
    await savedTestExecution.populate(
      "taskId",
      "unitTestLabel description tags"
    );

    return NextResponse.json({
      success: true,
      data: savedTestExecution,
      message: "Test execution created successfully",
    });
  } catch (error) {
    console.error("Error creating test execution:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test execution",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
