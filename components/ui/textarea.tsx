import * as React from "react";
import { fieldClass, type FieldState } from "@/components/ui/form";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldState {}

/** Multi-line field in the sitewide form style (see components/ui/form.tsx). */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, valid, tone, rows = 5, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={fieldClass({ invalid, valid, tone }, ["h-auto py-2.5 resize-none", className].filter(Boolean).join(" "))}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
