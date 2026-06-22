"use client";

import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="rounded-xl border border-border/60 bg-card px-4 py-6 text-center sm:px-6">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-4 w-4" />
        </div>
        <h2 className="mt-3 text-base font-semibold sm:text-lg">Get 10% off your first order</h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Join our newsletter for exclusive deals, new arrivals, and style tips.
        </p>
        {submitted ? (
          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-600">
            <Sparkles className="h-4 w-4" />
            Thanks! Check your inbox for your welcome offer.
          </p>
        ) : (
          <form
            className="mt-6 flex w-full flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 flex-1 text-xs"
            />
            <Button type="submit" size="sm" className="h-8 px-4">
              Subscribe
            </Button>
          </form>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
