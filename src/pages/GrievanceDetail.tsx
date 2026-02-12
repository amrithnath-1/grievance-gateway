import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGrievance, useGrievanceActions, useUpdateGrievanceStatus } from '@/hooks/useGrievances';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/StatusBadge';
import { STATUSES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Clock, Tag, MessageSquare, Image, Video } from 'lucide-react';
import type { GrievanceStatus } from '@/lib/constants';

export default function GrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: grievance, isLoading } = useGrievance(id!);
  const { data: actions } = useGrievanceActions(id!);
  const updateStatus = useUpdateGrievanceStatus();

  const [newStatus, setNewStatus] = useState<GrievanceStatus | ''>('');
  const [remarks, setRemarks] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!grievance) return <p className="text-muted-foreground">Grievance not found.</p>;

  const handleUpdate = async () => {
    if (!newStatus || !remarks.trim()) {
      toast({ title: 'Required', description: 'Please select a status and add remarks.', variant: 'destructive' });
      return;
    }
    try {
      await updateStatus.mutateAsync({
        grievanceId: grievance.id,
        newStatus: newStatus as GrievanceStatus,
        remarks,
        adminId: user!.id,
        adminName: user!.email || 'Admin',
      });
      toast({ title: 'Updated', description: `Status changed to ${newStatus}` });
      setNewStatus('');
      setRemarks('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">{grievance.grievance_id}</h1>
          <p className="text-sm text-muted-foreground">{grievance.category}</p>
        </div>
        <StatusBadge status={grievance.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-sm font-display">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{grievance.description}</p>
            </CardContent>
          </Card>

          {/* Media */}
          {(grievance.image_url || grievance.video_url) && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-display">Attachments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {grievance.image_url && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Image className="h-3 w-3" /> Image</div>
                    <img src={grievance.image_url} alt="Grievance attachment" className="rounded-lg max-h-80 object-contain border" />
                  </div>
                )}
                {grievance.video_url && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Video className="h-3 w-3" /> Video</div>
                    <video controls className="rounded-lg max-h-80 border w-full">
                      <source src={grievance.video_url} />
                    </video>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action History */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-display">Action History</CardTitle></CardHeader>
            <CardContent>
              {!actions || actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No actions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {actions.map(a => (
                    <div key={a.id} className="border-l-2 border-primary/20 pl-4 py-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(a.created_at).toLocaleString()}
                        <span>by {a.admin_name || 'System'}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={a.new_status} />
                      </div>
                      <p className="text-sm mt-1">{a.remarks}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Action */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-display flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Take Action</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as GrievanceStatus)}>
                <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Enter remarks or action taken..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
              <Button onClick={handleUpdate} disabled={updateStatus.isPending}>
                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: identity */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-sm font-display flex items-center gap-2"><User className="h-4 w-4" /> Identity</CardTitle></CardHeader>
            <CardContent>
              {grievance.is_anonymous ? (
                <p className="text-sm text-muted-foreground italic">Anonymous submission</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {grievance.user_name || 'N/A'}</div>
                  <div><span className="text-muted-foreground">Role:</span> {grievance.user_role || 'N/A'}</div>
                  <div><span className="text-muted-foreground">Department:</span> {grievance.user_department || 'N/A'}</div>
                  <div><span className="text-muted-foreground">User ID:</span> {grievance.user_id || 'N/A'}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-display flex items-center gap-2"><Tag className="h-4 w-4" /> Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Category:</span> {grievance.category}</div>
              <div><span className="text-muted-foreground">Submitted:</span> {new Date(grievance.created_at).toLocaleString()}</div>
              <div><span className="text-muted-foreground">Updated:</span> {new Date(grievance.updated_at).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
