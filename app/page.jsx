'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';

import Dashboard from '../components/Dashboard';
import SearchFilter from '../components/SearchFilter';
import CandidateList from '../components/CandidateList';
import Pagination from '../components/Pagination';

export default function HomePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, currentFilter, pagination.current]);

  const fetchCandidates = async (page = pagination.current) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(currentFilter !== 'all' && { filter: currentFilter }),
      });

      const response = await fetch(`/api/candidates?${params}`);
      const data = await response.json();

      if (data.success) {
        setCandidates(data.data);
        setPagination(data.pagination);
        setTotal(data.total);
      } else {
        toast.error('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Error fetching candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilter = (filter) => {
    setCurrentFilter(filter);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleEdit = (candidate) => {
    router.push(`/edit-candidate/${candidate._id}`);
  };

  const handleDelete = async (candidateId) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Candidate deleted successfully');
        fetchCandidates();
      } else {
        toast.error(data.error || 'Failed to delete candidate');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Error deleting candidate');
    }
  };

  const handleView = (candidate) => {
    toast.success(`Viewing ${candidate.candidate_name}`, {
      icon: '👁️',
    });
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Interview Management System
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and track candidate interviews efficiently
                </p>
              </div>
            </div>
            <Link
              href="/add-candidate"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Candidate</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
        
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchTerm={searchTerm}
          currentFilter={currentFilter}
        />
        
        <CandidateList
          candidates={candidates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          loading={loading}
        />
        
        {!loading && candidates.length > 0 && (
          <div className="mt-6">
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {!loading && total === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates yet</h3>
            <p className="mt-2 text-gray-500">Get started by adding your first candidate.</p>
            <Link
              href="/add-candidate"
              className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Candidate
            </Link>
          </div>
        )}
      </main>
    </>
  );
}