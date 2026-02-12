import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Grievance } from '@/hooks/useGrievances';

export default function SearchPage() {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('grievance_id', searchId.toUpperCase().trim())
        .maybeSingle();
      if (error) throw error;
      setResult(data as Grievance | null);
      if (!data) toast({ title: 'Not found', description: `No grievance found with ID ${searchId}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Search Grievance</h1>
        <p className="text-muted-foreground text-sm">Search by Grievance ID (e.g. GRV-000001)</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter Grievance ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="font-mono"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {searched && result && (
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/grievances/${result.id}`)}
        >
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">{result.grievance_id}</span>
              <StatusBadge status={result.status} />
            </div>
            <p className="text-sm">{result.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{result.category}</span>
              <span>{new Date(result.created_at).toLocaleDateString()}</span>
              <span>{result.is_anonymous ? 'Anonymous' : 'Identified'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {searched && !result && !loading && (
        <p className="text-sm text-muted-foreground text-center py-8">No grievance found with that ID.</p>
      )}
    </div>
  );
}
