import { describe, it, expect } from 'vitest';
import { createSendFormHandler } from '../scripts/personal-line/send-form.mjs';
import { open,seal,newKey } from '../lib/personal-line/crypto.mjs';

const form={mode:'form',message:'Synthetic recipient and text',requestedSchema:{type:'object',required:['decision'],properties:{decision:{type:'string',enum:['送信しない','表示された宛先と本文で今すぐ送信する']}}}};
describe('Mac consumes only a fresh explicit browser decision',()=>{
  it.each(['send','decline','wrong_challenge','wrong_job','revoked','expired'])('%s cannot become a different send approval',async choice=>{
    const connection={deviceId:'mac',key:newKey()};
    const job={id:'job',operation:'send',expires_at:new Date(Date.now()+90000).toISOString()};
    let posted:any;let calls=0;
    const handler=createSendFormHandler({connection,getJob:()=>job,wait:async()=>{},api:async(_path:string,method:string,payload:any)=>{
      calls++;
      if(method==='PATCH'){posted=await open(connection.key,'mac:job:form',payload.form);return {};}
      if(choice==='revoked')throw new Error('device_revoked');
      return {state:'awaiting_confirmation',expires_at:choice==='expired'?new Date(0).toISOString():job.expires_at,confirmation:await seal(connection.key,'mac:job:confirmation',{jobId:choice==='wrong_job'?'other':'job',challenge:choice==='wrong_challenge'?'old':posted.challenge,action:choice==='decline'?'decline':'send'})};
    }});
    if(choice==='revoked')await expect(handler(form)).rejects.toThrow('device_revoked');
    else {
      const result=await handler(form);
      expect(result.action).toBe(choice==='send'?'accept':choice==='expired'?'cancel':'decline');
      if(choice==='send')expect(result.content).toEqual({decision:'表示された宛先と本文で今すぐ送信する'});
    }
    expect(calls).toBe(2);
    expect((await handler(form)).action).toBe('cancel'); // cannot reuse this form
  });
  it('does not confirm a form during any read-only operation',async()=>{
    let requests=0;
    const handler=createSendFormHandler({connection:{deviceId:'mac',key:newKey()},getJob:()=>({id:'job',operation:'messages'}),api:async()=>{requests++;}});
    expect(await handler(form)).toEqual({action:'cancel'});expect(requests).toBe(0);
  });
});
