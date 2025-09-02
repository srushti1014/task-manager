export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED"
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskTag {
  id: string         
  taskId: string
  tagId: string
  tag: Tag        
}

export interface TaskCategory {
  id: string         
  taskId: string
  categoryId: string
  category: Category        
}

export interface TaskPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageCollaborators: boolean;
  role: "OWNER" | "EDITOR" | "VIEWER" | null;
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate?: Date
  priority: string
  status: Status
  createdAt: Date
  updatedAt: Date
  userId: string
  categoryId?: string
  taskCategories?: TaskCategory[]
  taskTags: TaskTag[]
  permissions?: TaskPermissions
  user?: {
    id: string;
    name?: string;
    email?: string;
  }
  collaborators?: Array<{
    userId: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
    user: {
      id: string;
      name?: string;
      email?: string;
    }
  }>
  currentUserRole?: string;
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface User {
  id: string
  name?: string
  email?: string
  image?: string
}

export type TagWithStats = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  taskCount: number;
  completedTasks: number;
  description?: string;
  pendingTasks: number;
};

export type CateWithStats = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  taskCount: number;
  completedTasks: number;
  description?: string;
  pendingTasks: number;
}
