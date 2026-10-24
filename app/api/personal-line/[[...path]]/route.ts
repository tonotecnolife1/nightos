import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ACTIVE_STATES, JOB_LIFETIME_MS, bridgeUpdateSchema, confirmSchema, jobSchema, pairClaimSchema, pairingSchema, uuidSchema } from '@/lib/personal-line/protocol';
import { checkDb, expireJobs, hashSecret, LineHttpError, ownedDevice, randomSecret, relayDb, requireDevice, requireOwner, readLineJson } from '@/lib/personal-line/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const response = (value: unknown, status = 200) => NextResponse.json(value, { status, headers:{ 'Cache-Control':'private, no-store', 'Vary':'Cookie, Authorization' } });
const body=readLineJson;
type Context = { params:{path?:string[]} };
async function handle(req: Request, {params}: Context) {
  try {
    const path = params.path ?? [];
    const db = relayDb();
    if (path[0] === 'bridge') {
      if (path.join('/') === 'bridge/pair' && req.method === 'POST') {
        const input = pairClaimSchema.parse(await body(req));
        const token = randomSecret();
        // Atomic one-time exchange: the raw pairing secret is never stored.
        const {data, error} = await db.from('personal_line_devices').update({token_hash:hashSecret(token), pair_hash:null, pair_expires_at:null, paired_at:new Date().toISOString(),last_seen:new Date().toISOString()})
          .eq('id',input.id).eq('pair_hash',hashSecret(input.secret)).gt('pair_expires_at',new Date().toISOString()).is('revoked_at',null).select('id').maybeSingle();
        checkDb(error);
        if (!data) throw new LineHttpError('pairing_expired_or_used',409);
        return response({token});
      }
      const device = await requireDevice(req,db);
      checkDb((await db.from('personal_line_devices').update({last_seen:new Date().toISOString()}).eq('id',device.id).is('revoked_at',null)).error);
      if (path.join('/') === 'bridge/poll' && req.method === 'POST') {
        await expireJobs(db,device.id);
        const {data,error} = await db.rpc('claim_personal_line_job',{p_device:device.id});
        checkDb(error);
        return response({job:data?.[0] ?? null});
      }
      if (path.length >= 3 && path[1] === 'jobs') {
        const id = uuidSchema.parse(path[2]);
        if (path.length === 4 && path[3] === 'confirmation' && req.method === 'GET') {
          const {data,error} = await db.from('personal_line_jobs').select('state,confirmation,expires_at').eq('id',id).eq('device_id',device.id).eq('owner_id',device.owner_id).maybeSingle();
          checkDb(error);
          if (!data) throw new LineHttpError('job_not_found',404);
          return response(data);
        }
        if (path.length === 3 && req.method === 'PATCH') {
          const input = bridgeUpdateSchema.parse(await body(req));
          const patch = input.state === 'awaiting_confirmation' ? input : {...input, form:null, confirmation:null};
          const {data,error} = await db.from('personal_line_jobs').update(patch).eq('id',id).eq('device_id',device.id).eq('owner_id',device.owner_id).in('state',['running','awaiting_confirmation']).gt('expires_at',new Date().toISOString()).select('id').maybeSingle();
          checkDb(error);
          if (!data) throw new LineHttpError('job_not_active',409);
          return response({ok:true});
        }
      }
      throw new LineHttpError('not_found',404);
    }
    const owner = await requireOwner(req);
    if (!path.length && req.method === 'GET') {
      const {data,error} = await db.from('personal_line_devices').select('id,name,last_seen,revoked_at,paired_at').eq('owner_id',owner.userId).is('revoked_at',null).order('created_at',{ascending:false}).limit(10);
      checkDb(error);
      return response({userId:owner.userId,devices:data});
    }
    if (path.join('/') === 'pairing' && req.method === 'POST') {
      const input = pairingSchema.parse(await body(req));
      const {count,error:countError} = await db.from('personal_line_devices').select('id',{count:'exact',head:true}).eq('owner_id',owner.userId).is('revoked_at',null);
      checkDb(countError);
      if ((count ?? 0) >= 10) throw new LineHttpError('disconnect_old_devices',409);
      const secret = randomSecret();
      const {data,error} = await db.from('personal_line_devices').insert({owner_id:owner.userId,cast_id:owner.cast.id,name:input.name,pair_hash:hashSecret(secret),pair_expires_at:new Date(Date.now()+600_000).toISOString()}).select('id,name').single();
      checkDb(error);
      return response({device:data,secret});
    }
    if (path.length === 2 && path[0] === 'devices' && req.method === 'DELETE') {
      const id = uuidSchema.parse(path[1]);
      await ownedDevice(db,owner.userId,id);
      checkDb((await db.from('personal_line_devices').update({revoked_at:new Date().toISOString(),token_hash:null,pair_hash:null}).eq('id',id).eq('owner_id',owner.userId)).error);
      checkDb((await db.from('personal_line_jobs').update({state:'cancelled',form:null,confirmation:null}).eq('device_id',id).eq('owner_id',owner.userId).in('state',ACTIVE_STATES)).error);
      return response({ok:true});
    }
    if (path.join('/') === 'jobs' && req.method === 'POST') {
      const input = jobSchema.parse(await body(req));
      await ownedDevice(db,owner.userId,input.deviceId,true);
      await expireJobs(db,input.deviceId);
      const {data:existing,error:existingError} = await db.from('personal_line_jobs').select('id,device_id,owner_id,operation,ciphertext').eq('id',input.id).maybeSingle();
      checkDb(existingError);
      if (existing) {
        if (existing.owner_id !== owner.userId || existing.device_id !== input.deviceId || existing.operation !== input.operation || existing.ciphertext !== input.ciphertext) throw new LineHttpError('job_id_conflict',409);
        return response({id:input.id});
      }
      const {count,error:countError} = await db.from('personal_line_jobs').select('id',{count:'exact',head:true}).eq('device_id',input.deviceId).in('state',ACTIVE_STATES);
      checkDb(countError);
      if ((count ?? 0) >= 10) throw new LineHttpError('too_many_pending_jobs',429);
      checkDb((await db.from('personal_line_jobs').insert({id:input.id,device_id:input.deviceId,owner_id:owner.userId,operation:input.operation,ciphertext:input.ciphertext,expires_at:new Date(Date.now()+JOB_LIFETIME_MS).toISOString()})).error);
      return response({id:input.id},201);
    }
    if (path[0] === 'jobs' && path.length >= 2) {
      const id = uuidSchema.parse(path[1]);
      const {data:job,error} = await db.from('personal_line_jobs').select('*').eq('id',id).eq('owner_id',owner.userId).maybeSingle();
      checkDb(error);
      if (!job) throw new LineHttpError('job_not_found',404);
      await ownedDevice(db,owner.userId,job.device_id);
      await expireJobs(db,job.device_id);
      if (path.length === 2 && req.method === 'GET') {
        const {data,error:readError} = await db.from('personal_line_jobs').select('id,state,result,form,expires_at').eq('id',id).eq('owner_id',owner.userId).single();
        checkDb(readError);
        return response(data);
      }
      if (path.length === 3 && path[2] === 'confirm' && req.method === 'POST') {
        const input = confirmSchema.parse(await body(req));
        const {data,error:confirmError} = await db.from('personal_line_jobs').update({confirmation:input.ciphertext}).eq('id',id).eq('owner_id',owner.userId).eq('state','awaiting_confirmation').is('confirmation',null).gt('expires_at',new Date().toISOString()).select('id').maybeSingle();
        checkDb(confirmError);
        if (!data) throw new LineHttpError('confirmation_expired_or_used',409);
        return response({ok:true});
      }
    }
    if (path.join('/') === 'links' && req.method === 'GET') {
      const id = uuidSchema.parse(new URL(req.url).searchParams.get('deviceId'));
      await ownedDevice(db,owner.userId,id);
      const {data,error} = await db.from('personal_line_links').select('chat_id,customer_id').eq('device_id',id).eq('owner_id',owner.userId);
      checkDb(error);
      return response({links:data});
    }
    if (path.join('/') === 'links' && req.method === 'PUT') {
      const input = z.object({deviceId:uuidSchema,chatId:z.string().min(1).max(160),customerId:z.string().min(1).max(64)}).strict().parse(await body(req));
      await ownedDevice(db,owner.userId,input.deviceId);
      const {data:customer,error:customerError} = await owner.supabase.from('customers').select('id').eq('id',input.customerId).maybeSingle();
      if (customerError || !customer) throw new LineHttpError('customer_not_found',404);
      checkDb((await db.from('personal_line_links').upsert({device_id:input.deviceId,owner_id:owner.userId,chat_id:input.chatId,customer_id:input.customerId},{onConflict:'device_id,chat_id'})).error);
      return response({ok:true});
    }
    if (path.join('/') === 'links' && req.method === 'DELETE') {
      const input=z.object({deviceId:uuidSchema,chatId:z.string().min(1).max(160)}).strict().parse(await body(req));
      await ownedDevice(db,owner.userId,input.deviceId);
      checkDb((await db.from('personal_line_links').delete().eq('device_id',input.deviceId).eq('owner_id',owner.userId).eq('chat_id',input.chatId)).error);
      return response({ok:true});
    }
    throw new LineHttpError('not_found',404);
  } catch (error) {
    if (error instanceof z.ZodError) return response({error:'invalid_request'},400);
    if (error instanceof LineHttpError) return response({error:error.code},error.status);
    // Do not include Supabase errors, raw requests, message bodies or credentials.
    return response({error:'line_request_failed'},500);
  }
}
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
