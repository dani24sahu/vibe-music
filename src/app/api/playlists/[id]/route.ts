import { jsonError, jsonOk, optionalInt } from "@/app/api/_lib/http";
import { getPlaylist } from "@/server/saavn";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const data = await getPlaylist(id, {
      page: optionalInt(url, "page", 0),
      limit: optionalInt(url, "limit", 50),
    });
    return jsonOk(data, 180);
  } catch (error) {
    return jsonError(error);
  }
}
