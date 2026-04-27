import { getStore } from '@/lib/server/store';
import { badRequest, created, internalError, ok } from '@/lib/server/http';
import { bannerCreateSchema, parseWithSchema } from '@/lib/server/validators';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const store = getStore();
    const payload = await store.getBanners();
    return ok(payload);
  } catch (error) {
    return internalError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = parseWithSchema(bannerCreateSchema, body);

    if (!parsed.success) {
      return badRequest('Invalid banner payload', parsed.errors);
    }

    const store = getStore();
    const data = await store.createBanner(parsed.data);
    return created({ success: true, data });
  } catch (error) {
    return internalError(error);
  }
}
