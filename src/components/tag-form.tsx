"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Tag } from "@/lib/types";

interface TagFormProps {
  tag?: Tag;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tagData: { name: string; color: string }) => void;
}

export function TagForm({ tag, isOpen, onClose, onSubmit }: TagFormProps) {
  const [loading, setLoading] = useState(false);
  const colorOptions = [
    "#10b981", // Emerald green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#84cc16", // Lime green
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#f43f5e", // Rose
    "#7c3aed", // Violet
    "#0ea5e9", // Sky blue
    "#22c55e", // Green
    "#eab308", // Yellow
  ];

  const [formData, setFormData] = useState({ name: "", color: "#3b82f6" });

  useEffect(() => {
    setFormData({
      name: tag?.name ?? "",
      color: tag?.color ?? "#3b82f6",
    });
  }, [tag, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tag ? "Edit Tag" : "Create Tag"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-3">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Color</Label>
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: formData.color }}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formData.name || "Tag Name"}
                </span>
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition ${formData.color === color
                      ? "border-foreground shadow-md"
                      : "border-border"
                    }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
            {/* Custom Color Input */}
            <div className="space-y-2">
              <Label htmlFor="custom-color" className="text-sm">
                Custom Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Loading..." : tag ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
