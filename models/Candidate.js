// models/Candidate.js - Optimized and Synchronized Model
import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  interview_date: {
    type: Date,
    required: true,
  },
  interview_time: {
    type: String,
    default: '',
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Please enter a valid time in HH:MM or HH:MM:SS format'],
  },
  interview_timezone: {
    type: String,
    enum: ['IST', 'EST', 'CST', 'MST', 'PST'],
    default: 'IST',
  },
  interviewer_name: {
    type: String,
    required: true,
    trim: true,
  },
  interview_type: {
    type: String,
    enum: ['Phone', 'Video', 'In-person', 'Technical', 'HR', 'Final'],
    default: 'Phone',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled',
  },
  feedback: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  round_number: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

const CandidateSchema = new mongoose.Schema({
  // Basic Information
  candidate_name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
  },
  candidate_email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  candidate_phone_no: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number'],
  },
  
  // Team Information
  recruiter_name: {
    type: String,
    required: [true, 'Recruiter name is required'],
    trim: true,
  },
  sales_person_name: {
    type: String,
    required: [true, 'Sales person name is required'],
    trim: true,
  },
  interviewed_company_name: {
    type: String,
    required: [true, 'Company name is required'],
    enum: ['CodersData', 'DetaPent', 'MatricsTek'],
    trim: true,
  },
  job_description: {
    type: String,
    maxlength: [3000, 'Job description cannot exceed 3000 characters'],
    trim: true,
    default: '',
  },
  
  // Status Information
  current_status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Final Round', 'Offer', 'Hired', 'Rejected'],
    default: 'Applied',
  },
  when_enrolled: {
    type: Date,
    default: Date.now,
  },
  
  // Auto-Calculated Fields (computed from interview_history)
  interview_count: {
    type: Number,
    default: 0,
    min: 0,
  },
  last_date_of_interview: {
    type: Date,
    default: null,
  },
  upcoming_interview_date: {
    type: Date,
    default: null,
  },
  interview_by: {
    type: String,
    default: '',
    trim: true,
  },
  
  // Interview History - Source of Truth
  interview_history: [InterviewSchema],
}, {
  timestamps: true,
});

// Create compound unique index for email and phone
CandidateSchema.index({ candidate_email: 1, candidate_phone_no: 1 }, { unique: true });

// Index for performance
CandidateSchema.index({ current_status: 1 });
CandidateSchema.index({ sales_person_name: 1 });
CandidateSchema.index({ recruiter_name: 1 });
CandidateSchema.index({ interviewed_company_name: 1 });
CandidateSchema.index({ upcoming_interview_date: 1 });
CandidateSchema.index({ when_enrolled: 1 });

// Pre-save middleware to auto-calculate fields from interview_history
CandidateSchema.pre('save', function(next) {
  if (this.interview_history && Array.isArray(this.interview_history)) {
    // Calculate interview count (only completed interviews)
    const completedInterviews = this.interview_history.filter(interview => 
      interview.status === 'Completed'
    );
    this.interview_count = completedInterviews.length;
    
    // Calculate last interview date
    const lastCompletedInterview = completedInterviews
      .sort((a, b) => new Date(b.interview_date) - new Date(a.interview_date))[0];
    this.last_date_of_interview = lastCompletedInterview ? lastCompletedInterview.interview_date : null;
    
    // Calculate upcoming interview date
    const upcomingInterviews = this.interview_history
      .filter(interview => 
        interview.status === 'Scheduled' && 
        new Date(interview.interview_date) > new Date()
      )
      .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date));
    this.upcoming_interview_date = upcomingInterviews[0] ? upcomingInterviews[0].interview_date : null;
    
    // Calculate primary interviewer (most frequent)
    const interviewerCounts = {};
    this.interview_history.forEach(interview => {
      if (interview.interviewer_name) {
        interviewerCounts[interview.interviewer_name] = 
          (interviewerCounts[interview.interviewer_name] || 0) + 1;
      }
    });
    
    const primaryInterviewer = Object.entries(interviewerCounts)
      .sort(([,a], [,b]) => b - a)[0];
    this.interview_by = primaryInterviewer ? primaryInterviewer[0] : '';
    
    // Auto-assign round numbers
    this.interview_history.forEach((interview, index) => {
      if (!interview.round_number) {
        interview.round_number = index + 1;
      }
    });
  }
  
  next();
});

// Virtual for formatted enrollment date
CandidateSchema.virtual('formatted_enrollment_date').get(function() {
  return this.when_enrolled.toLocaleDateString();
});

// Virtual for interview progress percentage
CandidateSchema.virtual('progress_percentage').get(function() {
  if (this.current_status === 'Applied') return 10;
  if (this.current_status === 'Screening') return 25;
  if (this.current_status === 'Interview') return 50;
  if (this.current_status === 'Final Round') return 75;
  if (this.current_status === 'Offer') return 90;
  if (this.current_status === 'Hired') return 100;
  if (this.current_status === 'Rejected') return 0;
  return 0;
});

// Method to add interview to history
CandidateSchema.methods.addInterview = function(interviewData) {
  this.interview_history.push({
    ...interviewData,
    round_number: this.interview_history.length + 1
  });
  return this.save();
};

// Method to update interview status
CandidateSchema.methods.updateInterviewStatus = function(interviewId, status, feedback = '', rating = null) {
  const interview = this.interview_history.id(interviewId);
  if (interview) {
    interview.status = status;
    if (feedback) interview.feedback = feedback;
    if (rating) interview.rating = rating;
    return this.save();
  }
  throw new Error('Interview not found');
};

// Static method to get candidates with upcoming interviews
CandidateSchema.statics.getUpcomingInterviews = function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    upcoming_interview_date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

// Static method to get performance stats
CandidateSchema.statics.getPerformanceStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalCandidates: { $sum: 1 },
        avgInterviews: { $avg: '$interview_count' },
        hiredCount: {
          $sum: { $cond: [{ $eq: ['$current_status', 'Hired'] }, 1, 0] }
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ['$current_status', 'Rejected'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$hiredCount', '$totalCandidates'] },
            100
          ]
        },
        rejectionRate: {
          $multiply: [
            { $divide: ['$rejectedCount', '$totalCandidates'] },
            100
          ]
        }
      }
    }
  ]);
};

export default mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);