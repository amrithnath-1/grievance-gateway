import { useDashboardStats } from '@/hooks/useGrievances';
import { CATEGORIES, CATEGORY_ICONS, STATUSES } from '@/lib/constants';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const PIE_COLORS = ['hsl(220,60%,50%)', 'hsl(200,70%,50%)', 'hsl(38,80%,50%)', 'hsl(25,75%,55%)', 'hsl(280,50%,55%)', 'hsl(150,50%,42%)', 'hsl(220,8%,60%)', 'hsl(0,65%,50%)'];

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
  const recentGrievances = stats.grievances.slice(0, 6);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total" value={stats.total} />
        <StatCard icon={Clock} label="Pending" value={pending} />
        <StatCard icon={AlertTriangle} label="In Progress" value={inProgress} />
        <StatCard icon={CheckCircle} label="Resolved" value={resolved} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Category Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220,60%,50%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status Breakdown</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, value }) => `${name}: ${value}`}>
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

      {/* Category grid */}
      <div>
        <h2 className="text-sm font-medium mb-3">Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => navigate(`/grievances?category=${encodeURIComponent(cat)}`)}
              className="stat-card text-center hover:border-primary/30 cursor-pointer"
            >
              <div className="text-xl mb-1">{CATEGORY_ICONS[cat]}</div>
              <div className="text-[11px] text-muted-foreground">{cat}</div>
              <div className="text-base font-semibold mt-0.5">{stats.byCategory[cat] || 0}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent grievances */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Recent Grievances</CardTitle></CardHeader>
        <CardContent className="p-0">
          {recentGrievances.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No grievances yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentGrievances.map(g => (
                  <tr
                    key={g.id}
                    onClick={() => navigate(`/grievances/${g.id}`)}
                    className="border-b last:border-0 hover:bg-muted/40 cursor-pointer"
                  >
                    <td className="p-3 font-mono text-xs text-muted-foreground">{g.grievance_id}</td>
                    <td className="p-3 text-xs truncate max-w-[200px]">{g.description}</td>
                    <td className="p-3"><StatusBadge status={g.status} /></td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="stat-card flex items-center gap-3">
      <div className="p-2 rounded-md bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
