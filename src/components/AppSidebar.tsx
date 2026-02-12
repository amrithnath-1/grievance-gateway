import { LayoutDashboard, FileText, BarChart3, LogOut, Search } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Grievances', url: '/grievances', icon: FileText },
  { title: 'Search', url: '/search', icon: Search },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();

  return (
    <Sidebar>
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="font-display text-lg font-bold text-sidebar-primary-foreground">DDGRS</h1>
        <p className="text-xs text-sidebar-foreground/60">Grievance Redressal System</p>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/'} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="text-xs text-sidebar-foreground/60 mb-2 truncate">{user?.email}</div>
        <SidebarMenuButton onClick={signOut} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
