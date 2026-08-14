import { jsonError, jsonOk, requiredQuery } from "@/app/api/_lib/http";
import { searchAll } from "@/server/saavn";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = requiredQuery(url, "query");
    const data = await searchAll(query);
    return jsonOk(data, 60);
  } catch (error) {
    return jsonError(error);
  }
}
