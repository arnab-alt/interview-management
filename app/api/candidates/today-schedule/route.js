// app/api/candidates/today-schedule/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Candidate from '../../../../models/Candidate';

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get candidates with interviews scheduled for today
    const todayInterviews = await Candidate.aggregate([
      {
        $match: {
          interview_history: {
            $elemMatch: {
              interview_date: {
                $gte: startDate,
                $lt: endDate
              },
              status: 'Scheduled'
            }
          }
        }
      },
      {
        $unwind: '$interview_history'
      },
      {
        $match: {
          'interview_history.interview_date': {
            $gte: startDate,
            $lt: endDate
          },
          'interview_history.status': 'Scheduled'
        }
      },
      {
        $project: {
          candidateName: '$candidate_name',
          companyName: '$interviewed_company_name',
          interviewerName: '$interview_history.interviewer_name',
          interviewType: '$interview_history.interview_type',
          interviewDate: '$interview_history.interview_date',
          time: {
            $dateToString: {
              format: '%H:%M',
              date: '$interview_history.interview_date'
            }
          }
        }
      },
      {
        $sort: { interviewDate: 1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      interviews: todayInterviews,
      total: todayInterviews.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}