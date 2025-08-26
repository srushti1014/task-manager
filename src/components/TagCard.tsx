"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, CheckSquare, Clock } from "lucide-react"
import { TagWithStats } from "@/lib/types"

interface TagCardProps {
  tag: TagWithStats
  onEdit: (tag: TagWithStats) => void
  onDelete: (tagId: string) => void
}

export function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const completionRate = tag.taskCount > 0 ? Math.round((tag.completedTasks / tag.taskCount) * 100) : 0
  const pendingTasks = tag.taskCount - tag.completedTasks

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{tag.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs mt-1">{tag.description}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(tag)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Task Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-3 w-3 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">{tag.completedTasks}</div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">{pendingTasks}</div>
              <div className="text-xs text-muted-foreground">Todo</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {tag.taskCount > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {tag.taskCount} {tag.taskCount === 1 ? "task" : "tasks"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(tag.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {tag.name} ? This action cannot be undone.
              {tag.taskCount > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This tag is used in {tag.taskCount} tasks. Deleting it will remove the tag from all tasks.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(tag.id)
                setShowDeleteDialog(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
