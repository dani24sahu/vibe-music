import { jsonError, jsonOk, optionalInt } from "@/app/api/_lib/http";
import { getSuggestions } from "@/server/saavn";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const data = await getSuggestions(id, optionalInt(url, "limit", 10));
    return jsonOk(data, 120);
  } catch (error) {
    return jsonError(error);
  }
}
