'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, UserCheck } from 'lucide-react';

import CandidateForm from '../../../components/CandidateForm';

export default function EditCandidatePage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/candidates/${id}`);
      const data = await response.json();

      if (data.success) {
        setCandidate(data.data);
      } else {
        toast.error('Candidate not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Error fetching candidate');
      router.push('/');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Candidate updated successfully!', {
          icon: '✅',
        });
        router.push('/');
      } else {
        toast.error(data.error || 'Failed to update candidate');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Error updating candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Candidate
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Update candidate information
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {candidate && (
          <CandidateForm
            candidate={candidate}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        )}
      </main>
    </>
  );
}