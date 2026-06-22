"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Home,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CAREER_BENEFITS,
  CAREER_DEPARTMENTS,
  careersEmail,
  filterJobs,
  type JobDepartment,
  type JobOpening,
} from "@/lib/mock-data/storefront-careers";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

function JobCard({
  job,
  selected,
  onSelect,
}: {
  job: JobOpening;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition",
        selected ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:border-primary/40",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-semibold">{job.title}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{job.type}</span>
      </div>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        {job.location}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">{job.summary}</p>
    </button>
  );
}

export function CareersView() {
  const [department, setDepartment] = useState<JobDepartment>("all");
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const jobs = useMemo(() => filterJobs(department), [department]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Careers</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold sm:text-2xl">Join MoharazNX</h1>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground sm:text-sm">
          Help us build the future of ecommerce in Bangladesh. We&apos;re always looking for curious, kind people.
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Why work with us</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CAREER_BENEFITS.map((b) => (
            <div key={b.title} className="rounded-lg border border-border/60 bg-card p-3">
              <p className="text-xs font-semibold">{b.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-4">
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                Open roles
                <span className="font-normal text-muted-foreground">({jobs.length})</span>
              </h2>
            </div>

            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CAREER_DEPARTMENTS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDepartment(d.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    department === d.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-card hover:border-primary/40",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedJob?.id === job.id}
                  onSelect={() => setSelectedJob(job)}
                />
              ))}
            </div>

            {jobs.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No open roles in this team right now.</p>
            )}
          </section>

          <section className="rounded-lg border border-border/60 bg-card p-4">
            <h2 className="text-sm font-semibold">General application</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Don&apos;t see a perfect fit? Tell us about yourself — we keep strong profiles on file.
            </p>

            {submitted ? (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-emerald-600">Application received!</p>
                <p className="mt-1 text-xs text-muted-foreground">We&apos;ll review and get back within 2 weeks.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="mt-4 space-y-3">
                {selectedJob && (
                  <p className="rounded-md bg-primary/5 px-2.5 py-1.5 text-[11px]">
                    Applying for: <strong>{selectedJob.title}</strong>
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-8 text-xs" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-8 text-xs" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Cover note</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 min-h-[80px] text-xs"
                    placeholder="Brief intro + link to CV or LinkedIn"
                    required
                  />
                </div>
                <Button type="submit" size="sm" className="h-8">
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Submit application
                </Button>
              </form>
            )}
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-16">
          <section className="rounded-lg border border-border/60 bg-card p-3">
            <h2 className="text-xs font-semibold">Hiring process</h2>
            <ol className="mt-2 space-y-2 text-[11px] text-muted-foreground">
              <li><span className="font-semibold text-foreground">1.</span> Apply online</li>
              <li><span className="font-semibold text-foreground">2.</span> Screen call (30 min)</li>
              <li><span className="font-semibold text-foreground">3.</span> Skills interview</li>
              <li><span className="font-semibold text-foreground">4.</span> Team meet & offer</li>
            </ol>
          </section>

          <section className="rounded-lg border border-border/60 bg-card p-3">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Email us
            </h2>
            <a href={`mailto:${careersEmail}`} className="mt-2 block text-xs font-medium text-primary hover:underline">
              {careersEmail}
            </a>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Attach CV (PDF) and portfolio links if applicable.
            </p>
          </section>

          <Button asChild variant="outline" size="sm" className="h-8 w-full text-xs">
            <Link href={storefrontPaths.about}>About MoharazNX</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
