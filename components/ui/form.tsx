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
 */

export type FieldState = {
  /** Error styling (soft red fill + red border). */
  invalid?: boolean;
  /** Confirmed-valid styling (soft emerald fill; leaves room for a trailing check icon). */
  valid?: boolean;
};

const FIELD_BASE =
  "w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50";

/** Class string for a text field. Use on raw <input>/<select>/<textarea> when a component can't be used. */
export function fieldClass({ invalid, valid }: FieldState = {}, className?: string): string {
  return cn(
    FIELD_BASE,
    invalid
      ? "border-destructive-border bg-destructive-soft"
      : valid
        ? "border-primary/40 bg-primary/5 pr-9"
        : null,
    className
  );
}

/** Class string for a field label. */
export const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Optional leading lucide icon (rendered 12px, inline). */
  icon?: LucideIcon;
}

export function Label({ className, icon: Icon, children, ...props }: LabelProps) {
  return (
    <label className={cn(labelClass, className)} {...props}>
      {Icon && <Icon className="h-3 w-3 inline mr-1 align-[-1px]" aria-hidden="true" />}
      {children}
    </label>
  );
}

/** Inline, per-field error message. Renders nothing without a message. */
export function FieldError({ message, className, id }: { message?: string | null; className?: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={cn("text-xs text-destructive mt-1 flex items-center gap-1", className)} role="alert">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/** Form-level error box (e.g. "Something went wrong — please call us"). Renders nothing when empty. */
export function FormAlert({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (children === null || children === undefined || children === false || children === "") return null;
  return (
    <div className={cn("bg-destructive-soft border border-destructive-line rounded-lg p-3", className)} role="alert">
      <p className="text-sm text-destructive flex items-start gap-2">
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
  className?: string;
  children: React.ReactNode;
}

/** Label + control + inline error, stacked with the standard spacing. */
export function FormField({ label, htmlFor, icon, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label htmlFor={htmlFor} icon={icon}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <FieldError message={error} />
      ) : hint ? (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
