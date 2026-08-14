import { jsonError, jsonOk, optionalInt, requiredQuery } from "@/app/api/_lib/http";
import { searchSongs } from "@/server/saavn";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = requiredQuery(url, "query");
    const data = await searchSongs(query, {
      page: optionalInt(url, "page", 0),
      limit: optionalInt(url, "limit", 20),
    });
    return jsonOk(data, 60);
  } catch (error) {
    return jsonError(error);
  }
}
