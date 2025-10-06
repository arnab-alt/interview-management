'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Building, UserCheck, TrendingUp, Clock, User, 
  Phone, Mail, Star, Award, Target, AlertCircle, CheckCircle,
  BarChart3, PieChart, Activity
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    notConducted: 0,
    oneInterview: 0,
    twoInterviews: 0,
    threePlus: 0,
    upcomingInterviews: 0,
    totalSalesPersons: 0,
    totalRecruiters: 0,
    totalCompanies: 0,
    avgInterviewsPerCandidate: 0,
    successRate: 0,
    pendingFeedback: 0,
  });
  
  const [detailedStats, setDetailedStats] = useState({
    statusBreakdown: [],
    interviewTypeStats: [],
    salesPersonStats: [],
    recruiterStats: [],
    companyStats: [],
    monthlyTrends: [],
    ratingDistribution: [],
  });
  
  const [loading, setLoading] = useState(true);

  const [lastUpdatedTime, setLastUpdatedTime] = useState(null); 
  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString());
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all([
        fetch('/api/candidates?limit=1000'),
        fetch('/api/candidates?filter=not_conducted&limit=1000'),
        fetch('/api/candidates?filter=one_interview&limit=1000'),
        fetch('/api/candidates?filter=two_interviews&limit=1000'),
        fetch('/api/candidates?filter=three_plus&limit=1000'),
        fetch('/api/candidates?filter=upcoming&limit=1000'),
        fetch('/api/candidates/detailed-stats'),
        fetch('/api/candidates/sales-stats'),
      ]);

      const data = await Promise.all(responses.map(r => r.json()));
      
      // Basic stats
      setStats({
        total: data[0].total || 0,
        notConducted: data[1].total || 0,
        oneInterview: data[2].total || 0,
        twoInterviews: data[3].total || 0,
        threePlus: data[4].total || 0,
        upcomingInterviews: data[5].total || 0,
        totalSalesPersons: data[7].salesPersons?.length || 0,
        totalRecruiters: data[6].recruiters?.length || 0,
        totalCompanies: data[6].companies?.length || 0,
        avgInterviewsPerCandidate: data[6].avgInterviewsPerCandidate || 0,
        successRate: data[6].successRate || 0,
        pendingFeedback: data[6].pendingFeedback || 0,
      });

      // Detailed stats
      if (data[6].success) {
        setDetailedStats({
          statusBreakdown: data[6].statusBreakdown || [],
          interviewTypeStats: data[6].interviewTypeStats || [],
          salesPersonStats: data[7].salesPersons || [],
          recruiterStats: data[6].recruiters || [],
          companyStats: data[6].companies || [],
          monthlyTrends: data[6].monthlyTrends || [],
          ratingDistribution: data[6].ratingDistribution || [],
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, trend, subtitle }) => (
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
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <TrendingUp className="h-5 w-5 text-green-500 mb-1" />
            <p className="text-xs text-gray-500">{trend}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Comprehensive Dashboard</h2>
          <p className="text-gray-600 mt-1">Complete overview of your interview management system</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Last updated: {lastUpdatedTime || '...'}</span>
        </div>
      </div>
      
      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Candidates"
          value={stats.total}
          color="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          trend="+12%"
          subtitle="All registered candidates"
        />
        <StatCard
          icon={Calendar}
          title="Active Interviews"
          value={stats.oneInterview + stats.twoInterviews + stats.threePlus}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          trend="+8%"
          subtitle="Candidates in interview process"
        />
        <StatCard
          icon={Clock}
          title="Upcoming This Week"
          value={stats.upcomingInterviews}
          color="text-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          subtitle="Scheduled interviews"
        />
        <StatCard
          icon={Target}
          title="Success Rate"
          value={`${stats.successRate}%`}
          color="text-purple-600"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          trend="+5%"
          subtitle="Interview to hire ratio"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <StatCard
          icon={UserCheck}
          title="Sales Team"
          value={stats.totalSalesPersons}
          color="text-indigo-600"
          bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
          subtitle="Active sales persons"
        />
        <StatCard
          icon={User}
          title="Recruiters"
          value={stats.totalRecruiters}
          color="text-teal-600"
          bgColor="bg-gradient-to-br from-teal-50 to-teal-100"
          subtitle="Active recruiters"
        />
        <StatCard
          icon={Building}
          title="Companies"
          value={stats.totalCompanies}
          color="text-cyan-600"
          bgColor="bg-gradient-to-br from-cyan-50 to-cyan-100"
          subtitle="Partner companies"
        />
        <StatCard
          icon={BarChart3}
          title="Avg Interviews"
          value={stats.avgInterviewsPerCandidate.toFixed(1)}
          color="text-rose-600"
          bgColor="bg-gradient-to-br from-rose-50 to-rose-100"
          subtitle="Per candidate"
        />
        <StatCard
          icon={AlertCircle}
          title="Pending Feedback"
          value={stats.pendingFeedback}
          color="text-amber-600"
          bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
          subtitle="Awaiting feedback"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={stats.total - stats.notConducted}
          color="text-emerald-600"
          bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
          subtitle="Interviews done"
        />
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Interview Progress Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            Interview Progress
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Not Conducted</span>
              </div>
              <div className="text-sm font-medium">{stats.notConducted}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">1 Interview</span>
              </div>
              <div className="text-sm font-medium">{stats.oneInterview}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">2 Interviews</span>
              </div>
              <div className="text-sm font-medium">{stats.twoInterviews}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">3+ Interviews</span>
              </div>
              <div className="text-sm font-medium">{stats.threePlus}</div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Candidate Status
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {detailedStats.statusBreakdown.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status._id === 'Applied' ? 'bg-gray-500' :
                    status._id === 'Screening' ? 'bg-blue-500' :
                    status._id === 'Interview' ? 'bg-yellow-500' :
                    status._id === 'Final Round' ? 'bg-orange-500' :
                    status._id === 'Offer' ? 'bg-green-500' :
                    status._id === 'Hired' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">{status._id}</span>
                </div>
                <div className="text-sm font-medium">{status.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Types Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Interview Types
          </h3>
          <div className="space-y-3">
            {detailedStats.interviewTypeStats.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type._id === 'Phone' ? 'bg-blue-500' :
                    type._id === 'Video' ? 'bg-green-500' :
                    type._id === 'In-person' ? 'bg-purple-500' :
                    type._id === 'Technical' ? 'bg-orange-500' :
                    type._id === 'HR' ? 'bg-pink-500' :
                    'bg-indigo-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">{type._id}</span>
                </div>
                <div className="text-sm font-medium">{type.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Sales Team Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-indigo-600" />
            Sales Team Performance
          </h3>
          {detailedStats.salesPersonStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {detailedStats.salesPersonStats.slice(0, 10).map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.candidateCount} candidates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{person.successRate}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{person.interviewsCompleted} interviews</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-cyan-600" />
            Top Companies
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {detailedStats.companyStats.slice(0, 10).map((company, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Building className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.candidateCount} candidates</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{company.avgInterviews.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">avg interviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Distribution & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interview Ratings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-600" />
            Interview Ratings
          </h3>
          <div className="space-y-3">
            {detailedStats.ratingDistribution.map((rating, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating._id ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{rating._id} Stars</span>
                </div>
                <div className="text-sm font-medium">{rating.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Today's Interview Schedule
          </h3>
          <TodaysSchedule />
        </div>
      </div>
    </div>
  );
}

// Component for Today's Schedule
function TodaysSchedule() {
  const [todayInterviews, setTodayInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/candidates/today-schedule?date=${today}`);
      const data = await response.json();
      if (data.success) {
        setTodayInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (todayInterviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">No interviews scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {todayInterviews.map((interview, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{interview.candidateName}</p>
              <p className="text-sm text-gray-600">{interview.companyName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{interview.interviewerName}</p>
            <p className="text-xs text-gray-500">{interview.interviewType} • {interview.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}