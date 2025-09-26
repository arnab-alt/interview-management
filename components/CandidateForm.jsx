'use client';

import { useRef, useState, useEffect } from 'react';
import { Save, X, User, Mail, Phone, Calendar, Building, UserCheck, Plus, Trash2 } from 'lucide-react';

export default function CandidateForm({ candidate = null, onSubmit, onCancel, loading = false }) {
  // Basic info refs
  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const recruiterRef = useRef();
  const salesPersonRef = useRef();
  const companyRef = useRef();
  const statusRef = useRef();
  
  const [errors, setErrors] = useState({});
  const [interviewHistory, setInterviewHistory] = useState(candidate?.interview_history || []);

  // Auto-calculate fields from interview history
  const [calculatedFields, setCalculatedFields] = useState({
    interview_count: 0,
    last_date_of_interview: null,
    upcoming_interview_date: null,
    primary_interviewer: '',
  });

  useEffect(() => {
    calculateFieldsFromHistory();
  }, [interviewHistory]);

  const calculateFieldsFromHistory = () => {
    const completedInterviews = interviewHistory.filter(interview => 
      interview.status === 'Completed' && interview.interview_date
    );
    
    const scheduledInterviews = interviewHistory.filter(interview => 
      interview.status === 'Scheduled' && 
      interview.interview_date && 
      new Date(interview.interview_date) > new Date()
    );

    // Calculate last interview date
    const lastInterview = completedInterviews
      .sort((a, b) => new Date(b.interview_date) - new Date(a.interview_date))[0];
    
    // Calculate next upcoming interview
    const nextInterview = scheduledInterviews
      .sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date))[0];

    // Get most frequent interviewer as primary
    const interviewerCounts = {};
    interviewHistory.forEach(interview => {
      if (interview.interviewer_name) {
        interviewerCounts[interview.interviewer_name] = 
          (interviewerCounts[interview.interviewer_name] || 0) + 1;
      }
    });
    
    const primaryInterviewer = Object.entries(interviewerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    setCalculatedFields({
      interview_count: completedInterviews.length,
      last_date_of_interview: lastInterview?.interview_date || null,
      upcoming_interview_date: nextInterview?.interview_date || null,
      primary_interviewer: primaryInterviewer,
    });
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const addInterviewToHistory = () => {
    const newInterview = {
      interview_date: '',
      interviewer_name: '',
      interview_type: 'Phone',
      status: 'Scheduled',
      feedback: '',
      rating: null,
      round_number: interviewHistory.length + 1
    };
    setInterviewHistory([...interviewHistory, newInterview]);
  };

  const removeInterviewFromHistory = (index) => {
    const updated = interviewHistory.filter((_, i) => i !== index);
    // Recalculate round numbers
    const reIndexed = updated.map((interview, i) => ({
      ...interview,
      round_number: i + 1
    }));
    setInterviewHistory(reIndexed);
  };

  const updateInterviewHistory = (index, field, value) => {
    const updated = [...interviewHistory];
    updated[index] = { ...updated[index], [field]: value };
    setInterviewHistory(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    
    const name = nameRef.current?.value?.trim();
    const email = emailRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();
    const recruiter = recruiterRef.current?.value?.trim();
    const salesPerson = salesPersonRef.current?.value?.trim();
    const company = companyRef.current?.value?.trim();
    
    if (!name) {
      newErrors.candidate_name = 'Candidate name is required';
    }
    
    if (!email) {
      newErrors.candidate_email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.candidate_email = 'Please enter a valid email';
    }
    
    if (!phone) {
      newErrors.candidate_phone_no = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(phone)) {
      newErrors.candidate_phone_no = 'Please enter a valid phone number (10-15 digits)';
    }
    
    if (!recruiter) {
      newErrors.recruiter_name = 'Recruiter name is required';
    }
    
    if (!salesPerson) {
      newErrors.sales_person_name = 'Sales person name is required';
    }
    
    if (!company) {
      newErrors.interviewed_company_name = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formData = {
        candidate_name: nameRef.current?.value?.trim() || '',
        candidate_email: emailRef.current?.value?.trim() || '',
        candidate_phone_no: phoneRef.current?.value?.trim() || '',
        recruiter_name: recruiterRef.current?.value?.trim() || '',
        sales_person_name: salesPersonRef.current?.value?.trim() || '',
        interviewed_company_name: companyRef.current?.value?.trim() || '',
        current_status: statusRef.current?.value || 'Applied',
        
        // Auto-calculated fields from interview history
        interview_count: calculatedFields.interview_count,
        last_date_of_interview: calculatedFields.last_date_of_interview 
          ? new Date(calculatedFields.last_date_of_interview) 
          : null,
        upcoming_interview_date: calculatedFields.upcoming_interview_date 
          ? new Date(calculatedFields.upcoming_interview_date) 
          : null,
        interview_by: calculatedFields.primary_interviewer,
        
        // Interview history with proper date conversion
        interview_history: interviewHistory.map(interview => ({
          ...interview,
          interview_date: interview.interview_date ? new Date(interview.interview_date) : null,
          rating: interview.rating ? parseInt(interview.rating) : null,
        })).filter(interview => interview.interview_date && interview.interviewer_name),
      };
      
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {candidate ? 'Edit Candidate' : 'Add New Candidate'}
        </h2>
        <p className="text-gray-600 mt-1">
          {candidate ? 'Update candidate information and interview history' : 'Enter candidate details and track interview progress'}
        </p>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Name */}
            <div>
              <label htmlFor="candidate_name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Full Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={nameRef}
                id="candidate_name"
                name="candidate_name"
                type="text"
                defaultValue={candidate?.candidate_name || ''}
                onFocus={() => clearError('candidate_name')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.candidate_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter candidate's full name"
                disabled={loading}
                autoComplete="name"
              />
              {errors.candidate_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.candidate_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="candidate_email" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email Address <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={emailRef}
                id="candidate_email"
                name="candidate_email"
                type="email"
                defaultValue={candidate?.candidate_email || ''}
                onFocus={() => clearError('candidate_email')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.candidate_email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={loading}
                autoComplete="email"
              />
              {errors.candidate_email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.candidate_email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="candidate_phone_no" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={phoneRef}
                id="candidate_phone_no"
                name="candidate_phone_no"
                type="tel"
                defaultValue={candidate?.candidate_phone_no || ''}
                onFocus={() => clearError('candidate_phone_no')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.candidate_phone_no ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter phone number (10-15 digits)"
                disabled={loading}
                autoComplete="tel"
              />
              {errors.candidate_phone_no && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.candidate_phone_no}
                </p>
              )}
            </div>

            {/* Current Status */}
            <div>
              <label htmlFor="current_status" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                Current Status
              </label>
              <select
                ref={statusRef}
                id="current_status"
                name="current_status"
                defaultValue={candidate?.current_status || 'Applied'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Final Round">Final Round</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team & Company Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2 text-green-600" />
            Team & Company Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recruiter Name */}
            <div>
              <label htmlFor="recruiter_name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                Recruiter Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={recruiterRef}
                id="recruiter_name"
                name="recruiter_name"
                type="text"
                defaultValue={candidate?.recruiter_name || ''}
                onFocus={() => clearError('recruiter_name')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.recruiter_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter recruiter's name"
                disabled={loading}
                autoComplete="off"
              />
              {errors.recruiter_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.recruiter_name}
                </p>
              )}
            </div>

            {/* Sales Person Name */}
            <div>
              <label htmlFor="sales_person_name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                Sales Person Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={salesPersonRef}
                id="sales_person_name"
                name="sales_person_name"
                type="text"
                defaultValue={candidate?.sales_person_name || ''}
                onFocus={() => clearError('sales_person_name')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.sales_person_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter sales person's name"
                disabled={loading}
                autoComplete="off"
              />
              {errors.sales_person_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.sales_person_name}
                </p>
              )}
            </div>

            {/* Company Name - Dropdown */}
            <div>
              <label htmlFor="interviewed_company_name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                Company Name <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                ref={companyRef}
                id="interviewed_company_name"
                name="interviewed_company_name"
                defaultValue={candidate?.interviewed_company_name || ''}
                onFocus={() => clearError('interviewed_company_name')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.interviewed_company_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select a company</option>
                <option value="CodersData">CodersData</option>
                <option value="DetaPent">DetaPent</option>
                <option value="MatricsTek">MatricsTek</option>
              </select>
              {errors.interviewed_company_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.interviewed_company_name}
                </p>
              )}
            </div>
          </div>

          {/* Job Description - Full Width */}
          <div className="mt-6">
            <label htmlFor="job_description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 mr-2 text-gray-500" />
              Job Description
            </label>
            <textarea
              ref={jobDescriptionRef}
              id="job_description"
              name="job_description"
              defaultValue={candidate?.job_description || ''}
              rows={8}
              maxLength={3000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical min-h-[200px]"
              placeholder="Enter detailed job description, requirements, responsibilities, and other relevant details... (Max 3000 characters)"
              disabled={loading}
              onChange={(e) => setJobDescriptionLength(e.target.value.length)}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Provide comprehensive job details including requirements, responsibilities, and qualifications
              </p>
              <p className="text-xs text-gray-500">
                <span className={`${jobDescriptionLength > 2800 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  {jobDescriptionLength}
                </span> / 3000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Calculated Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Interview Summary (Auto-Calculated)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{calculatedFields.interview_count}</div>
              <div className="text-sm text-gray-600">Total Interviews</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-900">
                {calculatedFields.last_date_of_interview 
                  ? new Date(calculatedFields.last_date_of_interview).toLocaleDateString()
                  : 'None'}
              </div>
              <div className="text-sm text-gray-600">Last Interview</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-900">
                {calculatedFields.upcoming_interview_date 
                  ? new Date(calculatedFields.upcoming_interview_date).toLocaleDateString()
                  : 'None scheduled'}
              </div>
              <div className="text-sm text-gray-600">Next Interview</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-900">
                {calculatedFields.primary_interviewer || 'None'}
              </div>
              <div className="text-sm text-gray-600">Primary Interviewer</div>
            </div>
          </div>
        </div>

        {/* Interview History Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Interview History & Schedule
            </h3>
            <button
              type="button"
              onClick={addInterviewToHistory}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center shadow-md"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Interview
            </button>
          </div>
          
          {interviewHistory.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No interviews scheduled yet</p>
              <p className="text-gray-400 text-sm mt-1">Add interview rounds to track the candidate's progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewHistory.map((interview, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 relative bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                        Round {interview.round_number || index + 1}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        interview.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interview.status || 'Scheduled'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInterviewFromHistory(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                      disabled={loading}
                      title="Remove Interview"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interview Date *
                      </label>
                      <input
                        type="date"
                        value={interview.interview_date ? new Date(interview.interview_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateInterviewHistory(index, 'interview_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interviewer *
                      </label>
                      <input
                        type="text"
                        value={interview.interviewer_name || ''}
                        onChange={(e) => updateInterviewHistory(index, 'interviewer_name', e.target.value)}
                        placeholder="Interviewer name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interview Type
                      </label>
                      <select
                        value={interview.interview_type || 'Phone'}
                        onChange={(e) => updateInterviewHistory(index, 'interview_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        disabled={loading}
                      >
                        <option value="Phone">Phone</option>
                        <option value="Video">Video</option>
                        <option value="In-person">In-person</option>
                        <option value="Technical">Technical</option>
                        <option value="HR">HR</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={interview.status || 'Scheduled'}
                        onChange={(e) => updateInterviewHistory(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        disabled={loading}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rescheduled">Rescheduled</option>
                      </select>
                    </div>
                  </div>

                  {interview.status === 'Completed' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating (1-5)
                        </label>
                        <select
                          value={interview.rating || ''}
                          onChange={(e) => updateInterviewHistory(index, 'rating', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          disabled={loading}
                        >
                          <option value="">Select rating</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Below Average</option>
                          <option value="3">3 - Average</option>
                          <option value="4">4 - Good</option>
                          <option value="5">5 - Excellent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback
                        </label>
                        <textarea
                          value={interview.feedback || ''}
                          onChange={(e) => updateInterviewHistory(index, 'feedback', e.target.value)}
                          placeholder="Interview feedback and notes..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            <Save className="h-4 w-4" />
            <span>
              {loading 
                ? (candidate ? 'Updating...' : 'Saving...') 
                : (candidate ? 'Update Candidate' : 'Save Candidate')
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}