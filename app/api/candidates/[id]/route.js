import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Candidate from '../../../../models/Candidate';

export async function GET(request, { params }) {
  await dbConnect();

  try {
    const { id } = params;
    const candidate = await Candidate.findById(id);
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const { id } = params;
    const body = await request.json();
    
    const candidate = await Candidate.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email or phone number already exists' 
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const { id } = params;
    const deletedCandidate = await Candidate.deleteOne({ _id: id });
    
    if (!deletedCandidate.deletedCount) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}