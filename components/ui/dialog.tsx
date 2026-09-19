"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

type DialogTone = "light" | "dark"
const DialogToneContext = React.createContext<DialogTone>("light")

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * "dark" = all-dark site panel: bg-secondary-light, white/10 hairline, white
   * text, dark close button. DialogTitle/DialogDescription follow the tone.
   */
  tone?: DialogTone
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, tone = "light", ...props }, ref) => {
  const dark = tone === "dark"
  return (
    <DialogPortal>
      <DialogOverlay className={dark ? "bg-black/70" : undefined} />
      <DialogToneContext.Provider value={tone}>
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            // Mobile gutter (1rem each side), capped height with internal scroll,
            // and min-w-0 children so long content can't push the panel wider.
            "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-2xl border p-6 shadow-2xl [&>*]:min-w-0",
            dark
              ? "border-white/10 bg-secondary-light text-white shadow-black/40 [color-scheme:dark]"
              : "border-border bg-background",
            className
          )}
          {...props}
        >
          {children}
          {/* 44px tap target — same close button as the Instant Estimate modal */}
          <DialogPrimitive.Close
            className={cn(
              "absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none",
              dark
                ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white focus-visible:ring-accent"
                : "bg-muted text-muted-foreground hover:bg-border hover:text-secondary focus-visible:ring-ring"
            )}
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogToneContext.Provider>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Left-aligned like the Instant Estimate modal; right padding clears the close button
      "flex flex-col space-y-1.5 pr-12 text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const tone = React.useContext(DialogToneContext)
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "text-xl font-bold leading-tight",
        tone === "dark" ? "text-white" : "text-secondary",
        className
      )}
      {...props}
    />
  )
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const tone = React.useContext(DialogToneContext)
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm", tone === "dark" ? "text-white/75" : "text-muted-foreground", className)}
      {...props}
    />
  )
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
