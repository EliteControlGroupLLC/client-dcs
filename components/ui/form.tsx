import * as React from "react";
import { AlertCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sitewide form language — the single source for every form field.
 * Matches the lead-gate form (components/lead-gate): 44px (h-11) fields,
 * rounded-lg, text-sm, xs muted labels, xs inline errors, and a soft red
 * alert box for form-level errors.
 *
 *   <FormField label="Email *" htmlFor="c-email" icon={Mail} error={errors.email}>
 *     <Input id="c-email" type="email" invalid={!!errors.email} ... />
 *   </FormField>
 *   <FormAlert>{submitError}</FormAlert>
 *
 * On dark surfaces pass tone="dark" to every piece (field, label, error, alert):
 *   <FormField tone="dark" label="Email *" htmlFor="c-email" error={errors.email}>
 *     <Input tone="dark" id="c-email" invalid={!!errors.email} />
 *   </FormField>
 */

/**
 * "light" = white field on a white/muted surface (original look).
 * "dark"  = field on the all-dark site (bg-secondary / bg-secondary-light cards):
 *           bg-secondary fill, white/15 border, white text, gold focus ring.
 */
export type FormTone = "light" | "dark";

export type FieldState = {
  /** Error styling (soft red fill + red border). */
  invalid?: boolean;
  /** Confirmed-valid styling (soft emerald fill; leaves room for a trailing check icon). */
  valid?: boolean;
  /** Surface the field sits on. Default "light". */
  tone?: FormTone;
};

const FIELD_SHAPE =
  "w-full h-11 px-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

const FIELD_LIGHT =
  "border-input bg-background text-secondary placeholder:text-muted-foreground/70 focus:ring-primary/30 focus:border-primary";

// color-scheme:dark makes native pickers/scrollbars/autofill dark; the option
// classes keep a native <select>'s dropdown list readable (dark bg, white text).
const FIELD_DARK =
  "[color-scheme:dark] border-white/15 bg-secondary text-white placeholder:text-white/50 focus:ring-accent/30 focus:border-accent [&_option]:bg-secondary [&_option]:text-white";

/** Class string for a text field. Use on raw <input>/<select>/<textarea> when a component can't be used. */
export function fieldClass({ invalid, valid, tone = "light" }: FieldState = {}, className?: string): string {
  const dark = tone === "dark";
  return cn(
    FIELD_SHAPE,
    dark ? FIELD_DARK : FIELD_LIGHT,
    invalid
      ? dark
        ? // Keep the dark fill; tint it with a thin red wash (no muddy grey).
          "border-red-400/80 bg-[linear-gradient(rgba(248,113,113,0.10),rgba(248,113,113,0.10))]"
        : "border-destructive-border bg-destructive-soft"
      : valid
        ? dark
          ? "border-primary-light/60 bg-[linear-gradient(rgba(111,163,163,0.14),rgba(111,163,163,0.14))] pr-9"
          : "border-primary/40 bg-primary/5 pr-9"
        : null,
    className
  );
}

/** Class string for a field label. */
export const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";
/** Label on dark surfaces (white/75 — AA on secondary and secondary-light). */
export const labelClassDark = "block text-xs font-medium text-white/75 mb-1.5";

/** Pick the label class for a tone. */
export function labelClassFor(tone: FormTone = "light"): string {
  return tone === "dark" ? labelClassDark : labelClass;
}

/** Placeholder text color for an empty native <select> (matches input placeholders). */
export function selectPlaceholderClass(tone: FormTone = "light"): string {
  return tone === "dark" ? "text-white/50" : "text-muted-foreground/70";
}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Optional leading lucide icon (rendered 12px, inline). */
  icon?: LucideIcon;
  tone?: FormTone;
}

export function Label({ className, icon: Icon, tone = "light", children, ...props }: LabelProps) {
  return (
    <label className={cn(labelClassFor(tone), className)} {...props}>
      {Icon && <Icon className="h-3 w-3 inline mr-1 align-[-1px]" aria-hidden="true" />}
      {children}
    </label>
  );
}

/** Inline, per-field error message. Renders nothing without a message. */
export function FieldError({
  message,
  className,
  id,
  tone = "light",
}: {
  message?: string | null;
  className?: string;
  id?: string;
  tone?: FormTone;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      className={cn("text-xs mt-1 flex items-center gap-1", tone === "dark" ? "text-red-300" : "text-destructive", className)}
      role="alert"
    >
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/** Form-level error box (e.g. "Something went wrong — please call us"). Renders nothing when empty. */
export function FormAlert({
  children,
  className,
  tone = "light",
}: {
  children?: React.ReactNode;
  className?: string;
  tone?: FormTone;
}) {
  if (children === null || children === undefined || children === false || children === "") return null;
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "border rounded-lg p-3",
        dark ? "bg-red-500/10 border-red-400/40" : "bg-destructive-soft border-destructive-line",
        className
      )}
      role="alert"
    >
      <p className={cn("text-sm flex items-start gap-2", dark ? "text-red-200" : "text-destructive")}>
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
        <span>{children}</span>
      </p>
    </div>
  );
}

export interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  icon?: LucideIcon;
  error?: string | null;
  /** Optional helper text under the field (hidden while an error shows). */
  hint?: React.ReactNode;
  /** Surface tone for the label/error/hint (pass the same tone to the control). */
  tone?: FormTone;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + inline error, stacked with the standard spacing. */
export function FormField({ label, htmlFor, icon, error, hint, tone = "light", className, children }: FormFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label htmlFor={htmlFor} icon={icon} tone={tone}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <FieldError message={error} tone={tone} />
      ) : hint ? (
        <p className={cn("text-xs mt-1", tone === "dark" ? "text-white/70" : "text-muted-foreground")}>{hint}</p>
      ) : null}
    </div>
  );
}
