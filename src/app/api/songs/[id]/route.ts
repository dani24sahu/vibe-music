import { jsonError, jsonOk } from "@/app/api/_lib/http";
import { getSong } from "@/server/saavn";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const data = await getSong(id);
    return jsonOk(data, 300);
  } catch (error) {
    return jsonError(error);
  }
}
