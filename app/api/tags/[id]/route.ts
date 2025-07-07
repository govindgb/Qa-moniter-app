import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/models/Tag';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';
 
// PUT - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }
 
    const { id } = params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tag ID',
        },
        { status: 400 }
      );
    }
 
    const body = await request.json();
    const { label, tagType, description } = body;
 
    // Validation
    if (!label || !label.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag label is required',
        },
        { status: 400 }
      );
    }
 
    if (!Array.isArray(tagType) || tagType.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one tag type is required' },
        { status: 400 }
      );
    }
    
    const validTagTypes = ['Feature', 'Application', 'BuildVersion', 'Environment', 'Device', 'Sprints'];
    const hasInvalidType = tagType.some((type: string) => !validTagTypes.includes(type));
    if (hasInvalidType) {
      return NextResponse.json(
        { success: false, error: 'One or more tag types are invalid' },
        { status: 400 }
      );
    }
 
    const labelTrimmed = label.trim();
 
    // Check if tag with same label already exists (excluding current tag)
    const existingTag = await Tag.findOne({
      label: { $regex: new RegExp(`^${labelTrimmed}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag with this label already exists',
        },
        { status: 400 }
      );
    }
 
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      {
        label: labelTrimmed,
        tagType,
        description: description?.trim() || '',
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
 
    if (!updatedTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 }
      );
    }
 
    return NextResponse.json({
      success: true,
      data: updatedTag,
      message: 'Tag updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating tag:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag with this label already exists',
        },
        { status: 400 }
      );
    }
 
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tag',
      },
      { status: 500 }
    );
  }
}
 
// DELETE - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }
 
    const { id } = params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tag ID',
        },
        { status: 400 }
      );
    }
 
    const deletedTag = await Tag.findByIdAndDelete(id);
 
    if (!deletedTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 }
      );
    }
 
    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete tag',
      },
      { status: 500 }
    );
  }
}