import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../utils/api.js';
import { StatCard, PageSpinner, AvatarName, StatusBadge } from '../components/common/index.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A2332', padding: 12, cornerRadius: 8, titleFont: { family: 'DM Sans', size: 13 }, bodyFont: { family: 'DM Sans', size: 12 } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9DAAB8', font: { family: 'DM Sans', size: 11 } } },
    y: { grid: { color: '#F0F4F8', drawBorder: false }, ticks: { color: '#9DAAB8', font: { family: 'DM Sans', size: 11 } } },
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats().then(r => r.data.data),
    refetchInterval: 30000,
  });
  const { data: activityData } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardAPI.getActivity().then(r => r.data.data),
  });

  if (isLoading) return <PageSpinner />;

  const overview = statsData?.overview || {};
  const revenueTrend = statsData?.revenueTrend || [];
  const monthlyRevenue = statsData?.monthlyRevenue || [];
  const appointmentByType = statsData?.appointmentByType || [];
  const recentAppointments = statsData?.recentAppointments || [];

  // Charts
  const revenueLineData = {
    labels: revenueTrend.map(d => d._id?.slice(5)),
    datasets: [{
      data: revenueTrend.map(d => d.revenue),
      borderColor: '#00B5AD',
      backgroundColor: 'rgba(0,181,173,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#00B5AD',
      borderWidth: 2,
    }],
  };

  const monthlyBarData = {
    labels: monthlyRevenue.map(d => d._id),
    datasets: [{
      data: monthlyRevenue.map(d => d.revenue),
      backgroundColor: monthlyRevenue.map((_, i) => i === monthlyRevenue.length - 1 ? '#00B5AD' : 'rgba(0,181,173,0.25)'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const typeColors = { chat: '#00B5AD', audio: '#3B82F6', video: '#8B5CF6' };
  const doughnutData = {
    labels: appointmentByType.map(t => t._id),
    datasets: [{
      data: appointmentByType.map(t => t.count),
      backgroundColor: appointmentByType.map(t => typeColors[t._id] || '#9DAAB8'),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const STAT_CARDS = [
    { label: 'Active Doctors', value: overview.totalDoctors?.toLocaleString(), icon: '⚕', color: '#00B5AD', change: 8 },
    { label: 'Total Patients', value: overview.totalPatients?.toLocaleString(), icon: '👤', color: '#3B82F6', change: 12 },
    { label: "Today's Appointments", value: overview.todayAppointments?.toLocaleString(), icon: '📅', color: '#22C55E', change: 5 },
    { label: 'Monthly Revenue', value: `₹${(overview.totalRevenue / 100000).toFixed(1)}L`, icon: '💰', color: '#F59E0B', change: 18 },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Real-time insights across the MFine platform</p>
          </div>
          {overview.pendingDoctors > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--warning-light)', borderRadius: 'var(--radius)', border: '1px solid var(--warning)20' }}>
              <AlertCircle size={16} color="var(--warning)" />
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>{overview.pendingDoctors} doctors pending verification</span>
              <button className="btn btn-sm" style={{ padding: '4px 10px', background: 'var(--warning)', color: 'white' }} onClick={() => navigate('/doctors?status=pending')}>Review</button>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        {STAT_CARDS.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'New Patients (Month)', value: overview.newPatientsThisMonth, icon: '➕', color: '#22C55E' },
          { label: 'Active Sessions', value: overview.activeAppointments, icon: '🎥', color: '#8B5CF6' },
          { label: 'Monthly Appointments', value: overview.monthlyAppointments, icon: '📊', color: '#3B82F6' },
          { label: 'Total Appointments', value: overview.totalAppointments, icon: '📈', color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 18px',
            border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value?.toLocaleString() || 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2" style={{ marginBottom: 24 }}>
        {/* Revenue Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Trend (7 Days)</h3>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={14} /> +18% this week
            </span>
          </div>
          <div style={{ height: 220 }}>
            <Line data={revenueLineData} options={{ ...chartDefaults }} />
          </div>
        </div>

        {/* Monthly Revenue Bar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 6 months</span>
          </div>
          <div style={{ height: 220 }}>
            <Bar data={monthlyBarData} options={{ ...chartDefaults }} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr', gap: 20 }}>
        {/* Appointment Types */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Consultation Types</h3>
          </div>
          <div style={{ height: 180 }}>
            <Doughnut data={doughnutData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'bottom', labels: { padding: 16, font: { family: 'DM Sans', size: 12 }, usePointStyle: true } },
                tooltip: chartDefaults.plugins.tooltip,
              },
              cutout: '65%',
            }} />
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Appointments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div>
            {recentAppointments.slice(0, 4).map((apt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none' }}>
                <AvatarName name={apt.patient?.name} subtitle={`Dr. ${apt.doctor?.name}`} size={34} />
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <StatusBadge status={apt.status} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    {new Date(apt.scheduledAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Activity</h3>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(activityData || []).slice(0, 5).map((item, i) => {
              const icons = { patient_registered: '👤', doctor_joined: '⚕', payment_received: '💳', appointment_booked: '📅' };
              const colors = { patient_registered: 'var(--info)', doctor_joined: 'var(--primary)', payment_received: 'var(--success)', appointment_booked: 'var(--warning)' };
              const labels = {
                patient_registered: `${item.data?.name} registered`,
                doctor_joined: `Dr. ${item.data?.name} joined`,
                payment_received: `Payment from ${item.data?.patient?.name}`,
                appointment_booked: `Apt: ${item.data?.patient?.name}`,
              };
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: colors[item.type] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icons[item.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels[item.type]}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
