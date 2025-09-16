'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, Calendar, Building, User, Phone, Mail, MoreVertical, Clock, Users } from 'lucide-react';

export default function CandidateList({ 
  candidates, 
  onEdit, 
  onDelete, 
  onView, 
  loading = false 
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showActions, setShowActions] = useState(null);

  const handleDeleteClick = (candidate) => {
    setDeleteConfirm(candidate);
    setShowActions(null);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm._id);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInterviewBadge = (count) => {
    const badges = {
      0: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Not Conducted' },
      1: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: '1 Interview' },
      2: { color: 'bg-green-100 text-green-800 border-green-200', text: '2 Interviews' },
    };
    
    if (count >= 3) {
      return { color: 'bg-purple-100 text-purple-800 border-purple-200', text: `${count} Interviews` };
    }
    
    return badges[count] || badges[0];
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Applied': 'bg-gray-100 text-gray-800',
      'Screening': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
      'Final Round': 'bg-orange-100 text-orange-800',
      'Offer': 'bg-green-100 text-green-800',
      'Hired': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    
    return statusColors[status] || statusColors['Applied'];
  };

  const isUpcomingToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toDateString();
    const upcomingDate = new Date(dateString).toDateString();
    return today === upcomingDate;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-12 text-center">
        <User className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates found</h3>
        <p className="mt-2 text-gray-500">
          No candidates match your current search and filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team & Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interview Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => {
                const badge = getInterviewBadge(candidate.interview_count);
                const statusColor = getStatusBadge(candidate.current_status);
                return (
                  <tr key={candidate._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.candidate_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {candidate._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {candidate.candidate_email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {candidate.candidate_phone_no}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          {candidate.interviewed_company_name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          Sales: {candidate.sales_person_name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          Recruiter: {candidate.recruiter_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Last: {formatDate(candidate.last_date_of_interview)}
                        </div>
                        {candidate.upcoming_interview_date && (
                          <div className={`flex items-center text-sm ${isUpcomingToday(candidate.upcoming_interview_date) ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            Next: {formatDate(candidate.upcoming_interview_date)}
                            {isUpcomingToday(candidate.upcoming_interview_date) && (
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Today</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          By: {candidate.interview_by}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${badge.color}`}>
                          {badge.text}
                        </span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                            {candidate.current_status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onView(candidate)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(candidate)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(candidate)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {candidates.map((candidate) => {
              const badge = getInterviewBadge(candidate.interview_count);
              const statusColor = getStatusBadge(candidate.current_status);
              return (
                <div key={candidate._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {candidate.candidate_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {candidate._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === candidate._id ? null : candidate._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {showActions === candidate._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onView(candidate);
                                setShowActions(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                onEdit(candidate);
                                setShowActions(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(candidate)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {candidate.candidate_email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {candidate.candidate_phone_no}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      {candidate.interviewed_company_name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      Sales: {candidate.sales_person_name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Last: {formatDate(candidate.last_date_of_interview)}
                    </div>
                    {candidate.upcoming_interview_date && (
                      <div className={`flex items-center text-sm ${isUpcomingToday(candidate.upcoming_interview_date) ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Next: {formatDate(candidate.upcoming_interview_date)}
                        {isUpcomingToday(candidate.upcoming_interview_date) && (
                          <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Today</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${badge.color}`}>
                      {badge.text}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                      {candidate.current_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Delete
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.candidate_name}</span>? 
              This action cannot be undone and will permanently remove all candidate information including interview history.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowActions(null)}
        />
      )}
    </>
  );
}