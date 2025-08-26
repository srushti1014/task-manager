"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Edit, Trash2, CheckSquare, Clock } from "lucide-react";
import { TagWithStats } from "@/lib/types";

interface TagCardProps {
  tag: TagWithStats;
  onEdit: (tag: TagWithStats) => void;
  onDelete: (tagId: string) => void;
}

export function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 border-0 rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: tag.color }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold truncate text-gray-900 dark:text-white">
                {tag.name}
              </CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-lg shadow-lg border dark:border-gray-700"
            >
              <DropdownMenuItem
                onClick={() => onEdit(tag)}
                className="cursor-pointer flex items-center px-3 py-2.5 text-sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer flex items-center px-3 py-2.5 text-sm text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Task Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="p-1.5 bg-green-100 dark:bg-green-800/40 rounded-full">
              <CheckSquare className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {tag.completedTasks}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Done</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-800/40 rounded-full">
              <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {tag.pendingTasks}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Todo</div>
            </div>
          </div>
        </div>

        {/* Progress Bar (commented out but improved) */}
        {/* {tag.taskCount > 0 && (
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500" 
            style={{ 
              width: `${completionRate}%`,
              backgroundColor: tag.color 
            }}
          ></div>
        </div>
      </div>
    )} */}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-1 font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0"
          >
            {tag.taskCount} Tasks
          </Badge>
          <span className="text-xs text-muted-foreground">
            Created{" "}
            {new Date(tag.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Tag
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium" style={{ color: tag.color }}>
                {tag.name}
              </span>
              ? This action cannot be undone.
              <span className="block mt-3 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg text-sm">
                Warning: This tag is used in {tag.taskCount} tasks. Deleting it
                will remove the tag from all tasks.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-row-reverse gap-2">
            <AlertDialogCancel className="mt-0 rounded-lg border-gray-300 dark:border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(tag.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 text-white hover:bg-red-700 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
