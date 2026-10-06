"use client";

// The "enter the code we texted you" panel, shared by the contact form and the
// paid-ad lead form so both read exactly like the tool gate's step 2.
//
// Deliberately small: a number, a code, done. Someone asking a question is not
// unlocking anything, and the step should not feel like an interrogation.

import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, FormAlert, Label, fieldClass, type FormTone } from "@/components/ui/form";

export interface PhoneCodeStepProps {
  /** The number the code went to, shown back to the visitor. */
  phone: string;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  /** Back to the form, to fix the number. */
  onBack: () => void;
  onResend: () => void;
  resendCooldown: number;
  sending: boolean;
  verifying: boolean;
  submitting: boolean;
  codeError?: string;
  formError?: string;
  /** Button label once the code checks out, e.g. "Send Message". */
  confirmLabel?: string;
  heading?: string;
  tone?: FormTone;
}

export function PhoneCodeStep({
  phone,
  code,
  onCodeChange,
  onSubmit,
  onBack,
  onResend,
  resendCooldown,
  sending,
  verifying,
  submitting,
  codeError,
  formError,
  confirmLabel = "Verify & Send",
  heading = "Enter the code we texted you",
  tone = "dark",
}: PhoneCodeStepProps) {
  const dark = tone === "dark";
  const busy = verifying || submitting;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
      noValidate
    >
      <div>
        <h3 className={`text-xl font-semibold ${dark ? "text-white" : "text-secondary"}`}>{heading}</h3>
        <p className={`text-sm mt-1 ${dark ? "text-white/75" : "text-muted-foreground"}`}>
          Sent to <strong className={dark ? "text-white" : "text-secondary"}>{phone}</strong>. This is
          the only way we can tell a real enquiry from a bot.
        </p>
      </div>

      <div>
        <Label tone={tone} htmlFor="pcs-code">
          Verification Code
        </Label>
        <input
          id="pcs-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ""))}
          placeholder="6-digit code"
          className={fieldClass(
            { invalid: !!codeError, tone },
            "h-12 text-lg text-center tracking-widest tabular-nums"
          )}
        />
        <FieldError tone={tone} message={codeError} />
      </div>

      <FormAlert tone={tone}>{formError}</FormAlert>

      <Button
        type="submit"
        size="lg"
        rounded="full"
        className="w-full"
        disabled={busy || code.length < 4}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {verifying ? "Verifying…" : "Sending…"}
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            {confirmLabel}
          </>
        )}
      </Button>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-1 min-h-11 transition-colors ${
            dark ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-secondary"
          }`}
        >
          <ArrowLeft className="h-3 w-3" />
          Use a different number
        </button>
        {resendCooldown > 0 ? (
          <span
            className={`inline-flex items-center min-h-11 ${dark ? "text-white/75" : "text-muted-foreground"}`}
          >
            Resend code in {resendCooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={sending}
            className={`inline-flex items-center min-h-11 font-medium hover:underline disabled:opacity-50 ${
              dark ? "text-accent-light hover:text-white" : "text-primary hover:text-secondary"
            }`}
          >
            {sending ? "Sending…" : "Didn't get it? Resend code"}
          </button>
        )}
      </div>
    </form>
  );
}
