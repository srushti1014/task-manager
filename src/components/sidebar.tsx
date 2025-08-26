"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  FolderOpen,
  Tag,
  Menu,
  X,
  Settings,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  taskCounts?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function Sidebar({
  taskCounts = { total: 0, pending: 0, inProgress: 0, completed: 0 },
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [pathname, isMobile]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      href: "/tasks",
      count: taskCounts.total,
    },
    {
      id: "categories",
      label: "Categories",
      icon: FolderOpen,
      href: "/categories",
    },
    {
      id: "tags",
      label: "Tags",
      icon: Tag,
      href: "/tags",
    },
  ];

  const taskStats = [
    {
      label: "Pending",
      count: taskCounts.pending,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "In Progress",
      count: taskCounts.inProgress,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Completed",
      count: taskCounts.completed,
      color: "bg-green-100 text-green-800",
    },
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile overlay with better styling */}
      {!isCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={handleOverlayClick}
          style={{ touchAction: "none" }} // Prevent scrolling when overlay is visible
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          isCollapsed && isMobile ? "-translate-x-full" : "translate-x-0",
          isCollapsed && !isMobile ? "w-16" : "w-64",
          "lg:relative lg:translate-x-0 lg:z-auto"
        )}
        style={{
          // Prevent mobile address bar issues
          height: isMobile ? "100dvh" : "100vh",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {(!isCollapsed || isMobile) && (
              <h1 className="text-xl font-bold text-sidebar-foreground">
                TaskFlow
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent min-h-10 min-w-10"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <div key={item.id} className="space-y-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 w-full h-12 px-3 rounded transition-colors duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed && !isMobile && "justify-center px-2"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="flex-1 text-left text-base">
                          {item.label}
                        </span>
                        {item.count !== undefined && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Task Statistics - Only show when not collapsed */}
          {(!isCollapsed || isMobile) && pathname === "/tasks" && (
            <div className="p-4 border-t border-sidebar-border">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
                Task Overview
              </h3>
              <div className="space-y-2">
                {taskStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-sidebar-muted-foreground">
                      {stat.label}
                    </span>
                    <Badge className={stat.color}>{stat.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && !isMobile && "justify-center px-2"
              )}
            >
              <Settings className="w-5 h-5" />
              {(!isCollapsed || isMobile) && (
                <span className="text-base">Settings</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button - Only show when sidebar is completely hidden */}
      {isCollapsed && isMobile && (
        <button
          className="fixed top-3 left-3 z-40 lg:hidden h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center"
          onClick={() => setIsCollapsed(false)}
        >
          <Menu className="w-4 h-4 text-white" />
        </button>
      )}
    </>
  );
}
