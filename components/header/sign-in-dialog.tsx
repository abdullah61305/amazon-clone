"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, X } from "lucide-react";
import { signIn } from "@/lib/account";

type Mode = "signin" | "create";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmailOrPhone = (v: string) => EMAIL_RE.test(v.trim()) || v.replace(/[\s()+.-]/g, "").match(/^\d{10,}$/) !== null;

function Wordmark() {
  return (
    <span className="inline-flex flex-col leading-none text-ink" aria-label="amazon clone">
      <span className="text-[28px] font-bold tracking-[-1px]" style={{ fontFamily: "Arial Black, Arial, sans-serif" }}>
        amazon
      </span>
      <svg viewBox="0 0 100 18" className="-mt-[5px] ml-[4px] h-[10px] w-[78%]" aria-hidden>
        <path d="M2 4 Q48 22 90 6" fill="none" stroke="#ff9900" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M82 1 L94 5 L86 14" fill="none" stroke="#ff9900" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Field({
  label,
  error,
  hint,
  children,
  id,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  id: string;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-[3px] block text-[13px] font-bold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 flex items-center gap-1 text-[12px] text-deal">
          <AlertCircle size={13} aria-hidden /> {error}
        </p>
      )}
      {hint}
    </div>
  );
}

/** Amazon-style sign-in / create-account modal. Accounts are kept in this browser's storage. */
export function SignInDialog({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const uid = useId();
  const titleId = `${uid}-title`;

  const errors = submitted
    ? {
        email: isEmailOrPhone(email) ? undefined : "Enter a valid email address or mobile phone number",
        password: password.length >= 6 ? undefined : "Minimum 6 characters required",
      }
    : {};

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(timer.current);
    };
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setSubmitted(false);
    setPassword("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (!isEmailOrPhone(email) || password.length < 6) {
      const firstBad = !isEmailOrPhone(email) ? "email" : "password";
      panel.current?.querySelector<HTMLInputElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setBusy(true);
    timer.current = setTimeout(() => {
      signIn(email, mode === "create" ? name : undefined);
      onClose();
    }, 500);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const items = panel.current.querySelectorAll<HTMLElement>("input:not([disabled]), button:not([disabled]), a[href]");
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const creating = mode === "create";
  const inputClass = (bad?: string) => `field ${bad ? "border-deal! focus:shadow-[0_0_0_3px_#fbd8d4]!" : ""}`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-center sm:items-start sm:overflow-y-auto sm:py-[6vh]" onKeyDown={onKeyDown}>
      <div className="fixed inset-0 animate-fade-in bg-black/50" aria-hidden onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full animate-rise flex-col items-center overflow-y-auto bg-white px-5 pb-8 pt-4 text-ink sm:h-auto sm:w-[400px] sm:overflow-visible sm:rounded-lg sm:shadow-[0_4px_24px_rgba(0,0,0,.3)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full text-muted hover:bg-[#f0f2f2] hover:text-ink"
        >
          <X size={20} />
        </button>
        <div className="mb-3 mt-1">
          <Wordmark />
        </div>

        <form key={mode} noValidate onSubmit={submit} className="w-full rounded-lg border border-[#ddd] px-5 py-4 sm:px-6">
          <h2 id={titleId} className="mb-3 text-[28px] font-normal leading-[1.2]">
            {creating ? "Create account" : "Sign in"}
          </h2>

          {creating && (
            <Field id={`${uid}-name`} label="Your name">
              <input
                id={`${uid}-name`}
                name="name"
                autoFocus
                autoComplete="name"
                placeholder="First and last name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
              />
            </Field>
          )}

          <Field id={`${uid}-email`} label={creating ? "Mobile number or email" : "Email or mobile phone number"} error={errors.email}>
            <input
              id={`${uid}-email`}
              name="email"
              type="text"
              inputMode="email"
              autoFocus={!creating}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${uid}-email-error` : undefined}
              className={inputClass(errors.email)}
            />
          </Field>

          <Field
            id={`${uid}-password`}
            label="Password"
            error={errors.password}
            hint={
              <p id={`${uid}-password-hint`} className="mt-1 text-[12px] leading-[16px] text-muted">
                Use a password you don&apos;t use anywhere else — this store keeps accounts in your browser.
              </p>
            }
          >
            <input
              id={`${uid}-password`}
              name="password"
              type="password"
              autoComplete={creating ? "new-password" : "current-password"}
              placeholder={creating ? "At least 6 characters" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={[errors.password && `${uid}-password-error`, `${uid}-password-hint`].filter(Boolean).join(" ")}
              className={inputClass(errors.password)}
            />
          </Field>

          <button type="submit" disabled={busy} aria-busy={busy} className="btn-yellow mt-1 w-full gap-2 rounded-lg py-[7px]">
            {busy && <Loader2 size={15} className="animate-spin" aria-hidden />}
            {busy ? (creating ? "Creating account…" : "Signing in…") : creating ? "Create account" : "Sign in"}
          </button>

          <p className="mt-4 text-[12px] leading-[18px]">
            By continuing, you agree to the store&apos;s <span className="text-link">Conditions of Use</span> and{" "}
            <span className="text-link">Privacy Notice</span>.
          </p>
        </form>

        {creating ? (
          <p className="mt-4 w-full text-[13px]">
            Already have an account?{" "}
            <button type="button" className="link" onClick={() => switchMode("signin")} disabled={busy}>
              Sign in ›
            </button>
          </p>
        ) : (
          <div className="mt-5 w-full">
            <div className="relative mb-3 text-center text-[12px] text-muted before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-[#e7e7e7]">
              <span className="relative bg-white px-2">New customer?</span>
            </div>
            <button type="button" className="btn-white w-full rounded-lg py-[7px]" onClick={() => switchMode("create")} disabled={busy}>
              Create your account
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
