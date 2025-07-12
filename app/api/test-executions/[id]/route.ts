import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import TestExecution from "@/models/QaMonitorExecutions";
import mongoose from "mongoose";

// GET - Fetch test execution by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid test execution ID",
        },
        { status: 400 }
      );
    }

    const testExecution = await TestExecution.findById(id).populate(
      "taskId",
      "description tags"
    );

    if (!testExecution) {
      return NextResponse.json(
        {
          success: false,
          error: "Test execution not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testExecution,
    });
  } catch (error) {
    console.error("Error fetching test execution:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch test execution",
      },
      { status: 500 }
    );
  }
}

// PUT - Update test execution by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    const body = await request.json();
    const {
      taskId,
      execId,
      testCases,
      status,
      feedback,
      attachedImages,
      testerName,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid test execution ID",
        },
        { status: 400 }
      );
    }

    // Validation
    if (!taskId || !execId || !feedback || !testerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Task ID, Test ID, feedback, and tester name are required",
        },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !["pass", "fail"].includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status must be either "pass" or "fail"',
        },
        { status: 400 }
      );
    }

    const updatedTestExecution = await TestExecution.findByIdAndUpdate(
      id,
      {
        taskId,
        execId: execId.trim(),
        testCases: testCases || [],
        status: status ? status.toLowerCase() : "fail",
        feedback: feedback.trim(),
        attachedImages: attachedImages || [],
        testerName: testerName.trim(),
      },
      { new: true, runValidators: true }
    ).populate("taskId", "unitTestLabel description tags");

    if (!updatedTestExecution) {
      return NextResponse.json(
        {
          success: false,
          error: "Test execution not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTestExecution,
      message: "Test execution updated successfully",
    });
  } catch (error) {
    console.error("Error updating test execution:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update test execution",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete test execution by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid test execution ID",
        },
        { status: 400 }
      );
    }

    const deletedTestExecution = await TestExecution.findByIdAndDelete(id);

    if (!deletedTestExecution) {
      return NextResponse.json(
        {
          success: false,
          error: "Test execution not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test execution deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test execution:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete test execution",
      },
      { status: 500 }
    );
  }
}
