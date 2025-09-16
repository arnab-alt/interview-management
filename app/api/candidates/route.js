// app/api/candidates/route.js - Enhanced with new filters
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Candidate from '../../../models/Candidate';
import mongoose from 'mongoose';

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const upcomingDate = searchParams.get('upcoming_date');

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { candidate_name: { $regex: search, $options: 'i' } },
          { candidate_email: { $regex: search, $options: 'i' } },
          { sales_person_name: { $regex: search, $options: 'i' } },
          { recruiter_name: { $regex: search, $options: 'i' } },
          ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
        ],
      };
    }

    // Build filter query
    let filterQuery = {};
    switch (filter) {
      case 'not_conducted':
        filterQuery.interview_count = 0;
        break;
      case 'one_interview':
        filterQuery.interview_count = 1;
        break;
      case 'two_interviews':
        filterQuery.interview_count = 2;
        break;
      case 'three_plus':
        filterQuery.interview_count = { $gte: 3 };
        break;
      case 'upcoming':
        filterQuery.upcoming_interview_date = { $gte: new Date() };
        break;
      default:
        break;
    }

    // Filter by specific upcoming date
    if (upcomingDate) {
      const startDate = new Date(upcomingDate);
      const endDate = new Date(upcomingDate);
      endDate.setDate(endDate.getDate() + 1);
      
      filterQuery.upcoming_interview_date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const query = { ...searchQuery, ...filterQuery };

    const candidates = await Candidate.find(query)
      .sort({ when_enrolled: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Candidate.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    return NextResponse.json({
      success: true,
      data: candidates,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
      total,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // Process interview history to set proper dates
    if (body.interview_history && Array.isArray(body.interview_history)) {
      body.interview_history = body.interview_history.map(interview => ({
        ...interview,
        interview_date: interview.interview_date ? new Date(interview.interview_date) : new Date(),
      }));
    }

    // Process next interview
    if (body.next_interview && body.next_interview.interview_date) {
      body.next_interview.interview_date = new Date(body.next_interview.interview_date);
    }

    const candidate = await Candidate.create(body);
    
    return NextResponse.json(
      { success: true, data: candidate },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Candidate already exists with this email or phone number' 
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