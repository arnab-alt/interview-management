// models/Candidate.js - Updated Model
import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  interview_date: {
    type: Date,
    required: true,
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
  },
}, {
  timestamps: true,
});

const CandidateSchema = new mongoose.Schema({
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
  last_date_of_interview: {
    type: Date,
    default: null,
  },
  upcoming_interview_date: {
    type: Date,
    default: null,
  },
  when_enrolled: {
    type: Date,
    default: Date.now,
  },
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
    trim: true,
  },
  interview_by: {
    type: String,
    required: [true, 'Interviewer name is required'],
    trim: true,
  },
  interview_count: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Array of all interview details
  interview_history: [InterviewSchema],
  
  // Next interview details
  next_interview: {
    interview_date: Date,
    interviewer_name: String,
    interview_type: {
      type: String,
      enum: ['Phone', 'Video', 'In-person', 'Technical', 'HR', 'Final'],
      default: 'Phone',
    },
    notes: String,
  },
  
  current_status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Final Round', 'Offer', 'Hired', 'Rejected'],
    default: 'Applied',
  },
}, {
  timestamps: true,
});

// Create compound unique index for email and phone
CandidateSchema.index({ candidate_email: 1, candidate_phone_no: 1 }, { unique: true });

// Auto-increment interview count based on interview history
CandidateSchema.pre('save', function(next) {
  if (this.interview_history && Array.isArray(this.interview_history)) {
    this.interview_count = this.interview_history.filter(interview => 
      interview.status === 'Completed'
    ).length;
  }
  next();
});

export default mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);