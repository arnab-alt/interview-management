'use client';

import { useRef, useState } from 'react';
import { Save, X, User, Mail, Phone, Calendar, Building, UserCheck, Plus, Trash2 } from 'lucide-react';

export default function CandidateForm({ candidate = null, onSubmit, onCancel, loading = false }) {
  // Use refs for uncontrolled inputs to prevent re-rendering
  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const lastDateRef = useRef();
  const upcomingDateRef = useRef();
  const recruiterRef = useRef();
  const salesPersonRef = useRef();
  const companyRef = useRef();
  const interviewerRef = useRef();
  const statusRef = useRef();

  const [errors, setErrors] = useState({});
  const [interviewHistory, setInterviewHistory] = useState(candidate?.interview_history || []);
  const [nextInterview, setNextInterview] = useState(candidate?.next_interview || {
    interview_date: '',
    interviewer_name: '',
    interview_type: 'Phone',
    notes: ''
  });

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
      status: 'Completed',
      feedback: '',
      rating: 3
    };
    setInterviewHistory([...interviewHistory, newInterview]);
  };

  const removeInterviewFromHistory = (index) => {
    setInterviewHistory(interviewHistory.filter((_, i) => i !== index));
  };

  const updateInterviewHistory = (index, field, value) => {
    const updated = [...interviewHistory];
    updated[index] = { ...updated[index], [field]: value };
    setInterviewHistory(updated);
  };

  const updateNextInterview = (field, value) => {
    setNextInterview(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    const name = nameRef.current?.value?.trim();
    const email = emailRef.current?.value?.trim();
    const phone = phoneRef.current?.value?.trim();
    const recruiter = recruiterRef.current?.value?.trim();
    const salesPerson = salesPersonRef.current?.value?.trim();
    const company = companyRef.current?.value?.trim();
    const interviewer = interviewerRef.current?.value?.trim();
    
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
    
    if (!interviewer) {
      newErrors.interview_by = 'Interviewer name is required';
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
        last_date_of_interview: lastDateRef.current?.value ? new Date(lastDateRef.current.value) : null,
        upcoming_interview_date: upcomingDateRef.current?.value ? new Date(upcomingDateRef.current.value) : null,
        recruiter_name: recruiterRef.current?.value?.trim() || '',
        sales_person_name: salesPersonRef.current?.value?.trim() || '',
        interviewed_company_name: companyRef.current?.value?.trim() || '',
        interview_by: interviewerRef.current?.value?.trim() || '',
        current_status: statusRef.current?.value || 'Applied',
        interview_history: interviewHistory.filter(interview => 
          interview.interview_date && interview.interviewer_name
        ),
        next_interview: nextInterview.interview_date && nextInterview.interviewer_name ? nextInterview : null,
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
          {candidate ? 'Update candidate information' : 'Enter candidate details for interview tracking'}
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

        {/* Interview Details Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2 text-green-600" />
            Interview Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Company Name */}
            <div>
              <label htmlFor="interviewed_company_name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                Company Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={companyRef}
                id="interviewed_company_name"
                name="interviewed_company_name"
                type="text"
                defaultValue={candidate?.interviewed_company_name || ''}
                onFocus={() => clearError('interviewed_company_name')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.interviewed_company_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
                disabled={loading}
                autoComplete="organization"
              />
              {errors.interviewed_company_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.interviewed_company_name}
                </p>
              )}
            </div>

            {/* Primary Interviewer */}
            <div>
              <label htmlFor="interview_by" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                Primary Interviewer <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={interviewerRef}
                id="interview_by"
                name="interview_by"
                type="text"
                defaultValue={candidate?.interview_by || ''}
                onFocus={() => clearError('interview_by')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.interview_by ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter primary interviewer's name"
                disabled={loading}
                autoComplete="off"
              />
              {errors.interview_by && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.interview_by}
                </p>
              )}
            </div>

            {/* Last Interview Date */}
            <div>
              <label htmlFor="last_date_of_interview" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                Last Interview Date
              </label>
              <input
                ref={lastDateRef}
                id="last_date_of_interview"
                name="last_date_of_interview"
                type="date"
                defaultValue={candidate?.last_date_of_interview 
                  ? new Date(candidate.last_date_of_interview).toISOString().split('T')[0] 
                  : ''
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>

            {/* Upcoming Interview Date */}
            <div>
              <label htmlFor="upcoming_interview_date" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                Upcoming Interview Date
              </label>
              <input
                ref={upcomingDateRef}
                id="upcoming_interview_date"
                name="upcoming_interview_date"
                type="date"
                defaultValue={candidate?.upcoming_interview_date 
                  ? new Date(candidate.upcoming_interview_date).toISOString().split('T')[0] 
                  : ''
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Interview History Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Interview History
            </h3>
            <button
              type="button"
              onClick={addInterviewToHistory}
              className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Interview
            </button>
          </div>
          
          {interviewHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
              No previous interviews recorded
            </p>
          ) : (
            <div className="space-y-4">
              {interviewHistory.map((interview, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <button
                    type="button"
                    onClick={() => removeInterviewFromHistory(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interview Date
                      </label>
                      <input
                        type="date"
                        value={interview.interview_date ? new Date(interview.interview_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateInterviewHistory(index, 'interview_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interviewer
                      </label>
                      <input
                        type="text"
                        value={interview.interviewer_name || ''}
                        onChange={(e) => updateInterviewHistory(index, 'interviewer_name', e.target.value)}
                        placeholder="Interviewer name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={interview.interview_type || 'Phone'}
                        onChange={(e) => updateInterviewHistory(index, 'interview_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Interview Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-600" />
            Next Interview Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Interview Date
              </label>
              <input
                type="date"
                value={nextInterview.interview_date || ''}
                onChange={(e) => updateNextInterview('interview_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Interviewer
              </label>
              <input
                type="text"
                value={nextInterview.interviewer_name || ''}
                onChange={(e) => updateNextInterview('interviewer_name', e.target.value)}
                placeholder="Enter next interviewer's name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type
              </label>
              <select
                value={nextInterview.interview_type || 'Phone'}
                onChange={(e) => updateNextInterview('interview_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={nextInterview.notes || ''}
                onChange={(e) => updateNextInterview('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                disabled={loading}
              />
            </div>
          </div>
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