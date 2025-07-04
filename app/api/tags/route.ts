import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/models/Tag';
import { getUserFromRequest } from '@/lib/auth';

// GET - Fetch all active tags
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    if (includeDetails) {
      // Return full tag details for management
      const tags = await Tag.find({ isActive: true })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      
      return NextResponse.json({
        success: true,
        data: tags,
      });
    } else {
      // Return only tag labels for dropdown (backward compatibility)
      const tags = await Tag.find({ isActive: true })
        .sort({ label: 1 })
        .select('label');
      
      return NextResponse.json({
        success: true,
        data: tags.map(tag => tag.label),
      });
    }
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
      },
      { status: 500 }
    );
  }
}

// POST - Add new tag
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    const { label, tagType, workingOn } = body;

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

    if (!tagType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag type is required',
        },
        { status: 400 }
      );
    }

    const validTagTypes = ['Feature', 'Application', 'BuildVersion', 'Environment', 'Device', 'Sprints'];
    if (!validTagTypes.includes(tagType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tag type',
        },
        { status: 400 }
      );
    }

    const labelTrimmed = label.trim();

    // Check if tag with same label already exists
    const existingTag = await Tag.findOne({ 
      label: { $regex: new RegExp(`^${labelTrimmed}$`, 'i') } 
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

    // Create new tag
    const newTag = new Tag({
      label: labelTrimmed,
      tagType,
      workingOn: workingOn?.trim() || '',
      createdBy: userPayload.userId,
    });

    const savedTag = await newTag.save();
    await savedTag.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Tag created successfully',
      data: savedTag,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tag',
      },
      { status: 500 }
    );
  }
}