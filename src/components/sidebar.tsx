"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  FolderOpen,
  Tag,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users } from "lucide-react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); 
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    {
      id: "collab",
      label: "Collaborate",
      icon: Users,
      href: "/collab",
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden h-full"
          onClick={handleOverlayClick}
          style={{ touchAction: "none" }} 
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
           <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <div key={item.id} className="py-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 w-full h-12 px-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed && !isMobile && "justify-center px-2"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(!isCollapsed || isMobile) && (
                      <span className="flex-1 text-left text-base truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Mobile menu button - Only show when sidebar is completely hidden */}
      {isCollapsed && isMobile && (
        <button
          className="fixed top-7 left-3 z-50 lg:hidden h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center"
          onClick={() => setIsCollapsed(false)}
        >
          <Menu className="w-4 h-4 text-white" />
        </button>
      )}

    </>
  );
}
