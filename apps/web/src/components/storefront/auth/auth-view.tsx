"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Home, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginButtons } from "@/components/storefront/auth/social-login-buttons";
import { useStorefrontAuth } from "@/lib/store/storefront-auth-store";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

type AuthTab = "login" | "register";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const initialLogin: LoginForm = {
  email: "",
  password: "",
  remember: true,
};

const initialRegister: RegisterForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

type AuthViewProps = {
  defaultTab?: AuthTab;
};

export function AuthView({ defaultTab = "login" }: AuthViewProps) {
  const setUser = useStorefrontAuth((s) => s.setUser);
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLogin);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(initialRegister);
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateLogin = () => {
    const next: Partial<Record<keyof LoginForm, string>> = {};
    if (!loginForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      next.email = "Valid email required";
    }
    if (!loginForm.password) next.password = "Password required";
    setLoginErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateRegister = () => {
    const next: Partial<Record<keyof RegisterForm, string>> = {};
    if (!registerForm.name.trim()) next.name = "Required";
    if (!registerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      next.email = "Valid email required";
    }
    if (registerForm.phone.trim() && !/^\+?[\d\s-]{10,}$/.test(registerForm.phone)) {
      next.phone = "Valid phone number";
    }
    if (registerForm.password.length < 6) next.password = "At least 6 characters";
    if (registerForm.password !== registerForm.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    if (!registerForm.acceptTerms) next.acceptTerms = "Accept terms to continue";
    setRegisterErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setUser({
      id: `auth_email_${Date.now()}`,
      name: loginForm.email.split("@")[0] ?? "Customer",
      email: loginForm.email.trim(),
      provider: "email",
    });
    setSubmitting(false);
    toast.success("Welcome back!");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setUser({
      id: `auth_email_${Date.now()}`,
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      phone: registerForm.phone.trim() || undefined,
      provider: "email",
    });
    setSubmitting(false);
    toast.success("Account created successfully!");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <nav className="mb-4 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Account</span>
      </nav>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-4 pt-4">
          <h1 className="text-xl font-bold">Welcome to MoharazNX</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to track orders, save wishlists, and checkout faster.
          </p>

          <div className="mt-4 flex rounded-lg bg-muted/50 p-1">
            {(["login", "register"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                  tab === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {key === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <SocialLoginButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email" error={loginErrors.email}>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm((f) => ({ ...f, email: e.target.value }));
                      setLoginErrors((err) => ({ ...err, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className="pl-8"
                    autoComplete="email"
                  />
                </div>
              </Field>

              <Field label="Password" error={loginErrors.password}>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm((f) => ({ ...f, password: e.target.value }));
                      setLoginErrors((err) => ({ ...err, password: undefined }));
                    }}
                    placeholder="••••••••"
                    className="pl-8 pr-9"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm((f) => ({ ...f, remember: e.target.checked }))}
                    className="rounded border-input"
                  />
                  Remember me
                </label>
                <button type="button" className="font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="h-10 w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Full name" error={registerErrors.name}>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={registerForm.name}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, name: e.target.value }));
                      setRegisterErrors((err) => ({ ...err, name: undefined }));
                    }}
                    placeholder="Your name"
                    className="pl-8"
                    autoComplete="name"
                  />
                </div>
              </Field>

              <Field label="Email" error={registerErrors.email}>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, email: e.target.value }));
                      setRegisterErrors((err) => ({ ...err, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className="pl-8"
                    autoComplete="email"
                  />
                </div>
              </Field>

              <Field label="Phone" hint="Optional" error={registerErrors.phone}>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, phone: e.target.value }));
                      setRegisterErrors((err) => ({ ...err, phone: undefined }));
                    }}
                    placeholder="+880 1XXX-XXXXXX"
                    className="pl-8"
                    autoComplete="tel"
                  />
                </div>
              </Field>

              <Field label="Password" error={registerErrors.password}>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, password: e.target.value }));
                      setRegisterErrors((err) => ({ ...err, password: undefined }));
                    }}
                    placeholder="At least 6 characters"
                    className="pl-8"
                    autoComplete="new-password"
                  />
                </div>
              </Field>

              <Field label="Confirm password" error={registerErrors.confirmPassword}>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={(e) => {
                      setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }));
                      setRegisterErrors((err) => ({ ...err, confirmPassword: undefined }));
                    }}
                    placeholder="Repeat password"
                    className="pl-8"
                    autoComplete="new-password"
                  />
                </div>
              </Field>

              <label className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={registerForm.acceptTerms}
                  onChange={(e) => {
                    setRegisterForm((f) => ({ ...f, acceptTerms: e.target.checked }));
                    setRegisterErrors((err) => ({ ...err, acceptTerms: undefined }));
                  }}
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  I agree to the{" "}
                  <Link href={storefrontPaths.shipping} className="font-medium text-primary hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href={storefrontPaths.privacy} className="font-medium text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {registerErrors.acceptTerms && (
                <p className="-mt-2 text-[11px] text-destructive">{registerErrors.acceptTerms}</p>
              )}

              <Button type="submit" className="h-10 w-full" disabled={submitting}>
                {submitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        By continuing, you agree to MoharazNX&apos;s terms of service and privacy policy.
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs">
        {label}
        {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
