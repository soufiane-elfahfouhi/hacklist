import { NextRequest } from 'next/server';
import { POST as handlePost } from '../../route';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  // Clone headers and inject Authorization Bearer token
  const headers = new Headers(req.headers);
  headers.set('authorization', `Bearer ${token}`);

  const forwardedReq = new NextRequest(req.url, {
    method: 'POST',
    headers,
    body: req.body,
  });

  return handlePost(forwardedReq);
}
