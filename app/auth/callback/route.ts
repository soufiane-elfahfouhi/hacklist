import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if already sent
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session?.provider_refresh_token) {
      // Save refresh token for Google Calendar two-way sync
      const userId = data.session.user.id;
      const refreshToken = data.session.provider_refresh_token;

      await supabase.from('google_connections').upsert({
        user_id: userId,
        email: data.session.user.email,
        refresh_token_enc: refreshToken,
        updated_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.redirect(`${origin}/today`);
}
