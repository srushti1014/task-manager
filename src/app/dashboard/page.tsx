"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  StickyNoteIcon,
  RefreshCw,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import type { Task } from "@/lib/types";
import Loader from "@/components/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  highPriority: number;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (showToast = false) => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch(
        "/api/tasks?limit=100&sortBy=dueDate&sortOrder=asc"
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setTasks(result.data);
        if (showToast) {
          toast.success("Tasks refreshed successfully");
        }
      } else {
        setTasks([]);
        setError("Failed to load tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTaskStats = (): TaskStats => {
    const now = new Date();

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now
      ).length,
      highPriority: tasks.filter((t) => t.priority === "HIGH").length,
    };
  };

  const getCompletionRate = (): number => {
    if (tasks.length === 0) return 0;
    return Math.round((getTaskStats().completed / tasks.length) * 100);
  };

  const getRecentTasks = () => {
    return tasks
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <StickyNoteIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "No due date";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const handleRefresh = () => {
    fetchTasks(true);
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Loading..." : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();
  const completionRate = getCompletionRate();
  const recentTasks = getRecentTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your tasks and productivity
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <StickyNoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue > 0 && `${stats.overdue} overdue`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">Urgent tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Card */}
      <Card className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black/20 z-0"></div>

        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Productivity Score</h3>
              <p className="text-3xl font-bold">{completionRate}%</p>
              <p className="text-sm opacity-90">
                {completionRate >= 75
                  ? "Excellent progress!"
                  : completionRate >= 50
                  ? "Good work, keep going!"
                  : "Let's get started!"}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-90" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNoteIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="capitalize">
                          {task.status.toLowerCase().replace("_", " ")}
                        </span>
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
