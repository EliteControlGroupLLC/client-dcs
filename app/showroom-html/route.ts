import { getShowroomInstallResponse } from "@/lib/showroom-install";

export async function GET(request: Request) {
  return getShowroomInstallResponse(request);
}
