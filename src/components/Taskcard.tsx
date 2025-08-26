"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import type { Task, Status } from "@/lib/types";
import { cn } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";
import React from "react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Status) => void;
  onDelete: (taskId: string) => void;
}

const Taskcard = ({
  task,
  onEdit,
  onStatusChange,
  onDelete,
}: TaskCardProps) => {
  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "COMPLETED":
        return CheckCircle;
      case "IN_PROGRESS":
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "PENDING":
        return "text-amber-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-200 text-red-800 border-red-200 hover:bg-red-200";
      case "MEDIUM":
        return "bg-amber-200 text-amber-800 border-amber-200 hover:bg-amber-200";
      case "LOW":
        return "bg-blue-200 text-blue-800 border-blue-200 hover:bg-blue-200";
      default:
        return "bg-gray-200 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  const StatusIcon = getStatusIcon(task.status);

  return (
    <Card
      key={task.id}
      className="hover:shadow-lg transition-all duration-300 border-border/40 hover:border-border/80 group"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon
              className={cn("h-4 w-4", getStatusColor(task.status))}
            />
            <Badge
              variant="outline"
              className={`text-xs font-bold ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity hover:bg-accent/50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-lg shadow-lg border-border/50"
            >
              {/* Edit Option */}
              <DropdownMenuItem
                className="flex items-center cursor-pointer px-3 py-2.5 rounded-md focus:bg-accent/50"
                onClick={() => {
                  onEdit(task);
                }}
              >
                <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Edit Task</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/30" />

              {/* Status Options */}
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                Change Status
              </div>
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "PENDING")}
                disabled={task.status === "PENDING"}
                className="flex items-center cursor-pointer px-3 py-2.5 rounded-md focus:bg-accent/50 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                <PauseCircle className="mr-2 h-4 w-4 text-amber-500" />
                <span className="text-sm">Mark as Pending</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                disabled={task.status === "IN_PROGRESS"}
                className="flex items-center cursor-pointer px-3 py-2.5 rounded-md focus:bg-accent/50 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-sm">Mark as In Progress</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(task.id, "COMPLETED")}
                disabled={task.status === "COMPLETED"}
                className="flex items-center cursor-pointer px-3 py-2.5 rounded-md focus:bg-accent/50 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm">Mark as Completed</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border/30" />

              {/* Delete Option */}
              <DropdownMenuItem
                className="flex items-center cursor-pointer px-3 py-2.5 rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => {
                  onDelete(task.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="text-sm">Delete Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/*Category*/}
        <div className="flex flex-wrap gap-2">
          {task.category && (
            <Badge
              variant="outline"
              style={{ borderColor: task.category.color }}
            >
              {task.category.name}
            </Badge>
          )}
        </div>

        {/* Tags */}
        <div>
          {task.tags.length > 0 && (
            <div>
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs mr-2"
                  style={{ borderColor: tag.tag.color }}
                >
                  {tag.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{70}%</span>
          </div>
          <Progress.Root
            value={70}
            className="relative overflow-hidden bg-secondary rounded-full w-full h-2"
          >
            <Progress.Indicator
              className="bg-primary w-full h-full transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${100 - 70}%)` }}
            />
          </Progress.Root>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Taskcard;
