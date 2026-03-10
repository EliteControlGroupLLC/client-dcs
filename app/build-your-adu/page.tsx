import { ADUProvider } from "@/lib/contexts/adu-context";
import { ADUBuilder } from "@/components/adu-builder/adu-builder";

export const metadata = {
  title: "Build Your ADU | Distinct Construction Solutions",
  description: "Design your perfect ADU with our interactive configurator. Get instant pricing, explore floor plans, and visualize your future space.",
};

export default function BuildYourADUPage() {
  return (
    <ADUProvider>
      <ADUBuilder />
    </ADUProvider>
  );
}
