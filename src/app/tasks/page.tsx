"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskForm } from "@/components/task-form";
import {
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronsUpDown,
  Check,
  CalendarIcon,
} from "lucide-react";
import type { Task, Category, Tag, Status } from "@/lib/types";
import axios from "axios";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import Taskcard from "@/components/Taskcard";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
    setLoading(true);
    await Promise.all([fetchTasks(), fetchCategories(), fetchTags()]);
    setLoading(false);
  }
  loadData();
  }, []);

  // ------------------ Fetchers ------------------
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get("/api/tasks");
      console.log("Tasks : ", data);
      if (data.success) {
        setTasks(data.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories");
      if (data.success) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await axios.get("/api/tags");
      if (data.success) {
        setTags(data.data);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setTags([]);
    }
  };

  // ------------------ Tasks CRUD ------------------

  const handleCreateTask = async (taskData: Task) => {
    try {
      const { data } = await axios.post("/api/tasks", taskData);
      if (data.success) {
        fetchTasks();
        setTaskFormOpen(false);
        toast.success("Task created successfully");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (taskData: Task) => {
    if (!editingTask) return;
    try {
      const { data } = await axios.put(
        `/api/tasks/${editingTask.id}`,
        taskData
      );
      if (data.success) {
        fetchTasks();
        setTaskFormOpen(false);
        setEditingTask(undefined);
        toast.success("Task updated successfully");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { data } = await axios.delete(`/api/tasks/${id}`);
      if (data.success) {
        fetchTasks();
        toast.success("Task deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    try {
      // Find the task to update
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const payload = {
        ...taskToUpdate,
        status: newStatus,
        tagIds: taskToUpdate.tags.map((t) => t.tag.id)
      };

      const { data } = await axios.put(`/api/tasks/${taskId}`, payload);
      if (data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Failed to change task status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteClick = useCallback((id: string) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleEditingTask = useCallback((task: Task) => {
    setEditingTask(task)
    setTaskFormOpen(true);
  }, []);


  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (categoryFilter !== "all" && task.categoryId !== categoryFilter)
      return false;
    return true;
  });

  if(loading) return <Loader/> 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track progress
          </p>
        </div>
        <Button
          onClick={() => setTaskFormOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
              return (
                <Taskcard
                  key={task.id}
                  task={task}
                  onEdit={handleEditingTask}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteClick}
                />
              );
            })}
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the task{" "}
                    {taskToDelete &&
                      tasks.find((t) => t.id === taskToDelete)?.title}
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (taskToDelete) {
                        handleDeleteTask(taskToDelete);
                      }
                      setDeleteDialogOpen(false);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <TaskForm
        task={editingTask}
        isOpen={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
