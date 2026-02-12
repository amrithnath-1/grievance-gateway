import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGrievances } from '@/hooks/useGrievances';
import { StatusBadge } from '@/components/StatusBadge';
import { CATEGORIES, STATUSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

const PAGE_SIZE = 15;

export default function GrievanceList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const statusFilter = searchParams.get('status') || '';
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const { data: grievances, isLoading } = useGrievances(
    category || undefined,
    statusFilter || undefined
  );

  const sorted = grievances
    ? [...grievances].sort((a, b) => {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortAsc ? diff : -diff;
      })
    : [];

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Grievances</h1>
        <p className="text-muted-foreground text-sm">
          {category ? `Category: ${category}` : 'All grievances'}
          {statusFilter && ` · Status: ${statusFilter}`}
          {grievances && ` · ${grievances.length} total`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={category}
          onValueChange={(v) => { setSearchParams(prev => { v && v !== 'all' ? prev.set('category', v) : prev.delete('category'); return prev; }); setPage(0); }}
        >
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => { setSearchParams(prev => { v && v !== 'all' ? prev.set('status', v) : prev.delete('status'); return prev; }); setPage(0); }}
        >
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => setSortAsc(!sortAsc)}>
          Sort: {sortAsc ? 'Oldest first' : 'Newest first'}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Identity</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No grievances found.</td></tr>
                  ) : (
                    pageData.map(g => (
                      <tr
                        key={g.id}
                        onClick={() => navigate(`/grievances/${g.id}`)}
                        className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <td className="p-3 font-mono text-xs">{g.grievance_id}</td>
                        <td className="p-3 max-w-xs truncate">{g.description}</td>
                        <td className="p-3 text-xs">{g.category}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</td>
                        <td className="p-3"><StatusBadge status={g.status} /></td>
                        <td className="p-3">
                          {g.is_anonymous ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><EyeOff className="h-3 w-3" /> Anonymous</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs"><Eye className="h-3 w-3" /> Identified</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
