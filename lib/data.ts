import type {
  User,
  Project,
  Blueprint,
  Task,
  Resource,
  ProgressReport,
  SitePhoto,
  ResourceRequest,
  Notification,
  Role,
} from "./types";

// ---------------------------------------------------------------------------
// BuildNova demo data layer.
//
// This is an in-memory store, not a real database. It exists so the app is
// fully functional out of the box (per the product spec: "populate with
// realistic sample data so the dashboard works immediately" and "the
// database will be configured later"). Data lives for the life of the
// serverless function instance and will reset on redeploy / cold start.
//
// To move to a real database: replace the functions below with calls to
// your DB client (Postgres via Vercel Postgres/Supabase/Neon, etc.) — the
// function signatures are written so the rest of the app doesn't need to
// change when you do.
// ---------------------------------------------------------------------------

interface Database {
  users: User[];
  projects: Project[];
  blueprints: Blueprint[];
  tasks: Task[];
  resources: Resource[];
  progressReports: ProgressReport[];
  sitePhotos: SitePhoto[];
  resourceRequests: ResourceRequest[];
  notifications: Notification[];
  counters: Record<string, number>;
}

function nextId(db: Database, prefix: string) {
  db.counters[prefix] = (db.counters[prefix] ?? 0) + 1;
  return `${prefix}-${db.counters[prefix]}`;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function seed(): Database {
  const db: Database = {
    users: [],
    projects: [],
    blueprints: [],
    tasks: [],
    resources: [],
    progressReports: [],
    sitePhotos: [],
    resourceRequests: [],
    notifications: [],
    counters: {},
  };

  db.users = [
    {
      id: "eng-1",
      name: "Aisha Rahman",
      email: "engineer@buildnova.dev",
      password: "password123",
      role: "engineer",
      title: "Planning Engineer",
      avatarColor: "#1F5D42",
    },
    {
      id: "mgr-1",
      name: "David Okonkwo",
      email: "manager@buildnova.dev",
      password: "password123",
      role: "manager",
      title: "Project Manager",
      avatarColor: "#2E5C8A",
    },
    {
      id: "sup-1",
      name: "Marcus Webb",
      email: "marcus@buildnova.dev",
      password: "password123",
      role: "supervisor",
      title: "Site Supervisor — Structural",
      avatarColor: "#C67C1F",
    },
    {
      id: "sup-2",
      name: "Priya Nair",
      email: "priya@buildnova.dev",
      password: "password123",
      role: "supervisor",
      title: "Site Supervisor — Electrical",
      avatarColor: "#8A4B9E",
    },
    {
      id: "sup-3",
      name: "Tom Alvarez",
      email: "tom@buildnova.dev",
      password: "password123",
      role: "supervisor",
      title: "Site Supervisor — Plumbing",
      avatarColor: "#1F5D42",
    },
    {
      id: "sup-4",
      name: "Grace Kim",
      email: "grace@buildnova.dev",
      password: "password123",
      role: "supervisor",
      title: "Site Supervisor — Finishing",
      avatarColor: "#2E5C8A",
    },
  ];

  db.projects = [
    {
      id: "proj-1",
      name: "Construction Site A",
      employer: "Horizon Realty Group",
      location: "Austin, Texas",
      landArea: "4.2 acres",
      gpsLocation: "30.2672° N, 97.7431° W",
      projectType: "Mixed-use residential",
      description:
        "Six-storey mixed-use building with ground-floor retail and 84 residential units.",
      requiredInfrastructure: "Foundation, structural frame, MEP, roofing, finishing",
      startDate: daysFromNow(-96),
      expectedCompletion: daysFromNow(24),
      budget: 8400000,
      requiredWorkers: 64,
      status: "active",
      overallProgress: 68,
      engineerId: "eng-1",
      managerId: "mgr-1",
      createdAt: daysFromNow(-110),
    },
    {
      id: "proj-2",
      name: "Riverside Bridge Expansion",
      employer: "City of Millbrook",
      location: "Millbrook, Ohio",
      landArea: "N/A — river crossing",
      gpsLocation: "41.3556° N, 81.4638° W",
      projectType: "Infrastructure — bridge",
      description:
        "Widening the Riverside Bridge from two to four lanes with a new pedestrian path.",
      requiredInfrastructure: "Pier foundations, girders, deck, approach roads",
      startDate: daysFromNow(-52),
      expectedCompletion: daysFromNow(70),
      budget: 5200000,
      requiredWorkers: 38,
      status: "delayed",
      overallProgress: 22,
      engineerId: "eng-1",
      managerId: "mgr-1",
      createdAt: daysFromNow(-60),
    },
    {
      id: "proj-3",
      name: "Sunridge Business Park",
      employer: "Sunridge Development LLC",
      location: "Denver, Colorado",
      landArea: "9.6 acres",
      gpsLocation: "39.7392° N, 104.9903° W",
      projectType: "Commercial / office park",
      description:
        "Three low-rise office buildings with shared parking and a central plaza.",
      requiredInfrastructure: "Site grading, foundations, structural steel, façade",
      startDate: daysFromNow(30),
      expectedCompletion: daysFromNow(430),
      budget: 12500000,
      requiredWorkers: 50,
      status: "planning",
      overallProgress: 0,
      engineerId: "eng-1",
      createdAt: daysFromNow(-4),
    },
  ];

  db.blueprints = [
    {
      id: "bp-1",
      projectId: "proj-1",
      fileName: "site-a-structural-v3.pdf",
      notes:
        "Revised column grid on level 3 to clear the retail loading dock. Confirmed with structural consultant on " +
        daysFromNow(-88) +
        ".",
      measurements: "Floor-to-floor 3.4m; column grid 8m x 8m; foundation depth 2.1m",
      uploadedBy: "eng-1",
      uploadDate: daysFromNow(-90),
      version: 3,
    },
    {
      id: "bp-2",
      projectId: "proj-2",
      fileName: "riverside-bridge-piers-v1.pdf",
      notes: "Pier spacing set to 24m to match hydrology report constraints.",
      measurements: "Span 96m total; deck width 14.2m; pier depth 6m below riverbed",
      uploadedBy: "eng-1",
      uploadDate: daysFromNow(-55),
      version: 1,
    },
  ];

  db.tasks = [
    { id: "task-1", projectId: "proj-1", name: "Land Preparation", description: "Clear, grade, and compact the site.", supervisorId: "sup-1", startDate: daysFromNow(-96), deadline: daysFromNow(-84), priority: "high", requiredResources: "Excavator, compactor, labor crew", estimatedQuantity: "4.2 acres", status: "completed", progress: 100 },
    { id: "task-2", projectId: "proj-1", name: "Foundation", description: "Pour footings and foundation walls.", supervisorId: "sup-1", startDate: daysFromNow(-83), deadline: daysFromNow(-60), priority: "high", requiredResources: "Cement, steel rebar, formwork", estimatedQuantity: "620 m³ concrete", status: "completed", progress: 100 },
    { id: "task-3", projectId: "proj-1", name: "Structural Work", description: "Erect structural frame, floors 1–6.", supervisorId: "sup-1", startDate: daysFromNow(-59), deadline: daysFromNow(-5), priority: "high", requiredResources: "Steel beams, cement, cranes", estimatedQuantity: "1,840 tons steel", status: "in_progress", progress: 75 },
    { id: "task-4", projectId: "proj-1", name: "Electrical Work", description: "Rough-in wiring and panel installation, floors 1–6.", supervisorId: "sup-2", startDate: daysFromNow(-30), deadline: daysFromNow(18), priority: "medium", requiredResources: "Conduit, wiring, panels", estimatedQuantity: "6 floors", status: "in_progress", progress: 40 },
    { id: "task-5", projectId: "proj-1", name: "Plumbing", description: "Rough-in supply and drain lines, floors 1–6.", supervisorId: "sup-3", startDate: daysFromNow(-20), deadline: daysFromNow(22), priority: "medium", requiredResources: "PVC/copper pipe, fittings", estimatedQuantity: "6 floors", status: "in_progress", progress: 20 },
    { id: "task-6", projectId: "proj-1", name: "Roofing", description: "Install roofing membrane and drainage.", supervisorId: null, startDate: daysFromNow(19), deadline: daysFromNow(30), priority: "medium", requiredResources: "Roofing membrane, insulation", estimatedQuantity: "1,100 m²", status: "not_started", progress: 0 },
    { id: "task-7", projectId: "proj-1", name: "Flooring", description: "Install flooring across all levels.", supervisorId: null, startDate: daysFromNow(23), deadline: daysFromNow(33), priority: "low", requiredResources: "Tile, underlayment, adhesive", estimatedQuantity: "9,200 m²", status: "not_started", progress: 0 },
    { id: "task-8", projectId: "proj-1", name: "Painting", description: "Interior and exterior painting.", supervisorId: "sup-4", startDate: daysFromNow(25), deadline: daysFromNow(35), priority: "low", requiredResources: "Paint, primer, sprayers", estimatedQuantity: "9,200 m²", status: "not_started", progress: 0 },
    { id: "task-9", projectId: "proj-1", name: "Final Inspection", description: "Walkthrough, punch list, and sign-off.", supervisorId: null, startDate: daysFromNow(36), deadline: daysFromNow(24), priority: "high", requiredResources: "Inspection checklist", estimatedQuantity: "1 building", status: "not_started", progress: 0 },

    { id: "task-10", projectId: "proj-2", name: "Site Survey", description: "Topographic and hydrology survey.", supervisorId: "sup-3", startDate: daysFromNow(-52), deadline: daysFromNow(-40), priority: "high", requiredResources: "Survey equipment", estimatedQuantity: "1 river crossing", status: "completed", progress: 100 },
    { id: "task-11", projectId: "proj-2", name: "Pier Foundation", description: "Drill and pour pier foundations.", supervisorId: "sup-1", startDate: daysFromNow(-38), deadline: daysFromNow(-8), priority: "high", requiredResources: "Cement, steel casing", estimatedQuantity: "4 piers", status: "delayed", progress: 30 },
    { id: "task-12", projectId: "proj-2", name: "Girder Installation", description: "Set precast girders between piers.", supervisorId: null, startDate: daysFromNow(20), deadline: daysFromNow(55), priority: "medium", requiredResources: "Precast girders, crane", estimatedQuantity: "3 spans", status: "not_started", progress: 0 },
  ];

  db.resources = [
    { id: "res-1", projectId: "proj-1", taskId: "task-3", name: "Cement", unit: "bags", allocated: 500, used: 380, required: 500, allocationDate: daysFromNow(-59) },
    { id: "res-2", projectId: "proj-1", taskId: "task-3", name: "Steel Rebar", unit: "tons", allocated: 1840, used: 1390, required: 1840, allocationDate: daysFromNow(-59) },
    { id: "res-3", projectId: "proj-1", taskId: "task-4", name: "Electrical Conduit", unit: "meters", allocated: 2200, used: 900, required: 2600, allocationDate: daysFromNow(-30) },
    { id: "res-4", projectId: "proj-1", taskId: "task-5", name: "Copper Pipe", unit: "meters", allocated: 1400, used: 260, required: 1400, allocationDate: daysFromNow(-20) },
    { id: "res-5", projectId: "proj-1", taskId: null, name: "Site Workers", unit: "people", allocated: 64, used: 58, required: 64, allocationDate: daysFromNow(-96) },
    { id: "res-6", projectId: "proj-2", taskId: "task-11", name: "Cement", unit: "bags", allocated: 260, used: 240, required: 300, allocationDate: daysFromNow(-38) },
    { id: "res-7", projectId: "proj-2", taskId: "task-11", name: "Steel Casing", unit: "tons", allocated: 40, used: 34, required: 48, allocationDate: daysFromNow(-38) },
  ];

  db.resourceRequests = [
    { id: "req-1", projectId: "proj-1", taskId: "task-4", supervisorId: "sup-2", resourceName: "Electrical Conduit", currentQuantity: 900, requestedQuantity: 400, reason: "Additional conduit needed to complete floor 5 rough-in ahead of inspection.", status: "pending", date: daysFromNow(-1) },
    { id: "req-2", projectId: "proj-2", taskId: "task-11", supervisorId: "sup-1", resourceName: "Steel Casing", currentQuantity: 34, requestedQuantity: 12, reason: "Pier 3 casing came in under-spec and needs replacement.", status: "pending", date: daysFromNow(-2) },
    { id: "req-3", projectId: "proj-1", taskId: "task-3", supervisorId: "sup-1", resourceName: "Cement", currentQuantity: 380, requestedQuantity: 50, reason: "Extra cement for column repairs on level 4.", status: "approved", date: daysFromNow(-10) },
  ];

  db.progressReports = [
    { id: "rep-1", projectId: "proj-1", taskId: "task-3", supervisorId: "sup-1", progress: 55, workCompleted: "Floors 1-4 frame complete.", workRemaining: "Floors 5-6 framing, bracing.", issues: "None", comments: "On pace for deadline.", date: daysFromNow(-14) },
    { id: "rep-2", projectId: "proj-1", taskId: "task-3", supervisorId: "sup-1", progress: 75, workCompleted: "Floors 1-5 frame complete, floor 6 columns set.", workRemaining: "Floor 6 beams, roof bracing.", issues: "Minor delay from steel delivery.", comments: "Still tracking close to deadline.", date: daysFromNow(-2) },
    { id: "rep-3", projectId: "proj-1", taskId: "task-4", supervisorId: "sup-2", progress: 40, workCompleted: "Floors 1-2 rough-in complete.", workRemaining: "Floors 3-6 rough-in, panel install.", issues: "Waiting on additional conduit.", comments: "Requested more conduit today.", date: daysFromNow(-1) },
    { id: "rep-4", projectId: "proj-2", taskId: "task-11", supervisorId: "sup-1", progress: 30, workCompleted: "Pier 1 and 2 poured.", workRemaining: "Pier 3 and 4 — casing replacement needed.", issues: "Under-spec steel casing on pier 3.", comments: "Requested replacement casing.", date: daysFromNow(-2) },
  ];

  db.sitePhotos = [];

  db.notifications = [
    { id: "notif-1", userId: "mgr-1", message: "Priya Nair requested 400m of electrical conduit for Electrical Work on Construction Site A.", type: "resource", read: false, createdAt: daysFromNow(-1) },
    { id: "notif-2", userId: "mgr-1", message: "Marcus Webb requested 12 tons of steel casing for Pier Foundation on Riverside Bridge Expansion.", type: "resource", read: false, createdAt: daysFromNow(-2) },
    { id: "notif-3", userId: "mgr-1", message: "Riverside Bridge Expansion is trending behind schedule — Pier Foundation is at 30% with 8 days remaining.", type: "delay", read: false, createdAt: daysFromNow(-2) },
    { id: "notif-4", userId: "mgr-1", message: "Marcus Webb submitted a progress update: Structural Work is now 75% complete.", type: "progress", read: true, createdAt: daysFromNow(-2) },
    { id: "notif-5", userId: "sup-1", message: "You were assigned to Foundation on Construction Site A.", type: "task", read: true, createdAt: daysFromNow(-83) },
    { id: "notif-6", userId: "sup-1", message: "Your request for 50 bags of cement was approved.", type: "resource", read: false, createdAt: daysFromNow(-9) },
    { id: "notif-7", userId: "sup-2", message: "You were assigned to Electrical Work on Construction Site A.", type: "task", read: true, createdAt: daysFromNow(-30) },
    { id: "notif-8", userId: "eng-1", message: "Construction started on Construction Site A.", type: "milestone", read: true, createdAt: daysFromNow(-96) },
    { id: "notif-9", userId: "eng-1", message: "Foundation milestone completed on Construction Site A.", type: "milestone", read: true, createdAt: daysFromNow(-60) },
  ];

  db.counters = {
    proj: 3,
    task: 12,
    res: 7,
    req: 3,
    rep: 4,
    bp: 2,
    notif: 9,
    photo: 0,
  };

  return db;
}

const g = globalThis as unknown as { __buildnovaDB?: Database };
if (!g.__buildnovaDB) g.__buildnovaDB = seed();
const db = g.__buildnovaDB;

// ---------------------------------------------------------------------------
// Users / auth
// ---------------------------------------------------------------------------
export function findUser(email: string, password: string, role: Role) {
  return db.users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.role === role
  );
}
export function getUserById(id: string) {
  return db.users.find((u) => u.id === id) || null;
}
export function getUsersByRole(role: Role) {
  return db.users.filter((u) => u.role === role);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export function getProjectsForUser(userId: string, role: Role): Project[] {
  if (role === "engineer") return db.projects.filter((p) => p.engineerId === userId);
  if (role === "manager") return db.projects.filter((p) => p.managerId === userId);
  const taskProjectIds = new Set(
    db.tasks.filter((t) => t.supervisorId === userId).map((t) => t.projectId)
  );
  return db.projects.filter((p) => taskProjectIds.has(p.id));
}
export function getProjectById(id: string) {
  return db.projects.find((p) => p.id === id) || null;
}
export function getUnassignedProjects() {
  return db.projects.filter((p) => p.status === "planning" && !p.managerId);
}
export function createProject(
  input: Omit<Project, "id" | "createdAt" | "status" | "overallProgress">
): Project {
  const project: Project = {
    ...input,
    id: nextId(db, "proj"),
    status: "planning",
    overallProgress: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  db.projects.push(project);
  return project;
}
export function updateProject(id: string, patch: Partial<Project>) {
  const p = getProjectById(id);
  if (!p) return null;
  Object.assign(p, patch);
  return p;
}
function recomputeProjectProgress(projectId: string) {
  const tasks = db.tasks.filter((t) => t.projectId === projectId);
  if (tasks.length === 0) return;
  const avg = Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
  const project = getProjectById(projectId);
  if (!project) return;
  project.overallProgress = avg;
  if (avg === 100) project.status = "completed";
  else if (tasks.some((t) => t.status === "delayed")) project.status = "delayed";
  else if (project.status === "planning" && avg > 0) project.status = "active";
}

// ---------------------------------------------------------------------------
// Blueprints
// ---------------------------------------------------------------------------
export function getBlueprintForProject(projectId: string) {
  return db.blueprints.find((b) => b.projectId === projectId) || null;
}
export function upsertBlueprint(
  projectId: string,
  patch: Partial<Omit<Blueprint, "id" | "projectId">>
) {
  let bp = getBlueprintForProject(projectId);
  if (!bp) {
    bp = {
      id: nextId(db, "bp"),
      projectId,
      fileName: patch.fileName || "untitled-blueprint.pdf",
      notes: patch.notes || "",
      measurements: patch.measurements || "",
      uploadedBy: patch.uploadedBy || "",
      uploadDate: new Date().toISOString().slice(0, 10),
      version: 1,
    };
    db.blueprints.push(bp);
  } else {
    Object.assign(bp, patch, { version: bp.version + 1 });
  }
  return bp;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export function getTasksForProject(projectId: string) {
  return db.tasks.filter((t) => t.projectId === projectId);
}
export function getTasksForSupervisor(supervisorId: string) {
  return db.tasks.filter((t) => t.supervisorId === supervisorId);
}
export function getTaskById(id: string) {
  return db.tasks.find((t) => t.id === id) || null;
}
export function createTask(input: Omit<Task, "id">) {
  const task: Task = { ...input, id: nextId(db, "task") };
  db.tasks.push(task);
  if (task.supervisorId) {
    addNotification(
      task.supervisorId,
      `You were assigned to ${task.name} on ${getProjectById(task.projectId)?.name}.`,
      "task"
    );
  }
  recomputeProjectProgress(task.projectId);
  return task;
}
export function updateTask(id: string, patch: Partial<Task>) {
  const t = getTaskById(id);
  if (!t) return null;
  const wasComplete = t.status === "completed";
  const prevSupervisor = t.supervisorId;
  Object.assign(t, patch);
  if (patch.supervisorId && patch.supervisorId !== prevSupervisor) {
    addNotification(
      patch.supervisorId,
      `You were assigned to ${t.name} on ${getProjectById(t.projectId)?.name}.`,
      "task"
    );
  }
  if (!wasComplete && t.status === "completed") {
    const project = getProjectById(t.projectId);
    const early = new Date(t.deadline).getTime() > Date.now();
    const managerId = project?.managerId;
    if (managerId) {
      addNotification(
        managerId,
        early
          ? `${t.name} on ${project?.name} was completed ahead of schedule.`
          : `${t.name} on ${project?.name} was marked complete.`,
        "task"
      );
    }
  }
  recomputeProjectProgress(t.projectId);
  return t;
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------
export function getResourcesForProject(projectId: string) {
  return db.resources.filter((r) => r.projectId === projectId);
}
export function allocateResource(input: Omit<Resource, "id">) {
  const r: Resource = { ...input, id: nextId(db, "res") };
  db.resources.push(r);
  return r;
}
export function updateResource(id: string, patch: Partial<Resource>) {
  const r = db.resources.find((x) => x.id === id);
  if (!r) return null;
  Object.assign(r, patch);
  return r;
}

// ---------------------------------------------------------------------------
// Resource requests
// ---------------------------------------------------------------------------
export function getResourceRequests(filter: {
  projectId?: string;
  supervisorId?: string;
}) {
  return db.resourceRequests.filter(
    (r) =>
      (!filter.projectId || r.projectId === filter.projectId) &&
      (!filter.supervisorId || r.supervisorId === filter.supervisorId)
  );
}
export function createResourceRequest(input: Omit<ResourceRequest, "id" | "status" | "date">) {
  const req: ResourceRequest = {
    ...input,
    id: nextId(db, "req"),
    status: "pending",
    date: new Date().toISOString().slice(0, 10),
  };
  db.resourceRequests.push(req);
  const project = getProjectById(req.projectId);
  const supervisor = getUserById(req.supervisorId);
  if (project?.managerId) {
    addNotification(
      project.managerId,
      `${supervisor?.name || "A supervisor"} requested ${req.requestedQuantity} more ${req.resourceName} for ${project.name}.`,
      "resource"
    );
  }
  return req;
}
export function updateResourceRequestStatus(
  id: string,
  status: "approved" | "rejected" | "modified",
  modifiedQuantity?: number
) {
  const req = db.resourceRequests.find((r) => r.id === id);
  if (!req) return null;
  req.status = status;
  if (status === "modified" && modifiedQuantity != null) {
    req.requestedQuantity = modifiedQuantity;
  }
  if (status === "approved" || status === "modified") {
    const resource = db.resources.find(
      (r) => r.projectId === req.projectId && r.name === req.resourceName
    );
    if (resource) resource.allocated += req.requestedQuantity;
  }
  addNotification(
    req.supervisorId,
    `Your request for ${req.requestedQuantity} ${req.resourceName} was ${status}.`,
    "resource"
  );
  return req;
}

// ---------------------------------------------------------------------------
// Progress reports
// ---------------------------------------------------------------------------
export function getProgressReportsForProject(projectId: string) {
  return db.progressReports
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function addProgressReport(input: Omit<ProgressReport, "id" | "date">) {
  const report: ProgressReport = {
    ...input,
    id: nextId(db, "rep"),
    date: new Date().toISOString().slice(0, 10),
  };
  db.progressReports.push(report);
  updateTask(input.taskId, { progress: input.progress });
  const task = getTaskById(input.taskId);
  const project = getProjectById(input.projectId);
  const supervisor = getUserById(input.supervisorId);
  if (project?.managerId && task) {
    addNotification(
      project.managerId,
      `${supervisor?.name || "A supervisor"} updated ${task.name} to ${input.progress}% on ${project.name}.`,
      "progress"
    );
  }
  return report;
}

// ---------------------------------------------------------------------------
// Site photos
// ---------------------------------------------------------------------------
export function getSitePhotosForProject(projectId: string) {
  return db.sitePhotos
    .filter((p) => p.projectId === projectId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}
export function addSitePhoto(input: Omit<SitePhoto, "id" | "uploadedAt">) {
  const photo: SitePhoto = {
    ...input,
    id: nextId(db, "photo"),
    uploadedAt: new Date().toISOString(),
  };
  db.sitePhotos.push(photo);
  return photo;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export function getNotificationsForUser(userId: string) {
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function addNotification(
  userId: string,
  message: string,
  type: Notification["type"]
) {
  const n: Notification = {
    id: nextId(db, "notif"),
    userId,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  db.notifications.push(n);
  return n;
}
export function markNotificationRead(id: string) {
  const n = db.notifications.find((x) => x.id === id);
  if (!n) return null;
  n.read = true;
  return n;
}

// ---------------------------------------------------------------------------
// Cross-cutting: full data snapshot scoped to a user, for the AI assistant
// ---------------------------------------------------------------------------
export function getAiContextForUser(userId: string, role: Role) {
  const projects = getProjectsForUser(userId, role);
  return projects.map((p) => {
    const tasks = getTasksForProject(p.id);
    const resources = getResourcesForProject(p.id);
    const requests = getResourceRequests({ projectId: p.id });
    return {
      project: {
        name: p.name,
        status: p.status,
        overallProgress: p.overallProgress,
        location: p.location,
        expectedCompletion: p.expectedCompletion,
        budget: p.budget,
      },
      tasks: tasks.map((t) => ({
        name: t.name,
        status: t.status,
        progress: t.progress,
        supervisor: t.supervisorId ? getUserById(t.supervisorId)?.name : "Unassigned",
        deadline: t.deadline,
      })),
      resources: resources.map((r) => ({
        name: r.name,
        unit: r.unit,
        allocated: r.allocated,
        used: r.used,
        remaining: r.allocated - r.used,
        required: r.required,
        task: r.taskId ? getTaskById(r.taskId)?.name : "Project-wide",
      })),
      resourceRequests: requests.map((r) => ({
        resource: r.resourceName,
        requestedQuantity: r.requestedQuantity,
        status: r.status,
        by: getUserById(r.supervisorId)?.name,
      })),
    };
  });
}
