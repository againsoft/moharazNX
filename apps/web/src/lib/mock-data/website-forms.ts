export interface FormField {
  label: string;
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  required: boolean;
  options?: string[]; // for select dropdowns
}

export interface WebsiteForm {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
  fields: FormField[];
  submissionsCount: number;
  createdAt: string;
  companyId: string;
}

export interface WebsiteFormSubmission {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, string>;
  contactId?: string;
  contactName?: string;
  status: "unread" | "read" | "converted" | "spam";
  submittedAt: string;
  companyId: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: string;
  companyId: string;
}

export const mockWebsiteForms: WebsiteForm[] = [
  {
    id: "form-1",
    name: "Standard Contact Us",
    code: "contact-us",
    status: "active",
    fields: [
      { label: "Full Name", name: "fullName", type: "text", required: true },
      { label: "Email Address", name: "email", type: "email", required: true },
      { label: "Phone Number", name: "phone", type: "tel", required: false },
      { label: "Company Name", name: "company", type: "text", required: false },
      { label: "How can we help?", name: "message", type: "textarea", required: true },
    ],
    submissionsCount: 154,
    createdAt: "2026-01-02T09:00:00Z",
    companyId: "co2",
  },
  {
    id: "form-2",
    name: "Request a Staging Quote",
    code: "request-quote",
    status: "active",
    fields: [
      { label: "Business Name", name: "businessName", type: "text", required: true },
      { label: "Contact Person", name: "contactPerson", type: "text", required: true },
      { label: "Email", name: "email", type: "email", required: true },
      { label: "Approximate Device Volume", name: "deviceVolume", type: "select", required: true, options: ["1-50 devices", "51-200 devices", "201-500 devices", "500+ devices"] },
      { label: "Staging Requirements", name: "requirements", type: "textarea", required: true },
    ],
    submissionsCount: 42,
    createdAt: "2026-02-15T11:00:00Z",
    companyId: "co2",
  },
  {
    id: "form-3",
    name: "Newsletter Sign Up",
    code: "newsletter-signup",
    status: "active",
    fields: [
      { label: "Email Address", name: "email", type: "email", required: true },
    ],
    submissionsCount: 320,
    createdAt: "2026-01-01T00:00:00Z",
    companyId: "co2",
  },
];

export const mockWebsiteFormSubmissions: WebsiteFormSubmission[] = [
  {
    id: "sub-1",
    formId: "form-1",
    formName: "Standard Contact Us",
    data: {
      fullName: "Imran Ahmed",
      email: "imran@example.com",
      phone: "+8801722334455",
      company: "Imran Soft Ltd",
      message: "We need to set up a new local server framework. Do you provide staging services for custom configurations?",
    },
    contactId: "contact-101",
    contactName: "Imran Ahmed",
    status: "unread",
    submittedAt: "2026-06-19T10:15:00Z",
    companyId: "co2",
  },
  {
    id: "sub-2",
    formId: "form-2",
    formName: "Request a Staging Quote",
    data: {
      businessName: "Delta Logistics",
      contactPerson: "Fahmida Chowdhury",
      email: "fahmida@delta.example.com",
      deviceVolume: "51-200 devices",
      requirements: "We need 120 laptops installed with our internal portal, custom network profiles, and anti-virus modules.",
    },
    contactId: "contact-102",
    contactName: "Fahmida Chowdhury",
    status: "converted",
    submittedAt: "2026-06-18T14:20:00Z",
    companyId: "co2",
  },
  {
    id: "sub-3",
    formId: "form-1",
    formName: "Standard Contact Us",
    data: {
      fullName: "Spam Bot",
      email: "spambot@nigerianprince.com",
      phone: "+1234567890",
      company: "Rich Inc",
      message: "Make money fast! Click this link to get rich overnight!",
    },
    status: "spam",
    submittedAt: "2026-06-18T02:00:00Z",
    companyId: "co2",
  },
];

export const mockNewsletterSubscribers: NewsletterSubscriber[] = [
  {
    id: "sub-1",
    email: "customer1@gmail.com",
    status: "subscribed",
    subscribedAt: "2026-01-05T09:00:00Z",
    companyId: "co2",
  },
  {
    id: "sub-2",
    email: "manager@corporate.com",
    status: "subscribed",
    subscribedAt: "2026-02-12T15:30:00Z",
    companyId: "co2",
  },
  {
    id: "sub-3",
    email: "unsub@example.com",
    status: "unsubscribed",
    subscribedAt: "2026-03-01T10:00:00Z",
    companyId: "co2",
  },
];
