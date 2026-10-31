import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('api_tokens')
    .select('id, name, last_used_at, created_at')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();
  const rawToken = 'hl_' + crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const { data, error } = await supabase
    .from('api_tokens')
    .insert({
      user_id: user.id,
      name: name || 'Antigravity Integration Token',
      token_hash: tokenHash,
    })
    .select('id, name, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return the rawToken once to the user
  return NextResponse.json({
    id: data.id,
    name: data.name,
    token: rawToken,
    created_at: data.created_at,
  });
}
