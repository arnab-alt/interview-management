'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, Building, UserCheck, TrendingUp, Clock, User } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    notConducted: 0,
    oneInterview: 0,
    twoInterviews: 0,
    threePlus: 0,
    upcomingInterviews: 0,
    totalSalesPersons: 0,
  });
  const [salesPersonStats, setSalesPersonStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSalesPersonStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all([
        fetch('/api/candidates?limit=1000'),
        fetch('/api/candidates?filter=not_conducted&limit=1000'),
        fetch('/api/candidates?filter=one_interview&limit=1000'),
        fetch('/api/candidates?filter=two_interviews&limit=1000'),
        fetch('/api/candidates?filter=three_plus&limit=1000'),
        fetch('/api/candidates?filter=upcoming&limit=1000'), // New filter for upcoming interviews
      ]);

      const data = await Promise.all(responses.map(r => r.json()));
      
      setStats({
        total: data[0].total || 0,
        notConducted: data[1].total || 0,
        oneInterview: data[2].total || 0,
        twoInterviews: data[3].total || 0,
        threePlus: data[4].total || 0,
        upcomingInterviews: data[5].total || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesPersonStats = async () => {
    try {
      const response = await fetch('/api/candidates/sales-stats');
      const data = await response.json();
      if (data.success) {
        setSalesPersonStats(data.salesPersons || []);
        setStats(prev => ({
          ...prev,
          totalSalesPersons: data.salesPersons?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching sales person stats:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, trend }) => (
    <div className={`${bgColor} rounded-xl shadow-lg p-6 border-0 transform hover:scale-105 transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
            <div className={`text-3xl font-bold ${color} mt-1`}>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                value
              )}
            </div>
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
            <p className="text-xs text-gray-500">+12%</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Track your interview management metrics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Candidates"
          value={stats.total}
          color="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          trend={true}
        />
        <StatCard
          icon={Calendar}
          title="Not Conducted"
          value={stats.notConducted}
          color="text-red-600"
          bgColor="bg-gradient-to-br from-red-50 to-red-100"
        />
        <StatCard
          icon={Building}
          title="1 Interview"
          value={stats.oneInterview}
          color="text-yellow-600"
          bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
        />
        <StatCard
          icon={UserCheck}
          title="2 Interviews"
          value={stats.twoInterviews}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
        />
        <StatCard
          icon={UserCheck}
          title="3+ Interviews"
          value={stats.threePlus}
          color="text-purple-600"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
        />
        <StatCard
          icon={Clock}
          title="Upcoming"
          value={stats.upcomingInterviews}
          color="text-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
        />
      </div>
      
      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : Math.round(((stats.oneInterview + stats.twoInterviews + stats.threePlus) / Math.max(stats.total, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Interview Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.oneInterview + stats.twoInterviews + stats.threePlus}
              </div>
              <div className="text-sm text-gray-600">Active Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? '...' : stats.twoInterviews + stats.threePlus}
              </div>
              <div className="text-sm text-gray-600">Advanced Rounds</div>
            </div>
          </div>
        </div>

        {/* Sales Person Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-indigo-600" />
            Sales Team Performance
          </h3>
          {salesPersonStats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sales person data available</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {salesPersonStats.slice(0, 5).map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-500">{person.candidateCount} candidates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {person.interviewsCompleted} interviews
                    </p>
                    <p className="text-xs text-gray-500">
                      {person.successRate}% success rate
                    </p>
                  </div>
                </div>
              ))}
              {salesPersonStats.length > 5 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  And {salesPersonStats.length - 5} more...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Interviews Today */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-orange-600" />
          Today's Upcoming Interviews
        </h3>
        <UpcomingInterviewsList />
      </div>
    </div>
  );
}

// Component for displaying today's upcoming interviews
function UpcomingInterviewsList() {
  const [upcomingToday, setUpcomingToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingToday();
  }, []);

  const fetchUpcomingToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/candidates?upcoming_date=${today}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setUpcomingToday(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching today\'s interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (upcomingToday.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No interviews scheduled for today
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingToday.map((candidate) => (
        <div key={candidate._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{candidate.candidate_name}</p>
              <p className="text-sm text-gray-600">{candidate.interviewed_company_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {candidate.next_interview?.interviewer_name || candidate.interview_by}
            </p>
            <p className="text-xs text-gray-500">
              {candidate.next_interview?.interview_type || 'Phone'} Interview
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}