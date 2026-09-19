import * as React from "react";
import { fieldClass, selectPlaceholderClass, type FieldState } from "@/components/ui/form";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    FieldState {
  /** Renders an empty first option; the field shows placeholder color while it's selected. */
  placeholder?: string;
}

/** Native <select> in the sitewide form style (see components/ui/form.tsx). */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, valid, tone, placeholder, children, value, defaultValue, ...props }, ref) => {
    const empty = placeholder !== undefined && (value ?? defaultValue ?? "") === "";
    return (
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        className={fieldClass({ invalid, valid, tone }, [empty ? selectPlaceholderClass(tone) : "", className].filter(Boolean).join(" "))}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
