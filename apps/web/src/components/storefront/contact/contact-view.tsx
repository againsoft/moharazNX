"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_FAQ_LINKS,
  CONTACT_SUBJECTS,
  storeContact,
  type ContactSubject,
} from "@/lib/mock-data/storefront-contact";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject;
  message: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "General inquiry",
  message: "",
};

export function ContactView() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Valid email required";
    }
    if (!form.message.trim()) next.message = "Please enter a message";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
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
        <span className="font-medium text-foreground">Contact</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold sm:text-2xl">Contact us</h1>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground sm:text-sm">
          Questions about an order, product, or partnership? We typically reply within 24 hours.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <div className="rounded-lg border border-border/60 bg-card p-4 sm:p-5">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
                <Send className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold">Message sent</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Thanks {form.name.split(" ")[0]} — we&apos;ll get back to you at {form.email} soon.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSubmitted(false); setForm(initial); }}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Send a message</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-1.5 h-8 text-xs"
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-1.5 h-8 text-xs"
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1.5 h-8 text-xs"
                  />
                  {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    id="subject"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    className="mt-1.5 h-8 w-full text-xs"
                  >
                    {CONTACT_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className="mt-1.5 min-h-[120px] text-xs"
                    placeholder="How can we help?"
                  />
                  {errors.message && <p className="mt-1 text-[11px] text-red-500">{errors.message}</p>}
                </div>
              </div>

              <Button type="submit" className="h-9 w-full sm:w-auto" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded-lg border border-border/60 bg-card p-3">
            <h2 className="text-xs font-semibold">Get in touch</h2>
            <ul className="mt-2.5 space-y-2.5 text-xs">
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <a href={`mailto:${storeContact.email}`} className="hover:text-primary">
                  {storeContact.email}
                </a>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <a href={`tel:${storeContact.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {storeContact.phone}
                </a>
              </li>
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="text-muted-foreground">{storeContact.address}</span>
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-border/60 bg-card p-3">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Support hours
            </h2>
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {storeContact.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-2">
                  <span>{h.days}</span>
                  <span className="font-medium text-foreground">{h.time}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-border/60 bg-card p-3">
            <h2 className="text-xs font-semibold">Quick help</h2>
            <ul className="mt-2 space-y-1.5">
              {CONTACT_FAQ_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[11px] text-primary hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
