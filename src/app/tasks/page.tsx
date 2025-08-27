"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { Task, Category, Tag, Status } from "@/lib/types";
import axios from "axios";
import { toast } from "react-toastify";
import Taskcard from "@/components/Taskcard";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { Plus, Search, Filter, X } from "lucide-react";

interface TaskFilters {
  status: string;
  priority: string;
  categoryId: string;
  tags: string[];
  search: string;
  fromDate: string;
  toDate: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // const [filterLoading, setFilterLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    categoryId: "all",
    tags: [],
    search: "",
    fromDate: "",
    toDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchTags()]);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    }
    loadData();
  }, [filters]);

  // ------------------ Fetchers ------------------
  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.priority !== "all")
        params.append("priority", filters.priority);
      if (filters.categoryId !== "all")
        params.append("categoryId", filters.categoryId);
      if (filters.tags.length > 0)
        params.append("tags", filters.tags.join(","));
      if (filters.search) params.append("search", filters.search);
      if (filters.fromDate) params.append("fromDate", filters.fromDate);
      if (filters.toDate) params.append("toDate", filters.toDate);

      const { data } = await axios.get(`/api/tasks?${params.toString()}`);
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
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const payload = {
        ...taskToUpdate,
        status: newStatus,
        tagIds: taskToUpdate.tags.map((t) => t.tag.id),
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

  const handleFilterChange = (
    key: keyof TaskFilters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      categoryId: "all",
      tags: [],
      search: "",
      fromDate: "",
      toDate: "",
    });
    setSearchTerm("");
    setSelectedTags([]);
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.categoryId !== "all" ||
    filters.tags.length > 0 ||
    filters.search ||
    filters.fromDate ||
    filters.toDate;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => setTaskFormOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter Tasks</CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status, Priority, Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) =>
                    handleFilterChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    handleFilterChange("categoryId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-4 p-4 bg-[#0E1216]">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    className="pl-10"
                    placeholder="Search By Title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={
                          selectedTags.includes(tag.name) ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleTagToggle(tag.name)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <button
              className="py-1.5 px-2 bg-gray-200 text-black rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-500 hover:text-white transition-all duration-300"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    search: searchTerm,
                    tags: selectedTags,
                  }))
                }
              >
                Apply Search or tag
              </button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">Due Date From</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    handleFilterChange("fromDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">Due Date To</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange("toDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
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
          </div>
        )}
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
    </div>
  );
}

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { TaskForm } from "@/components/task-form";
// import type { Task, Category, Tag, Status } from "@/lib/types";
// import axios from "axios";
// import { toast } from "react-toastify";
// import Taskcard from "@/components/Taskcard";
// import EmptyState from "@/components/EmptyState";
// import Loader from "@/components/Loader";
// import { Plus } from "lucide-react";

// export default function TasksPage() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [taskFormOpen, setTaskFormOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | undefined>();
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadData() {
//     setLoading(true);
//     await Promise.all([fetchTasks(), fetchCategories(), fetchTags()]);
//     setLoading(false);
//   }
//   loadData();
//   }, []);

//   // ------------------ Fetchers ------------------
//   const fetchTasks = async () => {
//     try {
//       const { data } = await axios.get("/api/tasks");
//       console.log("Tasks : ", data);
//       if (data.success) {
//         setTasks(data.data);
//       } else {
//         setTasks([]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch tasks:", error);
//       setTasks([]);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await axios.get("/api/categories");
//       if (data.success) {
//         setCategories(data.data);
//       } else {
//         setCategories([]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//       setCategories([]);
//     }
//   };

//   const fetchTags = async () => {
//     try {
//       const { data } = await axios.get("/api/tags");
//       if (data.success) {
//         setTags(data.data);
//       } else {
//         setTags([]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch tags:", error);
//       setTags([]);
//     }
//   };

//   // ------------------ Tasks CRUD ------------------

//   const handleCreateTask = async (taskData: Task) => {
//     try {
//       const { data } = await axios.post("/api/tasks", taskData);
//       if (data.success) {
//         fetchTasks();
//         setTaskFormOpen(false);
//         toast.success("Task created successfully");
//       }
//     } catch (error) {
//       console.error("Failed to create task:", error);
//       toast.error("Failed to create task");
//     }
//   };

//   const handleUpdateTask = async (taskData: Task) => {
//     if (!editingTask) return;
//     try {
//       const { data } = await axios.put(
//         `/api/tasks/${editingTask.id}`,
//         taskData
//       );
//       if (data.success) {
//         fetchTasks();
//         setTaskFormOpen(false);
//         setEditingTask(undefined);
//         toast.success("Task updated successfully");
//       }
//     } catch (error) {
//       console.error("Failed to update task:", error);
//       toast.error("Failed to update task");
//     }
//   };

//   const handleDeleteTask = async (id: string) => {
//     try {
//       const { data } = await axios.delete(`/api/tasks/${id}`);
//       if (data.success) {
//         fetchTasks();
//         toast.success("Task deleted successfully");
//       }
//     } catch (error) {
//       console.error("Failed to delete task:", error);
//       toast.error("Failed to delete task");
//     }
//   };

//   const handleStatusChange = async (taskId: string, newStatus: Status) => {
//     try {
//       const taskToUpdate = tasks.find((task) => task.id === taskId);
//       if (!taskToUpdate) return;

//       const payload = {
//         ...taskToUpdate,
//         status: newStatus,
//         tagIds: taskToUpdate.tags.map((t) => t.tag.id)
//       };

//       const { data } = await axios.put(`/api/tasks/${taskId}`, payload);
//       if (data.success) {
//         setTasks((prevTasks) =>
//           prevTasks.map((task) =>
//             task.id === taskId ? { ...task, status: newStatus } : task
//           )
//         );
//         toast.success("Status updated successfully");
//       }
//     } catch (error) {
//       console.error("Failed to change task status:", error);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleDeleteClick = useCallback((id: string) => {
//     setTaskToDelete(id);
//     setDeleteDialogOpen(true);
//   }, []);

//   const handleEditingTask = useCallback((task: Task) => {
//     setEditingTask(task)
//     setTaskFormOpen(true);
//   }, []);

//   if(loading) return <Loader/>

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Tasks</h1>
//           <p className="text-muted-foreground">
//             Manage your tasks and track progress
//           </p>
//         </div>
//         <Button
//           onClick={() => setTaskFormOpen(true)}
//           className="bg-primary hover:bg-primary/90"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add Task
//         </Button>
//       </div>

//       {/* Task Cards */}
//       <div className="space-y-4">
//         {tasks.length === 0 ? (
//           <EmptyState />
//         ) : (
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//             {tasks.map((task) => {
//               return (
//                 <Taskcard
//                   key={task.id}
//                   task={task}
//                   onEdit={handleEditingTask}
//                   onStatusChange={handleStatusChange}
//                   onDelete={handleDeleteClick}
//                 />
//               );
//             })}
//             <AlertDialog
//               open={deleteDialogOpen}
//               onOpenChange={setDeleteDialogOpen}
//             >
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This action cannot be undone. This will permanently delete
//                     the task{" "}
//                     {taskToDelete &&
//                       tasks.find((t) => t.id === taskToDelete)?.title}
//                     .
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction
//                     onClick={() => {
//                       if (taskToDelete) {
//                         handleDeleteTask(taskToDelete);
//                       }
//                       setDeleteDialogOpen(false);
//                     }}
//                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                   >
//                     Delete
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           </div>
//         )}
//       </div>

//       <TaskForm
//         task={editingTask}
//         isOpen={taskFormOpen}
//         onClose={() => {
//           setTaskFormOpen(false);
//           setEditingTask(undefined);
//         }}
//         onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
//         categories={categories}
//         tags={tags}
//       />
//     </div>
//   );
// }
