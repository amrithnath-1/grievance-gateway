import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GrievanceCategory, GrievanceStatus } from '@/lib/constants';

export interface Grievance {
  id: string;
  grievance_id: string;
  category: GrievanceCategory;
  description: string;
  is_anonymous: boolean;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  user_department: string | null;
  image_url: string | null;
  video_url: string | null;
  status: GrievanceStatus;
  created_at: string;
  updated_at: string;
}

export interface GrievanceAction {
  id: string;
  grievance_id: string;
  action_by: string | null;
  admin_name: string | null;
  remarks: string;
  new_status: GrievanceStatus;
  created_at: string;
}

export function useGrievances(category?: string, status?: string) {
  return useQuery({
    queryKey: ['grievances', category, status],
    queryFn: async () => {
      let query = supabase.from('grievances').select('*').order('created_at', { ascending: false });
      if (category) query = query.eq('category', category as any);
      if (status) query = query.eq('status', status as any);
      const { data, error } = await query;
      if (error) throw error;
      return data as Grievance[];
    },
  });
}

export function useGrievance(id: string) {
  return useQuery({
    queryKey: ['grievance', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Grievance;
    },
    enabled: !!id,
  });
}

export function useGrievanceActions(grievanceId: string) {
  return useQuery({
    queryKey: ['grievance-actions', grievanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievance_actions')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as GrievanceAction[];
    },
    enabled: !!grievanceId,
  });
}

export function useUpdateGrievanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      grievanceId,
      newStatus,
      remarks,
      adminId,
      adminName,
    }: {
      grievanceId: string;
      newStatus: GrievanceStatus;
      remarks: string;
      adminId: string;
      adminName: string;
    }) => {
      // Update grievance status
      const { error: updateError } = await supabase
        .from('grievances')
        .update({ status: newStatus })
        .eq('id', grievanceId);
      if (updateError) throw updateError;

      // Insert action history
      const { error: actionError } = await supabase
        .from('grievance_actions')
        .insert({
          grievance_id: grievanceId,
          action_by: adminId,
          admin_name: adminName,
          remarks,
          new_status: newStatus,
        });
      if (actionError) throw actionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      queryClient.invalidateQueries({ queryKey: ['grievance'] });
      queryClient.invalidateQueries({ queryKey: ['grievance-actions'] });
    },
  });
}

export function useSearchGrievance(searchId: string) {
  return useQuery({
    queryKey: ['search-grievance', searchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('grievance_id', searchId.toUpperCase())
        .single();
      if (error) throw error;
      return data as Grievance;
    },
    enabled: !!searchId && searchId.length >= 3,
    retry: false,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('grievances').select('*');
      if (error) throw error;
      const grievances = data as Grievance[];

      const total = grievances.length;
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byMonth: Record<string, number> = {};
      let anonymousCount = 0;

      grievances.forEach((g) => {
        byCategory[g.category] = (byCategory[g.category] || 0) + 1;
        byStatus[g.status] = (byStatus[g.status] || 0) + 1;
        if (g.is_anonymous) anonymousCount++;
        const month = new Date(g.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        byMonth[month] = (byMonth[month] || 0) + 1;
      });

      return { total, byCategory, byStatus, byMonth, anonymousCount, identifiedCount: total - anonymousCount, grievances };
    },
  });
}
