import { useDashboardStats } from '@/hooks/useGrievances';
import { CATEGORIES, CATEGORY_ICONS, STATUSES } from '@/lib/constants';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const PIE_COLORS = ['hsl(220,70%,45%)', 'hsl(200,80%,50%)', 'hsl(38,92%,50%)', 'hsl(25,85%,55%)', 'hsl(280,60%,55%)', 'hsl(152,60%,40%)', 'hsl(220,10%,60%)', 'hsl(0,72%,51%)'];

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;
  if (!stats) return null;

  const pending = (stats.byStatus['Submitted'] || 0) + (stats.byStatus['Acknowledged'] || 0);
  const inProgress = (stats.byStatus['Under Review'] || 0) + (stats.byStatus['In Progress'] || 0);
  const resolved = (stats.byStatus['Resolved'] || 0) + (stats.byStatus['Closed'] || 0);

  const categoryData = CATEGORIES.map(c => ({ name: c, count: stats.byCategory[c] || 0 }));
  const statusData = STATUSES.map((s, i) => ({ name: s, value: stats.byStatus[s] || 0, color: PIE_COLORS[i] })).filter(s => s.value > 0);
  const recentGrievances = stats.grievances.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Grievance Redressal System Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Grievances" value={stats.total} color="text-primary" />
        <StatCard icon={Clock} label="Pending" value={pending} color="text-warning" />
        <StatCard icon={AlertTriangle} label="In Progress" value={inProgress} color="text-info" />
        <StatCard icon={CheckCircle} label="Resolved" value={resolved} color="text-success" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Category Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220,70%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Status Breakdown</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category cards */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => navigate(`/grievances?category=${encodeURIComponent(cat)}`)}
              className="stat-card text-left hover:border-primary/30 cursor-pointer"
            >
              <div className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</div>
              <div className="text-xs font-medium text-muted-foreground">{cat}</div>
              <div className="text-lg font-bold font-display">{stats.byCategory[cat] || 0}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent grievances */}
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Recent Grievances</CardTitle></CardHeader>
        <CardContent>
          {recentGrievances.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No grievances yet.</p>
          ) : (
            <div className="space-y-2">
              {recentGrievances.map(g => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/grievances/${g.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{g.grievance_id}</span>
                      <StatusBadge status={g.status} />
                      {g.is_anonymous && <span className="text-xs text-muted-foreground italic">Anonymous</span>}
                    </div>
                    <p className="text-sm truncate mt-0.5">{g.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-3 shrink-0">
                    {new Date(g.created_at).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="stat-card flex items-start gap-3">
      <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold font-display">{value}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
