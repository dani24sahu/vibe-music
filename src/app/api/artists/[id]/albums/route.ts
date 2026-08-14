import { jsonError, jsonOk, optionalInt } from "@/app/api/_lib/http";
import { getArtistAlbums } from "@/server/saavn";

export const maxDuration = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const data = await getArtistAlbums(id, {
      page: optionalInt(url, "page", 0),
    });
    return jsonOk(data, 180);
  } catch (error) {
    return jsonError(error);
  }
}
