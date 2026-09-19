"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CardTone = "light" | "dark";
const CardToneContext = React.createContext<CardTone>("light");

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * "dark" = the all-dark site's LIFE card: solid bg-secondary-light, white/10
   * hairline, shadow-black/20, white text. CardTitle/CardDescription follow.
   */
  tone?: CardTone;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone = "light", ...props }, ref) => (
    <CardToneContext.Provider value={tone}>
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border",
          tone === "dark"
            ? "border-white/10 bg-secondary-light text-white shadow-lg shadow-black/20"
            : "border-border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      />
    </CardToneContext.Provider>
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const tone = React.useContext(CardToneContext);
  return (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold leading-tight", tone === "dark" ? "text-white" : "text-secondary", className)}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const tone = React.useContext(CardToneContext);
  return (
    <p
      ref={ref}
      className={cn("text-sm", tone === "dark" ? "text-white/75" : "text-muted-foreground", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
