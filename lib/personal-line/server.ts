import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ACTIVE_STATES, assertSameOrigin, isOnline, timedOutState } from './protocol';

export class LineHttpError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}
export const hashSecret = (secret: string) => createHash('sha256').update(secret).digest('hex');
export const randomSecret = () => randomBytes(32).toString('hex');
export async function readLineJson(req: Request, maxBytes = 720_000) {
  if(!req.headers.get('content-type')?.startsWith('application/json'))throw new LineHttpError('json_required',415);
  if(Number(req.headers.get('content-length'))>maxBytes)throw new LineHttpError('request_too_large',413);
  const reader=req.body?.getReader();
  if(!reader)throw new LineHttpError('invalid_json');
  const decoder=new TextDecoder();let text='';let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new LineHttpError('request_too_large',413);}text+=decoder.decode(value,{stream:true});}
    text+=decoder.decode();
  }finally{reader.releaseLock();}
  try{return JSON.parse(text);}catch{throw new LineHttpError('invalid_json');}
}
export function relayDb() {
  if (process.env.NIGHTOS_LINE_BRIDGE_ENABLED !== 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new LineHttpError('bridge_not_configured', 503);
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function checkDb(error: unknown) { if (error) throw new LineHttpError('relay_storage_unavailable', 503); }
export async function requireOwner(req: Request) {
  if (!['GET','HEAD'].includes(req.method)) {
    try { assertSameOrigin(req); } catch { throw new LineHttpError('origin_rejected', 403); }
  }
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new LineHttpError('authentication_required', 401);
  const { data: cast, error: castError } = await supabase.from('nightos_casts').select('id,name,user_role').eq('auth_user_id', user.id).maybeSingle();
  if (castError || !cast || cast.user_role !== 'cast') throw new LineHttpError('cast_account_required', 403);
  return { userId:user.id, cast, supabase };
}
export async function requireDevice(req: Request, db: ReturnType<typeof relayDb>) {
  const authorization = req.headers.get('authorization') ?? '';
  if (!/^Bearer [a-f0-9]{64}$/.test(authorization)) throw new LineHttpError('device_authentication_required', 401);
  const { data, error } = await db.from('personal_line_devices').select('*').eq('token_hash', hashSecret(authorization.slice(7))).is('revoked_at', null).maybeSingle();
  checkDb(error);
  if (!data) throw new LineHttpError('device_revoked_or_invalid', 401);
  // A role change / deleted profile also ends the personal connection.
  const { data: cast, error: castError } = await db.from('nightos_casts').select('id,user_role').eq('id', data.cast_id).eq('auth_user_id', data.owner_id).maybeSingle();
  checkDb(castError);
  if (!cast || cast.user_role !== 'cast') throw new LineHttpError('device_revoked_or_invalid', 401);
  return data;
}
export async function ownedDevice(db: ReturnType<typeof relayDb>, userId: string, id: string, online = false) {
  const { data, error } = await db.from('personal_line_devices').select('*').eq('id', id).eq('owner_id', userId).is('revoked_at', null).maybeSingle();
  checkDb(error);
  if (!data) throw new LineHttpError('device_not_found', 404);
  if (online && !isOnline(data.last_seen)) throw new LineHttpError('mac_offline', 409);
  return data;
}
export async function expireJobs(db: ReturnType<typeof relayDb>, deviceId: string) {
  const now = new Date().toISOString();
  const { data, error } = await db.from('personal_line_jobs').select('id,operation,state').eq('device_id', deviceId).in('state', ACTIVE_STATES).lt('expires_at', now);
  checkDb(error);
  for (const row of data ?? []) {
    const result = await db.from('personal_line_jobs').update({ state:timedOutState(row.operation, row.state), form:null, confirmation:null }).eq('id',row.id).eq('state',row.state);
    checkDb(result.error);
  }
  // Ciphertext is temporary transport, not conversation history.
  checkDb((await db.from('personal_line_jobs').delete().eq('device_id', deviceId).lt('expires_at', new Date(Date.now()-86_400_000).toISOString())).error);
}
