"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Category } from "@/lib/types"
import Loader from "./Loader"

interface CategoryFormProps {
  category?: Category
  isOpen: boolean
  onClose: () => void
  onSubmit: (categoryData: { name: string }) => Promise<void> | void
}

export function CategoryForm({ category, isOpen, onClose, onSubmit }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)

  const colorOptions = [
    "#4b5563", // Gray-600
    "#059669", // Emerald-600
    "#dc2626", // Red-600
    "#2563eb", // Blue-600
    "#7c3aed", // Violet-600
    "#db2777", // Pink-600
    "#0891b2", // Cyan-600
    "#ea580c", // Orange-600
    "#65a30d", // Lime-600
    "#4f46e5", // Indigo-600
    "#0d9488", // Teal-600
    "#b45309", // Amber-600
    "#4338ca", // Indigo-700
    "#0369a1", // Blue-700
    "#15803d", // Green-700
    "#be185d", // Pink-700
  ];

  const [formData, setFormData] = useState({ name: "", color: "#3b82f6" });

  useEffect(() => {
    setFormData({
      name: category?.name ?? "",
      color: category?.color ?? "#3b82f6",
    });
  }, [category, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setLoading(true)
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Error submitting category:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader /></div>

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
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
              {loading ? "Saving..." : category ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
