import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "San Diego ADU Offer",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
