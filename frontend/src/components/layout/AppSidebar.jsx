import { LayoutDashboard, Users, Fuel, ClipboardList, Receipt, CreditCard, BarChart3, Settings, LogOut, Warehouse, Droplet } from 'lucide-react';
import { NavLink } from '../NavLink';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';
import { Button } from '../ui/button';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Pumps', url: '/pumps', icon: Fuel },
  { title: 'Daily Shift', url: '/daily-entries', icon: ClipboardList },
  { title: 'Inventory', url: '/tanks', icon: Warehouse },
];

const billingNavItems = [
  { title: 'Fuel Prices', url: '/prices', icon: Settings },
  { title: 'Fuel Types', url: '/products', icon: Droplet },
  { title: 'Shift Settlements', url: '/settlements', icon: Receipt },
  { title: 'Customer Payments', url: '/payments', icon: CreditCard },
  { title: 'Credit Customers', url: '/customers', icon: Users },
];

const reportNavItems = [
  { title: 'Reports', url: '/reports', icon: BarChart3 },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">
            <img src="/logo.png" alt="PetroManager Logo" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-sidebar-foreground">PetroManager</span>
              <span className="text-xs text-sidebar-foreground/60">Station Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-xs tracking-wider uppercase text-sidebar-foreground/50">
            {!isCollapsed && 'Main'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3 mb-2 text-xs tracking-wider uppercase text-sidebar-foreground/50">
            {!isCollapsed && 'Billing'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {billingNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-3 mb-2 text-xs tracking-wider uppercase text-sidebar-foreground/50">
            {!isCollapsed && 'Analytics'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center text-sm font-medium rounded-full h-9 w-9 bg-sidebar-primary/20 text-sidebar-primary">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">{user?.name || 'User'}</span>
              <span className="text-xs capitalize text-sidebar-foreground/60">{user.role}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            isCollapsed && 'justify-center px-2'
          )}
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
