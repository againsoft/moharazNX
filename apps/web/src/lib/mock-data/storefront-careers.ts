export type JobOpening = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Remote" | "Contract";
  slug: string;
  summary: string;
};

export type JobDepartment = "all" | "engineering" | "operations" | "support" | "marketing";

export const CAREER_DEPARTMENTS: { value: JobDepartment; label: string }[] = [
  { value: "all", label: "All teams" },
  { value: "engineering", label: "Engineering" },
  { value: "operations", label: "Operations" },
  { value: "support", label: "Support" },
  { value: "marketing", label: "Marketing" },
];

export const CAREER_BENEFITS = [
  { title: "Competitive pay", body: "Market-rate salary reviewed twice a year." },
  { title: "Flexible hours", body: "Core hours 10–4; remote-friendly hybrid." },
  { title: "Learning budget", body: "৳20,000/year for courses and conferences." },
  { title: "Health support", body: "Outpatient coverage for you and dependents." },
  { title: "Team offsites", body: "Quarterly team days outside Dhaka." },
  { title: "MoharazNX discount", body: "30% staff discount on all products." },
];

export const jobOpenings: JobOpening[] = [
  {
    id: "job1",
    slug: "fullstack-engineer",
    title: "Full-stack Engineer",
    department: "engineering",
    location: "Dhaka · Hybrid",
    type: "Full-time",
    summary: "Build storefront and admin features on Next.js, TypeScript, and PostgreSQL.",
  },
  {
    id: "job2",
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    department: "engineering",
    location: "Dhaka · Hybrid",
    type: "Full-time",
    summary: "Craft mobile-first ecommerce UI with React, Tailwind, and accessibility best practices.",
  },
  {
    id: "job3",
    slug: "warehouse-associate",
    title: "Warehouse Associate",
    department: "operations",
    location: "Dhaka",
    type: "Full-time",
    summary: "Pick, pack, and ship orders with accuracy and speed in our Gazipur fulfillment center.",
  },
  {
    id: "job4",
    slug: "customer-support-specialist",
    title: "Customer Support Specialist",
    department: "support",
    location: "Dhaka · On-site",
    type: "Full-time",
    summary: "Help customers via email, chat, and phone — orders, returns, and product questions.",
  },
  {
    id: "job5",
    slug: "content-marketing-specialist",
    title: "Content & Marketing Specialist",
    department: "marketing",
    location: "Remote",
    type: "Full-time",
    summary: "Write blog posts, manage campaigns, and grow MoharazNX's brand across social channels.",
  },
  {
    id: "job6",
    slug: "part-time-support",
    title: "Part-time Support (Evenings)",
    department: "support",
    location: "Dhaka · Remote",
    type: "Part-time",
    summary: "Cover peak support hours 6–10 PM, Sat–Thu. Great for students or freelancers.",
  },
];

export const careersEmail = "careers@againshop.com";

export function filterJobs(department: JobDepartment) {
  if (department === "all") return jobOpenings;
  return jobOpenings.filter((j) => j.department === department);
}

export function getJobBySlug(slug: string) {
  return jobOpenings.find((j) => j.slug === slug);
}
