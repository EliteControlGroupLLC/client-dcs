import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADU Floor Plans",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
