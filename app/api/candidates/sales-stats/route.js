import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Candidate from '../../../../models/Candidate';

export async function GET() {
  await dbConnect();

  try {
    const salesStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$sales_person_name',
          candidateCount: { $sum: 1 },
          interviewsCompleted: { $sum: '$interview_count' },
          avgInterviewCount: { $avg: '$interview_count' },
          upcomingInterviews: {
            $sum: {
              $cond: [
                { $gte: ['$upcoming_interview_date', new Date()] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$interviewsCompleted', '$candidateCount'] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      {
        $sort: { candidateCount: -1 }
      },
      {
        $project: {
          name: '$_id',
          candidateCount: 1,
          interviewsCompleted: 1,
          avgInterviewCount: { $round: ['$avgInterviewCount', 1] },
          upcomingInterviews: 1,
          successRate: 1,
          _id: 0
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      salesPersons: salesStats,
      total: salesStats.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}