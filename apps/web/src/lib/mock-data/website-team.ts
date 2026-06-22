export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  department: string;
  email: string;
  companyId: string;
}

export interface CareerListing {
  id: string;
  title: string;
  department: string;
  location: string;
  status: "draft" | "active" | "archived";
  type: "full-time" | "part-time" | "contract";
  description: string;
  requirements: string[];
  salaryRange?: string;
  createdAt: string;
  companyId: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: "new" | "review" | "interview" | "hired" | "rejected";
  appliedDate: string;
  resumeUrl: string;
  coverLetter?: string;
  companyId: string;
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: "team-1",
    name: "Mahmudul Hasan",
    role: "Chief Executive Officer",
    bio: "Founding TechGadgets BD with a mission to simplify IT access for commercial enterprises nationwide. 15+ years experience in systems staging.",
    photo: "/images/team/mahmudul.jpg",
    department: "Executive",
    email: "mahmudul@techgadgets.example.com",
    companyId: "co2",
  },
  {
    id: "team-2",
    name: "Sarah Connor",
    role: "Head of Infrastructure & Cloud",
    bio: "Passionate about network virtualization, hybrid deployments, and zero-trust perimeter configurations.",
    photo: "/images/team/sarah.jpg",
    department: "Engineering",
    email: "sarah@techgadgets.example.com",
    companyId: "co2",
  },
  {
    id: "team-3",
    name: "John Doe",
    role: "Senior Full Stack Architect",
    bio: "Specializes in building Next.js dashboard wrappers, high-throughput backend APIs, and database normalization maps.",
    photo: "/images/team/john.jpg",
    department: "Engineering",
    email: "john@techgadgets.example.com",
    companyId: "co2",
  },
  {
    id: "team-4",
    name: "Amina Khan",
    role: "Lead SEO & Analytics Specialist",
    bio: "Ensures site metrics, semantic tag hierarchy, site mapping, and redirect patterns drive lead conversions.",
    photo: "/images/team/amina.jpg",
    department: "Marketing",
    email: "amina@techgadgets.example.com",
    companyId: "co2",
  },
];

export const mockCareers: CareerListing[] = [
  {
    id: "job-1",
    title: "Junior Cloud Infrastructure Engineer",
    department: "Engineering",
    location: "Dhaka, Bangladesh (Hybrid)",
    status: "active",
    type: "full-time",
    description: "We are seeking a junior cloud enthusiast to assist in provisioning student labs, setting up Ubiquiti access points, and staging MDM configurations.",
    requirements: [
      "Familiarity with basic Linux system administration",
      "Basic understanding of TCP/IP networks and DHCP rules",
      "Experience with AWS or Google Cloud console is a plus",
    ],
    salaryRange: "BDT 35,000 - 50,000 / month",
    createdAt: "2026-06-01T09:00:00Z",
    companyId: "co2",
  },
  {
    id: "job-2",
    title: "SEO Content & Copywriter (AI Assisted)",
    department: "Marketing",
    location: "Remote (Bangladesh)",
    status: "active",
    type: "full-time",
    description: "Join our marketing team to produce engaging technology blogs, portfolio descriptions, and social media announcements using our local AI OS tools.",
    requirements: [
      "Excellent written English and Bengali copywriting skills",
      "Familiarity with keywords, meta tags, and structured schema concepts",
      "Experience driving blog engagement is highly preferred",
    ],
    salaryRange: "BDT 40,000 - 60,000 / month",
    createdAt: "2026-06-10T10:00:00Z",
    companyId: "co2",
  },
  {
    id: "job-3",
    title: "Enterprise Sales Executive",
    department: "Sales",
    location: "Dhaka, Bangladesh (On-site)",
    status: "draft",
    type: "full-time",
    description: "Staging new lead generation paths, managing client portfolios, negotiating quotes, and coordinating bulk hardware procurement agreements.",
    requirements: [
      "3+ years experience selling B2B technology or infrastructure services",
      "Robust network among IT managers and procurement officers in Dhaka",
      "Exceptional negotiation and presentation skill sets",
    ],
    createdAt: "2026-06-18T14:00:00Z",
    companyId: "co2",
  },
];

export const mockJobApplications: JobApplication[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Junior Cloud Infrastructure Engineer",
    applicantName: "Tanvir Rahman",
    applicantEmail: "tanvir@example.com",
    applicantPhone: "+8801711223344",
    status: "interview",
    appliedDate: "2026-06-05T12:00:00Z",
    resumeUrl: "/uploads/resumes/tanvir_resume.pdf",
    coverLetter: "I recently graduated from university and have spent the last 6 months studying AWS architectures. I am very eager to learn about real-world enterprise staging...",
    companyId: "co2",
  },
  {
    id: "app-2",
    jobId: "job-2",
    jobTitle: "SEO Content & Copywriter (AI Assisted)",
    applicantName: "Sadia Alam",
    applicantEmail: "sadia.alam@example.com",
    applicantPhone: "+8801811556677",
    status: "new",
    appliedDate: "2026-06-12T09:30:00Z",
    resumeUrl: "/uploads/resumes/sadia_copywriter.pdf",
    companyId: "co2",
  },
];
