// app/api/candidates/detailed-stats/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Candidate from '../../../../models/Candidate';

export async function GET() {
  await dbConnect();

  try {
    // Status breakdown
    const statusBreakdown = await Candidate.aggregate([
      {
        $group: {
          _id: '$current_status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Interview type statistics from interview history
    const interviewTypeStats = await Candidate.aggregate([
      { $unwind: '$interview_history' },
      {
        $group: {
          _id: '$interview_history.interview_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recruiter performance
    const recruiterStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$recruiter_name',
          candidateCount: { $sum: 1 },
          avgInterviews: { $avg: '$interview_count' },
          totalInterviews: { $sum: '$interview_count' }
        }
      },
      { $sort: { candidateCount: -1 } },
      {
        $project: {
          name: '$_id',
          candidateCount: 1,
          avgInterviews: { $round: ['$avgInterviews', 1] },
          totalInterviews: 1,
          _id: 0
        }
      }
    ]);

    // Company statistics
    const companyStats = await Candidate.aggregate([
      {
        $group: {
          _id: '$interviewed_company_name',
          candidateCount: { $sum: 1 },
          avgInterviews: { $avg: '$interview_count' },
          totalInterviews: { $sum: '$interview_count' },
          hiredCount: {
            $sum: {
              $cond: [{ $eq: ['$current_status', 'Hired'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { candidateCount: -1 } },
      {
        $project: {
          name: '$_id',
          candidateCount: 1,
          avgInterviews: { $round: ['$avgInterviews', 1] },
          totalInterviews: 1,
          hiredCount: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ['$hiredCount', '$candidateCount'] }, 100] },
              1
            ]
          },
          _id: 0
        }
      }
    ]);

    // Rating distribution
    const ratingDistribution = await Candidate.aggregate([
      { $unwind: '$interview_history' },
      { $match: { 'interview_history.rating': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$interview_history.rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Candidate.aggregate([
      {
        $match: {
          when_enrolled: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$when_enrolled' },
            month: { $month: '$when_enrolled' }
          },
          candidatesAdded: { $sum: 1 },
          interviewsConducted: { $sum: '$interview_count' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Calculate overall statistics
    const totalStats = await Candidate.aggregate([
      {
        $group: {
          _id: null,
          totalCandidates: { $sum: 1 },
          totalInterviews: { $sum: '$interview_count' },
          hiredCount: {
            $sum: {
              $cond: [{ $eq: ['$current_status', 'Hired'] }, 1, 0]
            }
          },
          pendingFeedback: {
            $sum: {
              $size: {
                $filter: {
                  input: '$interview_history',
                  cond: {
                    $and: [
                      { $eq: ['$$this.status', 'Completed'] },
                      { $or: [
                        { $eq: ['$$this.feedback', ''] },
                        { $eq: ['$$this.feedback', null] },
                        { $not: { $ifNull: ['$$this.feedback', false] } }
                      ]}
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);

    const stats = totalStats[0] || {};
    const avgInterviewsPerCandidate = stats.totalCandidates ? stats.totalInterviews / stats.totalCandidates : 0;
    const successRate = stats.totalCandidates ? (stats.hiredCount / stats.totalCandidates) * 100 : 0;

    return NextResponse.json({
      success: true,
      statusBreakdown,
      interviewTypeStats,
      recruiters: recruiterStats,
      companies: companyStats,
      ratingDistribution,
      monthlyTrends,
      avgInterviewsPerCandidate: Math.round(avgInterviewsPerCandidate * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      pendingFeedback: stats.pendingFeedback || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}