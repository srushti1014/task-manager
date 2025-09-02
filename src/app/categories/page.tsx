/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/category-form";
import {
  Edit,
  Trash2,
  Plus,
  FolderOpen,
  CheckSquare,
  Clock,
} from "lucide-react";
import type { Category, CateWithStats } from "@/lib/types";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CateWithStats[]>([]);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      const result = response.data;
      console.log("cate: ", result);
      if (result.success) {
        setCategories(result.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Create Category
  const handleCreateCategory = async (categoryData: { name: string }) => {
    try {
      const response = await axios.post("/api/categories", categoryData);
      const result = response.data;

      if (result.success) {
        toast.success("Category created successfully");
        fetchCategories();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating category");
      console.error("Error creating category:", error);
    }
  };

  // Update Category
  const handleUpdateCategory = async (categoryData: { name: string }) => {
    if (!editingCategory) return;
    try {
      await axios.put(`/api/categories/${editingCategory.id}`, categoryData);
      toast.success("Category updated successfully");
      fetchCategories();
      setCategoryFormOpen(false);
      setEditingCategory(undefined);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating category");
      console.error("Error updating category:", error);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting category");
      console.error("Error deleting category:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your tasks with categories
          </p>
        </div>

        <Button
          onClick={() => setCategoryFormOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {categories.length === 0 ? (
          <Card className="p-8 text-center col-span-full">
            <div className="text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p>Create your first category to get started</p>
            </div>
          </Card>
        ) : (
          categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-all duration-300 border-0 rounded-2xl overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-md border-2 border-white dark:border-gray-700"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                      {category.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryFormOpen(true);
                      }}
                      className="h-9 w-9 p-0 rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-9 w-9 p-0 rounded-full  text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 border-gray-300 dark:border-gray-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Task Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-800/40 rounded-full">
                      <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.completedTasks}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Completed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                    <div className="p-2 bg-sky-100 dark:bg-sky-800/40 rounded-full">
                      <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.pendingTasks}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Pending
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (commented out but improved) */}
                {/* {category.taskCount > 0 && (
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full transition-all duration-700" 
            style={{ 
              width: `${completionRate}%`,
              backgroundColor: category.color 
            }}
          ></div>
        </div>
      </div>
    )} */}

                {/* Task Count Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Badge
                    variant="outline"
                    className="text-xs px-3 py-1.5 font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 rounded-lg"
                  >
                    {category.taskCount}{" "}
                    {category.taskCount === 1 ? "task" : "tasks"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Created{" "}
                    {new Date(category.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CategoryForm
        category={editingCategory}
        isOpen={categoryFormOpen}
        onClose={() => {
          setCategoryFormOpen(false);
          setEditingCategory(undefined);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
      />
    </div>
  );
}
