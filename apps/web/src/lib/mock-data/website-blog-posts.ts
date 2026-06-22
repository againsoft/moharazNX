export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: "draft" | "scheduled" | "published" | "archived";
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  featuredImage?: string;
  readTime: string; // e.g. "5 min read"
  views: number;
  companyId: string;
}

export const mockBlogCategories: BlogCategory[] = [
  { id: "cat-1", name: "Technology", slug: "technology", description: "Trends, updates, and deep dives into current tech" },
  { id: "cat-2", name: "Business", slug: "business", description: "Corporate insights, productivity tips, and operations" },
  { id: "cat-3", name: "Tutorials", slug: "tutorials", description: "Step-by-step developer and system administration guides" },
  { id: "cat-4", name: "Company News", slug: "company-news", description: "Updates, press releases, and milestones from TechGadgets" },
];

export const mockBlogTags: BlogTag[] = [
  { id: "tag-1", name: "AI", slug: "ai" },
  { id: "tag-2", name: "Cloud", slug: "cloud" },
  { id: "tag-3", name: "Productivity", slug: "productivity" },
  { id: "tag-4", name: "Hardware", slug: "hardware" },
  { id: "tag-5", name: "Security", slug: "security" },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    title: "How Generative AI is Reshaping Corporate IT Procurement",
    slug: "generative-ai-it-procurement",
    summary: "Exploring the shift in how organizations select, budget, and provision enterprise devices using AI decision tools.",
    content: "Generative AI is changing the landscape of IT procurement. From parsing complex spec sheets to forecasting upgrade cycles...",
    status: "published",
    authorId: "user-1",
    authorName: "Admin User",
    categoryId: "cat-1",
    categoryName: "Technology",
    tags: ["AI", "Hardware"],
    publishedAt: "2026-05-15T09:00:00Z",
    createdAt: "2026-05-14T10:00:00Z",
    updatedAt: "2026-06-01T12:00:00Z",
    featuredImage: "/images/blog/ai-procurement.jpg",
    readTime: "6 min read",
    views: 1250,
    companyId: "co2",
  },
  {
    id: "post-2",
    title: "Setting Up Multi-Tenant ERP Workspaces: Best Practices",
    slug: "multi-tenant-erp-workspaces-setup",
    summary: "A practical guide to structuring parent-subsidiary company branches, shared ledgers, and workspace settings.",
    content: "When deploying a modular ERP monolith, workspace structure is your foundation. Here is how to configure companies, branches, and custom domains...",
    status: "published",
    authorId: "user-2",
    authorName: "Sarah Connor",
    categoryId: "cat-3",
    categoryName: "Tutorials",
    tags: ["Cloud", "Security"],
    publishedAt: "2026-06-01T11:00:00Z",
    createdAt: "2026-05-30T09:00:00Z",
    updatedAt: "2026-06-15T10:00:00Z",
    featuredImage: "/images/blog/erp-workspaces.jpg",
    readTime: "8 min read",
    views: 940,
    companyId: "co2",
  },
  {
    id: "post-3",
    title: "TechGadgets BD Named Top 50 Enterprise Enablers of 2026",
    slug: "techgadgets-named-top-50-enterprise-enablers",
    summary: "We are honored to be recognized for our hardware staging and custom software deployment support for leading firms.",
    content: "This morning, the national technology council released its list of top enterprise enablers. We are incredibly proud of our team...",
    status: "published",
    authorId: "user-1",
    authorName: "Admin User",
    categoryId: "cat-4",
    categoryName: "Company News",
    tags: ["Hardware"],
    publishedAt: "2026-06-10T08:00:00Z",
    createdAt: "2026-06-09T08:00:00Z",
    updatedAt: "2026-06-10T08:00:00Z",
    featuredImage: "/images/blog/company-award.jpg",
    readTime: "3 min read",
    views: 450,
    companyId: "co2",
  },
  {
    id: "post-4",
    title: "Understanding CSS Glassmorphism in Modern Dashboards",
    slug: "understanding-css-glassmorphism",
    summary: "How to use backdrop-filter, harmonious opacity layers, and blur effects for beautiful, responsive web layouts.",
    content: "Glassmorphism is a key trend in premium dashboard interfaces. By layering translucent borders, we can achieve high-fidelity UX...",
    status: "scheduled",
    authorId: "user-3",
    authorName: "John Doe",
    categoryId: "cat-1",
    categoryName: "Technology",
    tags: ["Productivity"],
    publishedAt: "2026-06-25T09:00:00Z",
    createdAt: "2026-06-18T15:00:00Z",
    updatedAt: "2026-06-19T10:00:00Z",
    featuredImage: "/images/blog/glassmorphism.jpg",
    readTime: "5 min read",
    views: 0,
    companyId: "co2",
  },
  {
    id: "post-5",
    title: "Zero Trust Security Checklist for Hybrid Office Deployments",
    slug: "zero-trust-security-checklist",
    summary: "Simple security changes you can apply to your network routers, shared devices, and employee authentication gateways.",
    content: "With remote and hybrid operations, corporate local networks are no longer trust boundaries. Here is the checklist...",
    status: "draft",
    authorId: "user-2",
    authorName: "Sarah Connor",
    categoryId: "cat-1",
    categoryName: "Technology",
    tags: ["Security"],
    createdAt: "2026-06-19T14:00:00Z",
    updatedAt: "2026-06-19T16:00:00Z",
    featuredImage: "/images/blog/security.jpg",
    readTime: "7 min read",
    views: 0,
    companyId: "co2",
  },
];
