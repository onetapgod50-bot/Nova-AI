export type Role = "engineer" | "manager" | "supervisor";

export type ProjectStatus = "planning" | "active" | "delayed" | "completed";
export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "delayed"
  | "on_hold";
export type RequestStatus = "pending" | "approved" | "rejected" | "modified";
export type NotificationType =
  | "progress"
  | "task"
  | "resource"
  | "milestone"
  | "delay"
  | "system";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — plain text, replace with hashing before production
  role: Role;
  title?: string;
  avatarColor: string;
}

export interface Project {
  id: string;
  name: string;
  employer: string;
  location: string;
  landArea: string;
  gpsLocation: string;
  projectType: string;
  description: string;
  requiredInfrastructure: string;
  startDate: string;
  expectedCompletion: string;
  budget: number;
  requiredWorkers: number;
  otherRequirements?: string;
  status: ProjectStatus;
  overallProgress: number;
  engineerId: string;
  managerId?: string;
  createdAt: string;
}

export interface Blueprint {
  id: string;
  projectId: string;
  fileName: string;
  notes: string;
  measurements: string;
  uploadedBy: string;
  uploadDate: string;
  version: number;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  supervisorId: string | null;
  startDate: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  requiredResources: string;
  estimatedQuantity: string;
  status: TaskStatus;
  progress: number;
}

export interface Resource {
  id: string;
  projectId: string;
  taskId: string | null;
  name: string;
  unit: string;
  allocated: number;
  used: number;
  required: number;
  allocationDate: string;
}

export interface ProgressReport {
  id: string;
  projectId: string;
  taskId: string;
  supervisorId: string;
  progress: number;
  workCompleted: string;
  workRemaining: string;
  issues: string;
  comments: string;
  date: string;
}

export interface SitePhoto {
  id: string;
  projectId: string;
  taskId: string;
  supervisorId: string;
  imageDataUrl: string;
  description: string;
  location?: string;
  uploadedAt: string;
}

export interface ResourceRequest {
  id: string;
  projectId: string;
  taskId: string;
  supervisorId: string;
  resourceName: string;
  currentQuantity: number;
  requestedQuantity: number;
  reason: string;
  status: RequestStatus;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
