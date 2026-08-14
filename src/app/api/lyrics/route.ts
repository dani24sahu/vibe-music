import { jsonError, jsonOk, optionalInt, requiredQuery } from "@/app/api/_lib/http";
import { getLyrics } from "@/server/lyrics";

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await getLyrics({
      title: requiredQuery(url, "title"),
      artist: requiredQuery(url, "artist"),
      album: url.searchParams.get("album"),
      duration: optionalInt(url, "duration"),
    });
    return jsonOk(data, data.found ? 3600 : 90);
  } catch (error) {
    return jsonError(error);
  }
}
