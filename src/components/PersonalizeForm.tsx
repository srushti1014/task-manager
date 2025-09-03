"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import type { Category, Tag } from "@/lib/types";
import Loader from "./Loader";

interface PersonalizeFormProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalizeForm({
  taskId,
  isOpen,
  onClose,
}: PersonalizeFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categoryId, setCategoryId] = useState<string>("none");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initloading, setInitLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    boot();
  }, [isOpen, taskId]);

  const boot = async () => {
    setInitLoading(true);
    try {
      const [cateRes, tagRes, meRes] = await Promise.all([
        axios.get("/api/categories"),
        axios.get("/api/tags"),
        axios.get(`/api/tasks/${taskId}/personalize`),
      ]);
      console.log("tags", tagRes);
      if (cateRes.data.success) setCategories(cateRes.data.data);
      if (tagRes.data.success) setTags(tagRes.data.data);
      if (meRes.data.success) {
        const { categoryIds, tagIds: meTagIds } = meRes.data.data;
        setCategoryId(categoryIds?.[0] ?? "none");
        setTagIds(meTagIds ?? []);
      }
    } finally {
      setInitLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/tasks/${taskId}/personalize`, {
        tagIds,
        categoryId,
      });
      onClose();
      boot()
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {initloading || loading ? (
          <div className="p-10 bg-black">
            <Loader />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Personalize for me</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>My Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories &&
                      categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>My Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags &&
                    tags.map((t) => (
                      <Button
                        key={t.id}
                        type="button"
                        variant={tagIds.includes(t.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(t.id)}
                      >
                        {t.name}
                      </Button>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
