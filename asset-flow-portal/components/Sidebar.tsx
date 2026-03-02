"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLogoutMutation } from '@/store/auth/authApiSlice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  MapPin,
  ChevronDown,
  Folder,
  GitBranch,
  LogOut,
  Users
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    subItems: [
      {
        title: 'Locations',
        href: '/settings/locations',
        icon: MapPin,
      },
      {
        title: 'Categories',
        href: '/settings/categories',
        icon: Folder,
      },
      {
        title: 'Organization',
        href: '/settings/organization',
        icon: GitBranch,
      },
      {
        title: 'Employees',
        href: '/settings/employees',
        icon: Users,
      },
    ],
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Settings']);
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed', err);
      router.push('/login');
    }
  };

  const toggleSubmenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.title);
    const Icon = item.icon;

    if (hasSubItems) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleSubmenu(item.title)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? item.title : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </>
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
              {item.subItems!.map((subItem) => renderNavItem(subItem, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          isCollapsed && "justify-center px-2",
          isSubItem && "py-2"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon className={cn("flex-shrink-0", isSubItem ? "h-4 w-4" : "h-5 w-5")} />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 border-b border-border px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full flex items-center justify-start gap-3 transition-colors",
            "text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            © 2026 Chonghua Asset Management System
          </p>
        )}
      </div>
    </aside>
  );
}
