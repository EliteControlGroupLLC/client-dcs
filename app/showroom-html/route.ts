import { getShowroomInstallResponse } from "@/lib/showroom-install";

export async function GET() {
  return getShowroomInstallResponse();
}
