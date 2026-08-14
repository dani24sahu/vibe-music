import { jsonError, jsonOk, optionalInt } from "@/app/api/_lib/http";
import { getArtist } from "@/server/saavn";

export const maxDuration = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const data = await getArtist(id, {
      page: optionalInt(url, "page", 0),
      songCount: optionalInt(url, "songCount", 20),
      albumCount: optionalInt(url, "albumCount", 10),
    });
    return jsonOk(data, 180);
  } catch (error) {
    return jsonError(error);
  }
}
