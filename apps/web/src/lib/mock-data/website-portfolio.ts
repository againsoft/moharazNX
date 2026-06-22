export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  projectUrl?: string;
  completedDate?: string;
  status: "draft" | "published";
  images: string[];
  companyId: string;
}

export const mockPortfolioCategories = [
  "IT infrastructure",
  "Cloud Integration",
  "Hardware Deployment",
  "Security Audit",
];

export const mockPortfolioItems: PortfolioItem[] = [
  {
    id: "port-1",
    title: "100+ Node Hybrid Cloud Migration",
    slug: "hybrid-cloud-migration-100-nodes",
    clientName: "Apex Retail Group",
    description: "Architected and executed zero-downtime database migration and load balancer configuration for high-traffic commerce.",
    content: "Apex Retail was scaling past their dedicated server capacity. We designed a hybrid environment connecting local staging databases to AWS RDS...",
    category: "Cloud Integration",
    tags: ["AWS", "Kubernetes", "PostgreSQL"],
    projectUrl: "https://apexretail.example.com",
    completedDate: "2026-03-15",
    status: "published",
    images: ["/images/portfolio/cloud-apex-1.jpg", "/images/portfolio/cloud-apex-2.jpg"],
    companyId: "co2",
  },
  {
    id: "port-2",
    title: "Corporate HQ Zero Trust Staging & Audit",
    slug: "corporate-hq-zero-trust",
    clientName: "Zenith Bank BD",
    description: "Hardened internal employee active directory, Wi-Fi networks, and configured dynamic VPN access gates.",
    content: "For Zenith Bank's new Dhaka headquarters, security was paramount. We set up hardware firewalls, physical port authentication, and a custom WireGuard gateway...",
    category: "Security Audit",
    tags: ["WireGuard", "Active Directory", "Firewall"],
    completedDate: "2026-04-20",
    status: "published",
    images: ["/images/portfolio/zenith-security.jpg"],
    companyId: "co2",
  },
  {
    id: "port-3",
    title: "High-Density Wi-Fi & Device Deployment",
    slug: "high-density-wifi-device-deployment",
    clientName: "University of Science & Tech",
    description: "Provisioned and staged 500+ student laptops, 80 high-range access points, and configured campus-wide network rules.",
    content: "Staged, tagged, and enrolled 500 student laptops in MDM within 5 working days. Placed and calibrated 80 access points across 4 buildings...",
    category: "Hardware Deployment",
    tags: ["MDM", "Ubiquiti", "Staging"],
    completedDate: "2026-05-30",
    status: "published",
    images: ["/images/portfolio/university-network.jpg"],
    companyId: "co2",
  },
  {
    id: "port-4",
    title: "Automated Inventory Sync API Hook",
    slug: "automated-inventory-sync-api",
    clientName: "UrbanWear Logistics",
    description: "Developed custom webhook bridges between local barcode scanner systems and main cloud ERP inventory tables.",
    content: "Custom bridge to push local scanner updates directly to ERP via SSE. Reduced inventory delta delay from 12 hours to 2 seconds...",
    category: "IT Infrastructure",
    tags: ["Webhooks", "Server-Sent Events", "Go"],
    status: "draft",
    images: ["/images/portfolio/inventory-bridge.jpg"],
    companyId: "co2",
  },
];
