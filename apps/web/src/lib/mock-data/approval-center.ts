/**
 * Approval Center mock data — SCR-COR-APR-* · CMP-APR-WORKSPACE-001
 * @see docs/modules/hr-payroll/uiux/HR_APPROVAL_CENTER_UI_ARCHITECTURE.md
 */

export type ApprovalModule = "HR" | "Payroll" | "Purchase" | "Sales" | "Inventory";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "delegated";
export type ApprovalPriority = "critical" | "high" | "medium" | "low";

export type ApprovalRequest = {
  id: string;
  requestId: string;
  module: ApprovalModule;
  requestType: string;
  requester: string;
  requesterId: string;
  requesterNumber: string;
  department: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  submittedAt: string;
  submittedAtIso: string;
  dueAt?: string;
  currentStep: string;
  totalSteps: number;
  stepNumber: number;
  assigneeMe: boolean;
  delegatedToMe?: boolean;
  overdue?: boolean;
  aiRisk?: "high" | "medium" | "low";
  completedAt?: string;
};

export type ApprovalDashboardKpi = {
  id: string;
  label: string;
  value: string;
  trend?: string;
  href: string;
};

export type ApprovalChainStep = {
  id: string;
  role: string;
  assignee: string;
  status: "completed" | "current" | "pending" | "rejected" | "skipped";
  completedAt?: string;
  comment?: string;
};

export type ApprovalComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type ApprovalAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
};

export type ApprovalActivityEvent = {
  id: string;
  type: "created" | "comment" | "approved" | "rejected" | "escalated" | "delegated" | "ai";
  title: string;
  meta?: string;
  time: string;
};

export type ApprovalImpactItem = {
  label: string;
  value: string;
  severity?: "info" | "warning" | "critical";
};

export type ApprovalDetail = ApprovalRequest & {
  summary: string;
  businessData: { label: string; value: string }[];
  chain: ApprovalChainStep[];
  impacts: ApprovalImpactItem[];
  comments: ApprovalComment[];
  attachments: ApprovalAttachment[];
  activities: ApprovalActivityEvent[];
  aiSummary: string[];
  aiRecommendation: "approve" | "reject" | "more_info";
  aiConfidence: "high" | "medium" | "low";
  aiRisks: string[];
  sodWarning?: string;
  sourceRecordHref: string;
};

export const APPROVAL_CENTER_AS_OF = "17 Jun 2026, 09:15 AM";

export const APPROVAL_DASHBOARD_KPIS: ApprovalDashboardKpi[] = [
  { id: "WGT-APR-KPI-001", label: "Pending Approvals", value: "24", trend: "+6 today", href: "/inbox/approvals?status=pending" },
  { id: "WGT-APR-KPI-002", label: "Approved Today", value: "18", trend: "↑ 12%", href: "/inbox/approvals?status=approved" },
  { id: "WGT-APR-KPI-003", label: "Rejected Today", value: "3", trend: "Stable", href: "/inbox/approvals?status=rejected" },
  { id: "WGT-APR-KPI-004", label: "Escalated Requests", value: "5", trend: "2 urgent", href: "/inbox/approvals?status=escalated" },
  { id: "WGT-APR-KPI-006", label: "Average Approval Time", value: "4.2h", trend: "−18% vs last week", href: "/inbox/approvals?view=dashboard" },
];

export const APPROVAL_TREND_DATA = [
  { date: "11 Jun", submitted: 42, approved: 38, rejected: 4 },
  { date: "12 Jun", submitted: 48, approved: 44, rejected: 3 },
  { date: "13 Jun", submitted: 36, approved: 32, rejected: 5 },
  { date: "14 Jun", submitted: 12, approved: 10, rejected: 1 },
  { date: "15 Jun", submitted: 28, approved: 26, rejected: 2 },
  { date: "16 Jun", submitted: 52, approved: 46, rejected: 4 },
  { date: "17 Jun", submitted: 31, approved: 18, rejected: 3 },
];

export const APPROVAL_ESCALATION_TREND = [
  { date: "11 Jun", escalated: 2, resolved: 1 },
  { date: "12 Jun", escalated: 3, resolved: 2 },
  { date: "13 Jun", escalated: 1, resolved: 2 },
  { date: "14 Jun", escalated: 0, resolved: 1 },
  { date: "15 Jun", escalated: 2, resolved: 1 },
  { date: "16 Jun", escalated: 4, resolved: 3 },
  { date: "17 Jun", escalated: 5, resolved: 2 },
];

export const APPROVAL_VOLUME_BY_MODULE = [
  { module: "HR", count: 86, fill: "#6366f1" },
  { module: "Payroll", count: 54, fill: "#8b5cf6" },
  { module: "Purchase", count: 38, fill: "#06b6d4" },
  { module: "Sales", count: 24, fill: "#10b981" },
  { module: "Inventory", count: 12, fill: "#94a3b8" },
];

export const APPROVAL_PRIORITY_QUEUE = {
  critical: ["apr-001", "apr-008"],
  high: ["apr-002", "apr-005", "apr-012"],
  medium: ["apr-003", "apr-006", "apr-009"],
  low: ["apr-010", "apr-011"],
};

export const APPROVAL_AI_RECOMMENDATIONS = [
  {
    id: "ai-apr-1",
    title: "Payroll run PR-2026-06 — approve before pay date",
    summary: "SLA expires in 6 hours. Exceptions reduced from 18 to 12 since yesterday.",
    severity: "critical" as const,
  },
  {
    id: "ai-apr-2",
    title: "Leave cluster risk — Operations",
    summary: "3 pending leave requests overlap same week. Review team coverage before bulk approve.",
    severity: "warning" as const,
  },
  {
    id: "ai-apr-3",
    title: "Delegate 4 low-priority purchase requests",
    summary: "Procurement delegate is available. Frees 2.1h estimated approver time.",
    severity: "info" as const,
  },
];

const REQUESTS: ApprovalRequest[] = [
  {
    id: "apr-001",
    requestId: "APR-2026-00482",
    module: "Payroll",
    requestType: "Payroll run",
    requester: "Payroll Team",
    requesterId: "sys-payroll",
    requesterNumber: "SYS",
    department: "Finance",
    priority: "critical",
    status: "pending",
    submittedAt: "16 Jun, 4:32 PM",
    submittedAtIso: "2026-06-16T16:32:00",
    dueAt: "Due in 6 hours",
    currentStep: "Finance Controller",
    totalSteps: 3,
    stepNumber: 2,
    assigneeMe: true,
    aiRisk: "high",
  },
  {
    id: "apr-002",
    requestId: "APR-2026-00481",
    module: "HR",
    requestType: "Leave request",
    requester: "Fatima Rahman",
    requesterId: "emp-002",
    requesterNumber: "EMP-0002",
    department: "Human Resources",
    priority: "high",
    status: "pending",
    submittedAt: "17 Jun, 09:02 AM",
    submittedAtIso: "2026-06-17T09:02:00",
    dueAt: "Due in 1 day",
    currentStep: "HR Manager",
    totalSteps: 2,
    stepNumber: 1,
    assigneeMe: true,
    aiRisk: "low",
  },
  {
    id: "apr-003",
    requestId: "APR-2026-00480",
    module: "HR",
    requestType: "Attendance correction",
    requester: "Karim Hassan",
    requesterId: "emp-003",
    requesterNumber: "EMP-0003",
    department: "Technology",
    priority: "medium",
    status: "pending",
    submittedAt: "17 Jun, 08:47 AM",
    submittedAtIso: "2026-06-17T08:47:00",
    currentStep: "Line Manager",
    totalSteps: 2,
    stepNumber: 1,
    assigneeMe: true,
  },
  {
    id: "apr-004",
    requestId: "APR-2026-00479",
    module: "HR",
    requestType: "Leave request",
    requester: "Mariam Akter",
    requesterId: "emp-009",
    requesterNumber: "EMP-0009",
    department: "Sales & Marketing",
    priority: "medium",
    status: "approved",
    submittedAt: "16 Jun, 11:20 AM",
    submittedAtIso: "2026-06-16T11:20:00",
    currentStep: "Completed",
    totalSteps: 2,
    stepNumber: 2,
    assigneeMe: false,
    completedAt: "16 Jun, 2:45 PM",
  },
  {
    id: "apr-005",
    requestId: "APR-2026-00478",
    module: "Payroll",
    requestType: "Salary revision",
    requester: "Fatima Rahman",
    requesterId: "emp-002",
    requesterNumber: "EMP-0002",
    department: "Human Resources",
    priority: "high",
    status: "escalated",
    submittedAt: "15 Jun, 3:10 PM",
    submittedAtIso: "2026-06-15T15:10:00",
    dueAt: "Overdue by 4h",
    currentStep: "HR Director",
    totalSteps: 3,
    stepNumber: 3,
    assigneeMe: true,
    overdue: true,
    aiRisk: "medium",
  },
  {
    id: "apr-006",
    requestId: "APR-2026-00477",
    module: "Purchase",
    requestType: "Purchase order",
    requester: "Rafiq Ahmed",
    requesterId: "emp-001",
    requesterNumber: "EMP-0001",
    department: "Operations",
    priority: "medium",
    status: "pending",
    submittedAt: "16 Jun, 10:15 AM",
    submittedAtIso: "2026-06-16T10:15:00",
    currentStep: "Procurement Head",
    totalSteps: 2,
    stepNumber: 2,
    assigneeMe: false,
  },
  {
    id: "apr-007",
    requestId: "APR-2026-00476",
    module: "HR",
    requestType: "Leave request",
    requester: "Sadia Islam",
    requesterId: "emp-005",
    requesterNumber: "EMP-0005",
    department: "Operations",
    priority: "low",
    status: "rejected",
    submittedAt: "14 Jun, 9:30 AM",
    submittedAtIso: "2026-06-14T09:30:00",
    currentStep: "Rejected",
    totalSteps: 2,
    stepNumber: 1,
    assigneeMe: false,
    completedAt: "14 Jun, 4:00 PM",
  },
  {
    id: "apr-008",
    requestId: "APR-2026-00475",
    module: "Payroll",
    requestType: "Bonus batch",
    requester: "HR Operations",
    requesterId: "sys-hr",
    requesterNumber: "SYS",
    department: "Human Resources",
    priority: "critical",
    status: "escalated",
    submittedAt: "15 Jun, 9:00 AM",
    submittedAtIso: "2026-06-15T09:00:00",
    dueAt: "Due today",
    currentStep: "CFO",
    totalSteps: 3,
    stepNumber: 3,
    assigneeMe: true,
    aiRisk: "high",
  },
  {
    id: "apr-009",
    requestId: "APR-2026-00474",
    module: "Payroll",
    requestType: "Loan request",
    requester: "Jamal Uddin",
    requesterId: "emp-016",
    requesterNumber: "EMP-0016",
    department: "Operations",
    priority: "medium",
    status: "delegated",
    submittedAt: "13 Jun, 2:20 PM",
    submittedAtIso: "2026-06-13T14:20:00",
    currentStep: "Finance Manager (delegated)",
    totalSteps: +2,
    stepNumber: 2,
    assigneeMe: false,
    delegatedToMe: true,
  },
  {
    id: "apr-010",
    requestId: "APR-2026-00473",
    module: "Sales",
    requestType: "Discount approval",
    requester: "Nusrat Jahan",
    requesterId: "emp-004",
    requesterNumber: "EMP-0004",
    department: "Sales & Marketing",
    priority: "low",
    status: "pending",
    submittedAt: "16 Jun, 3:45 PM",
    submittedAtIso: "2026-06-16T15:45:00",
    currentStep: "Sales Manager",
    totalSteps: 2,
    stepNumber: 2,
    assigneeMe: false,
  },
  {
    id: "apr-011",
    requestId: "APR-2026-00472",
    module: "Inventory",
    requestType: "Stock adjustment",
    requester: "Rubel Mia",
    requesterId: "emp-020",
    requesterNumber: "EMP-0020",
    department: "Logistics",
    priority: "low",
    status: "pending",
    submittedAt: "15 Jun, 5:00 PM",
    submittedAtIso: "2026-06-15T17:00:00",
    currentStep: "Warehouse Manager",
    totalSteps: 2,
    stepNumber: 1,
    assigneeMe: false,
  },
  {
    id: "apr-012",
    requestId: "APR-2026-00471",
    module: "HR",
    requestType: "Overtime request",
    requester: "Shahid Alam",
    requesterId: "emp-014",
    requesterNumber: "EMP-0014",
    department: "Technology",
    priority: "high",
    status: "pending",
    submittedAt: "17 Jun, 07:55 AM",
    submittedAtIso: "2026-06-17T07:55:00",
    currentStep: "Line Manager",
    totalSteps: 2,
    stepNumber: 1,
    assigneeMe: true,
  },
  {
    id: "apr-013",
    requestId: "APR-2026-00470",
    module: "Purchase",
    requestType: "Vendor onboarding",
    requester: "Procurement Team",
    requesterId: "sys-proc",
    requesterNumber: "SYS",
    department: "Operations",
    priority: "medium",
    status: "approved",
    submittedAt: "12 Jun, 10:00 AM",
    submittedAtIso: "2026-06-12T10:00:00",
    currentStep: "Completed",
    totalSteps: 3,
    stepNumber: 3,
    assigneeMe: false,
    completedAt: "13 Jun, 11:30 AM",
  },
  {
    id: "apr-014",
    requestId: "APR-2026-00469",
    module: "HR",
    requestType: "Profile update",
    requester: "Tasnim Chowdhury",
    requesterId: "emp-007",
    requesterNumber: "EMP-0007",
    department: "Finance",
    priority: "low",
    status: "approved",
    submittedAt: "17 Jun, 08:10 AM",
    submittedAtIso: "2026-06-17T08:10:00",
    currentStep: "Completed",
    totalSteps: 1,
    stepNumber: 1,
    assigneeMe: true,
    completedAt: "17 Jun, 08:45 AM",
  },
  {
    id: "apr-015",
    requestId: "APR-2026-00468",
    module: "Payroll",
    requestType: "Advance request",
    requester: "Hasan Mahmud",
    requesterId: "emp-011",
    requesterNumber: "EMP-0011",
    department: "Operations",
    priority: "medium",
    status: "rejected",
    submittedAt: "11 Jun, 1:15 PM",
    submittedAtIso: "2026-06-11T13:15:00",
    currentStep: "Rejected",
    totalSteps: 2,
    stepNumber: 2,
    assigneeMe: true,
    completedAt: "12 Jun, 9:00 AM",
  },
];

const DETAIL_OVERRIDES: Record<string, Partial<ApprovalDetail>> = {
  "apr-001": {
    summary: "June 2026 payroll run approval — 1,248 employees · net ৳48.62M",
    businessData: [
      { label: "Run ID", value: "PR-2026-06" },
      { label: "Period", value: "June 2026" },
      { label: "Headcount", value: "1,248" },
      { label: "Gross pay", value: "৳48.6M" },
      { label: "Net pay", value: "৳40.4M" },
      { label: "Exceptions", value: "12 unresolved" },
    ],
    chain: [
      { id: "c1", role: "Payroll Manager", assignee: "Payroll Team", status: "completed", completedAt: "16 Jun, 4:32 PM", comment: "Calculated and submitted" },
      { id: "c2", role: "Finance Controller", assignee: "You", status: "current" },
      { id: "c3", role: "CFO", assignee: "CFO Office", status: "pending" },
    ],
    impacts: [
      { label: "Cost delta vs May", value: "+2.4%", severity: "info" },
      { label: "Budget variance", value: "Within tolerance", severity: "info" },
      { label: "Compliance checklist", value: "3 items pending", severity: "warning" },
      { label: "Pay date risk", value: "Lock required by 24 Jun", severity: "critical" },
    ],
    sodWarning: "You did not calculate this run — SoD check passed.",
    sourceRecordHref: "/payroll/runs?view=PR-2026-06",
    aiSummary: [
      "Net pay within 3% of prior month forecast.",
      "12 validation exceptions remain — down from 18.",
      "Pay date SLA requires approval within 6 hours.",
    ],
    aiRecommendation: "approve",
    aiConfidence: "high",
    aiRisks: ["Unresolved bank details for 3 employees", "Tax slab mismatch for 7 employees"],
  },
  "apr-002": {
    summary: "Annual leave — 5 days · 24–28 Jun 2026",
    businessData: [
      { label: "Leave type", value: "Annual leave" },
      { label: "Start date", value: "24 Jun 2026" },
      { label: "End date", value: "28 Jun 2026" },
      { label: "Duration", value: "5 days" },
      { label: "Balance before", value: "12 days" },
      { label: "Balance after", value: "7 days" },
      { label: "Reason", value: "Family event" },
    ],
    chain: [
      { id: "c1", role: "HR Manager", assignee: "You", status: "current" },
      { id: "c2", role: "HR Director", assignee: "HR Director", status: "pending" },
    ],
    impacts: [
      { label: "Team coverage", value: "HR team 80% available that week", severity: "info" },
      { label: "Policy compliance", value: "Within consecutive leave limit", severity: "info" },
      { label: "Payroll impact", value: "Paid leave — no LWP", severity: "info" },
    ],
    sourceRecordHref: "/hr/leave/requests?view=lv-apr-2",
    aiSummary: [
      "Employee has sufficient annual leave balance.",
      "No overlapping team absence conflicts in HR department.",
      "Standard approval pattern for this employee grade.",
    ],
    aiRecommendation: "approve",
    aiConfidence: "high",
    aiRisks: [],
  },
};

function defaultDetail(req: ApprovalRequest): ApprovalDetail {
  return {
    ...req,
    summary: `${req.requestType} submitted by ${req.requester}`,
    businessData: [
      { label: "Request type", value: req.requestType },
      { label: "Module", value: req.module },
      { label: "Department", value: req.department },
      { label: "Priority", value: req.priority },
    ],
    chain: [
      {
        id: "c1",
        role: "Line Manager",
        assignee: req.assigneeMe ? "You" : "Manager",
        status: req.status === "pending" ? "current" : "completed",
        completedAt: req.status !== "pending" ? req.completedAt : undefined,
      },
      {
        id: "c2",
        role: "Department Head",
        assignee: "Dept Head",
        status: req.status === "approved" ? "completed" : req.status === "rejected" ? "rejected" : "pending",
        completedAt: req.status === "approved" ? req.completedAt : undefined,
      },
    ],
    impacts: [
      { label: "Business impact", value: "Standard processing", severity: "info" },
      { label: "Compliance", value: "Policy check passed", severity: "info" },
    ],
    comments: [
      { id: "cm1", author: req.requester, body: "Please review at your earliest convenience.", createdAt: req.submittedAt },
    ],
    attachments: req.requestType.includes("Leave")
      ? [{ id: "att1", name: "leave-supporting-doc.pdf", size: "245 KB", type: "PDF" }]
      : [],
    activities: [
      { id: "act1", type: "created", title: "Request submitted", meta: req.requester, time: req.submittedAt },
      ...(req.status === "approved"
        ? [{ id: "act2", type: "approved" as const, title: "Approved", meta: "Approver", time: req.completedAt ?? "" }]
        : []),
      ...(req.status === "rejected"
        ? [{ id: "act2", type: "rejected" as const, title: "Rejected", meta: "Policy limit exceeded", time: req.completedAt ?? "" }]
        : []),
      ...(req.status === "escalated"
        ? [{ id: "act2", type: "escalated" as const, title: "Escalated", meta: "SLA breach", time: "16 Jun" }]
        : []),
    ],
    aiSummary: ["Request within normal parameters for this module.", "No fraud indicators detected."],
    aiRecommendation: req.status === "rejected" ? "reject" : "approve",
    aiConfidence: "medium",
    aiRisks: req.aiRisk === "high" ? ["Elevated risk score — review impact analysis"] : [],
    sourceRecordHref: "/inbox/approvals",
  };
}

export function getApprovalRequests(): ApprovalRequest[] {
  return REQUESTS;
}

export function getApprovalById(id: string): ApprovalDetail | undefined {
  const req = REQUESTS.find((r) => r.id === id);
  if (!req) return undefined;
  const override = DETAIL_OVERRIDES[id];
  return { ...defaultDetail(req), ...override };
}

export function filterApprovals(
  requests: ApprovalRequest[],
  filters: {
    status?: string | null;
    assigneeMe?: boolean;
    delegated?: boolean;
    history?: boolean;
    module?: string;
    priority?: string;
    search?: string;
  },
): ApprovalRequest[] {
  let result = [...requests];

  if (filters.history) {
    result = result.filter((r) => r.status === "approved" || r.status === "rejected");
  } else if (filters.status) {
    result = result.filter((r) => r.status === filters.status);
  }

  if (filters.assigneeMe) {
    result = result.filter((r) => r.assigneeMe && (r.status === "pending" || r.status === "escalated"));
  }

  if (filters.delegated) {
    result = result.filter((r) => r.delegatedToMe || r.status === "delegated");
  }

  if (filters.module && filters.module !== "all") {
    result = result.filter((r) => r.module.toLowerCase() === filters.module);
  }

  if (filters.priority && filters.priority !== "all") {
    result = result.filter((r) => r.priority === filters.priority);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.requestId.toLowerCase().includes(q) ||
        r.requester.toLowerCase().includes(q) ||
        r.requestType.toLowerCase().includes(q),
    );
  }

  return result.sort((a, b) => b.submittedAtIso.localeCompare(a.submittedAtIso));
}

export const APPROVAL_MODULES = [
  { id: "all", label: "All modules" },
  { id: "hr", label: "HR" },
  { id: "payroll", label: "Payroll" },
  { id: "purchase", label: "Purchase" },
  { id: "sales", label: "Sales" },
  { id: "inventory", label: "Inventory" },
] as const;

export const APPROVAL_PRIORITIES = [
  { id: "all", label: "All priorities" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
] as const;
