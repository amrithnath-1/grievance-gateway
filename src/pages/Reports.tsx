import { useDashboardStats } from '@/hooks/useGrievances';
import { CATEGORIES, STATUSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const PIE_COLORS = ['hsl(220,70%,45%)', 'hsl(200,80%,50%)', 'hsl(38,92%,50%)', 'hsl(25,85%,55%)', 'hsl(280,60%,55%)', 'hsl(152,60%,40%)', 'hsl(220,10%,60%)', 'hsl(0,72%,51%)'];

export default function Reports() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-80" /><Skeleton className="h-80" /></div>;
  if (!stats) return null;

  const categoryData = CATEGORIES.map(c => ({ name: c, count: stats.byCategory[c] || 0 }));
  const statusData = STATUSES.map((s, i) => ({ name: s, value: stats.byStatus[s] || 0, color: PIE_COLORS[i] })).filter(s => s.value > 0);
  const monthlyData = Object.entries(stats.byMonth).map(([month, count]) => ({ month, count })).slice(-12);

  const identityData = [
    { name: 'Anonymous', value: stats.anonymousCount, color: 'hsl(220,70%,45%)' },
    { name: 'Identified', value: stats.identifiedCount, color: 'hsl(38,92%,50%)' },
  ].filter(d => d.value > 0);

  // Avg resolution time (simplified: time from created to updated for resolved/closed)
  const resolvedGrievances = stats.grievances.filter(g => g.status === 'Resolved' || g.status === 'Closed');
  const avgResolutionMs = resolvedGrievances.length > 0
    ? resolvedGrievances.reduce((sum, g) => sum + (new Date(g.updated_at).getTime() - new Date(g.created_at).getTime()), 0) / resolvedGrievances.length
    : 0;
  const avgResolutionDays = Math.round(avgResolutionMs / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">Comprehensive grievance analysis</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-xs text-muted-foreground">Total Grievances</p>
          <p className="text-3xl font-bold font-display">{stats.total}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-muted-foreground">Avg Resolution Time</p>
          <p className="text-3xl font-bold font-display">{avgResolutionDays > 0 ? `${avgResolutionDays} days` : 'N/A'}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-muted-foreground">Resolution Rate</p>
          <p className="text-3xl font-bold font-display">
            {stats.total > 0 ? `${Math.round((resolvedGrievances.length / stats.total) * 100)}%` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category analysis */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Category-wise Analysis</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220,70%,45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Status Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No data</p>}
          </CardContent>
        </Card>

        {/* Monthly trends */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Monthly Trends</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="hsl(220,70%,45%)" strokeWidth={2} name="Grievances" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No monthly data</p>}
          </CardContent>
        </Card>

        {/* Anonymous vs Identified */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Anonymous vs Identified</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {identityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={identityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                    {identityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">No data</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
