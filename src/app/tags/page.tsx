/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagForm } from "@/components/tag-form";
import {  Plus, Tag as TagIcon, Search } from "lucide-react";
import { Tag, TagWithStats } from "@/lib/types";
import axios from "axios";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { TagCard } from "@/components/tag-card";
import Loader from "@/components/Loader";

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithStats[]>([]);
  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchTags();
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchTags = async () => {
    try {
      const { data } = await axios.get("/api/tags");
      console.log(data);
      setTags(data.success ? data.data : []);
    } catch (err) {
      console.error(err);
      setTags([]);
    }
  };

  const handleCreateTag = async (tagData: { name: string; color: string }) => {
    try {
      const { data } = await axios.post("/api/tags", tagData);
      if (data.success) {
        fetchTags();
        setTagFormOpen(false);
        toast.success("Tag created!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

  const handleUpdateTag = async (tagData: { name: string; color: string }) => {
    if (!editingTag) return;
    try {
      await axios.put(`/api/tags/${editingTag.id}`, tagData);
      fetchTags();
      setTagFormOpen(false);
      setEditingTag(undefined);
      toast.success("Tag updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await axios.delete(`/api/tags/${id}`);
      fetchTags();
      toast.success("Tag deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete tag");
    }
  };

  const handleEditingTag = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setTagFormOpen(true);
  }, []);

  const totalTasks = tags.reduce((sum, tag) => sum + tag.taskCount, 0);
  const totalCompleted = tags.reduce((sum, tag) => sum + tag.completedTasks, 0);
  const averageTasksPerTag =
    tags.length > 0 ? Math.round(totalTasks / tags.length) : 0;

  if (loading) return <Loader />;

  return (
    <div className="">
      <main className="p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
              <p className="text-muted-foreground">
                Label and organize your tasks with custom tags
              </p>
            </div>
            <Button
              onClick={() => setTagFormOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Tag
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tags
                </CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
                <p className="text-xs text-muted-foreground">Active tags</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tagged Tasks
                </CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">Across all tags</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalTasks > 0
                    ? Math.round((totalCompleted / totalTasks) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalCompleted} of {totalTasks} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Tasks/Tag
                </CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageTasksPerTag}</div>
                <p className="text-xs text-muted-foreground">Average usage</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {filteredTags.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <TagIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium mt-4">No tags found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Get started by creating your first tag"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tag
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredTags.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEditingTag}
                  onDelete={handleDeleteTag}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <TagForm
        tag={editingTag}
        isOpen={tagFormOpen}
        onClose={() => {
          setTagFormOpen(false);
          setEditingTag(undefined);
        }}
        onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
      />
    </div>
  );
}
