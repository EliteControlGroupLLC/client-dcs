import { getShowroomAssetResponse } from "@/lib/showroom-install";

type Context = {
  params: Promise<{
    assetPath: string[];
  }>;
};

export async function GET(_: Request, context: Context) {
  const { assetPath } = await context.params;
  return getShowroomAssetResponse(assetPath);
}
