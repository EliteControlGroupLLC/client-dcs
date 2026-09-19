import * as React from "react";
import { fieldClass, FormField, type FieldState } from "@/components/ui/form";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FieldState {
  /** Convenience: wraps the input in <FormField> with this label. */
  label?: string;
  /** Convenience: shows an inline error below and applies invalid styling. */
  error?: string;
}

/**
 * Text input in the sitewide form style (see components/ui/form.tsx).
 * Without `label`/`error` it renders a bare <input>, so it drops in anywhere
 * a raw `<input className={inputClass(...)}>` was used.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, invalid, valid, tone, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? (label ? autoId : undefined);
    const input = (
      <input
        id={inputId}
        type={type}
        ref={ref}
        aria-invalid={invalid || !!error || undefined}
        className={fieldClass({ invalid: invalid || !!error, valid, tone }, className)}
        {...props}
      />
    );
    if (!label && !error) return input;
    return (
      <FormField label={label} htmlFor={inputId} error={error} tone={tone}>
        {input}
      </FormField>
    );
  }
);
Input.displayName = "Input";

export { Input };
