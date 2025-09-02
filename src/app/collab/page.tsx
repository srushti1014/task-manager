"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Taskcard from "@/components/Taskcard";
import { Category, Status, Tag, Task } from "@/lib/types";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";
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
import { TaskForm } from "@/components/task-form";

export default function CollabsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCollabs();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCollabs = async () => {
    try {
      const res = await axios.get("/api/collab");
      setTasks(res.data.data || []);
      console.log("collab: ", res.data.data);
    } catch (err) {
      console.error("Error fetching collab tasks:", err);
    } finally {
      setLoading(false);
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
        setTaskFormOpen(false);
        toast.success("Task created successfully");
      }
      fetchCollabs();
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
        setTaskFormOpen(false);
        setEditingTask(undefined);
        toast.success("Task updated successfully");
      }
      fetchCollabs()
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { data } = await axios.delete(`/api/tasks/${id}`);
      if (data.success) {
        toast.success("Task deleted successfully");
      }
      fetchCollabs()
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const payload = {
        ...taskToUpdate,
        status: newStatus,
        tagIds: taskToUpdate.taskTags.map((t) => t.tag.id),
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
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  if (loading) return <Loader />;
  if (!tasks.length) return <p>No collaboration tasks yet.</p>;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
        {tasks.map((task) => (
          <Taskcard
            key={task.id}
            task={task}
            onEdit={handleEditingTask}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task{" "}
              {taskToDelete && tasks.find((t) => t.id === taskToDelete)?.title}.
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
    </>
  );
}
