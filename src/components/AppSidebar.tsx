import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Users, UserPlus, Search, ClipboardList, Eye, AlertTriangle,
  PlusCircle, BookOpen, Trophy, FileText, Clock, FolderPlus, Folder,
  ScrollText, Settings, LogOut, UserCheck,
} from 'lucide-react';

const menuSections = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    ],
  },
  {
    label: 'Students',
    items: [
      { title: 'All Students', url: '/students', icon: Users, roles: ['admin', 'teacher'] },
      { title: 'Add Student', url: '/students/add', icon: UserPlus, roles: ['admin'] },
      { title: 'Search Student', url: '/students/search', icon: Search, roles: ['admin', 'teacher'] },
      { title: 'Registration Queue', url: '/registration', icon: UserCheck, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { title: 'Record Attendance', url: '/attendance/record', icon: ClipboardList, roles: ['admin', 'teacher'] },
      { title: 'View Attendance', url: '/attendance/view', icon: Eye, roles: ['admin', 'teacher', 'student'] },
      { title: 'Low Attendance', url: '/attendance/low', icon: AlertTriangle, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { title: 'Add Score', url: '/academics/add', icon: PlusCircle, roles: ['admin', 'teacher'] },
      { title: 'View Academics', url: '/academics/view', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
      { title: 'Top Performers', url: '/academics/toppers', icon: Trophy, roles: ['admin', 'teacher', 'student'] },
      { title: 'Scholarship Heap', url: '/academics/scholarship', icon: Trophy, roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Submit Leave', url: '/leaves/submit', icon: FileText, roles: ['admin', 'teacher', 'student'] },
      { title: 'Pending Leaves', url: '/leaves/view', icon: Clock, roles: ['admin', 'teacher', 'student'] },
      { title: 'Add Document', url: '/documents/add', icon: FolderPlus, roles: ['admin', 'teacher', 'student'] },
      { title: 'View Documents', url: '/documents/view', icon: Folder, roles: ['admin', 'teacher', 'student'] },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Report Cards', url: '/reports', icon: FileText, roles: ['admin', 'teacher'] },
      { title: 'Memory Allocation', url: '/memory', icon: LayoutDashboard, roles: ['admin'] },
      { title: 'BST View', url: '/bst', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
      { title: 'System Logs', url: '/logs', icon: ScrollText, roles: ['admin'] },
      { title: 'Settings', url: '/settings', icon: Settings, roles: ['admin', 'teacher', 'student'] },
    ],
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const role = user?.role || 'student';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-primary">📚 EduTrack Pro</h2>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{role} Panel</p>
          </div>
        )}
        {menuSections.map(section => {
          const visible = section.items.filter(i => i.roles.includes(role));
          if (visible.length === 0) return null;
          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map(item => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === '/'}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                        >
                          <item.icon className="mr-2 h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-2 px-1">
            <p className="text-sm font-medium text-foreground capitalize">{user.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}{user.studentId ? ` (${user.studentId})` : ''}</p>
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Logout'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
