import { describe, expect, it, vi, afterEach } from 'vitest';
import { newKey, seal, open, encodePairing, decodePairing } from '../lib/personal-line/crypto.mjs';
import { assertSameOrigin, jobSchema, timedOutState } from '../lib/personal-line/protocol';
import { toolFor, validSendForm } from '../scripts/personal-line/mcp-client.mjs';
import { validateOrigin } from '../scripts/personal-line/bridge.mjs';
import { answerLineForm, runLineJob, waitLineJob } from '../lib/personal-line/client';

afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
describe('private LINE encrypted transport',()=>{
  it('round trips Japanese text but binds it to device, job and direction',async()=>{
    const key=newKey();const text='お話ありがとうございました\nまた来週😊';
    const encrypted=await seal(key,'mac1:job1:request',{text});
    expect(encrypted).not.toContain(text);
    expect(await open(key,'mac1:job1:request',encrypted)).toEqual({text});
    await expect(open(key,'mac2:job1:request',encrypted)).rejects.toThrow();
    await expect(open(key,'mac1:job2:request',encrypted)).rejects.toThrow();
    await expect(open(key,'mac1:job1:confirmation',encrypted)).rejects.toThrow();
    await expect(open(newKey(),'mac1:job1:request',encrypted)).rejects.toThrow();
  });
  it('rejects ciphertext tampering and uses a fresh IV',async()=>{
    const key=newKey();const a=await seal(key,'x',{text:'test'}),b=await seal(key,'x',{text:'test'});
    expect(a).not.toBe(b);
    const [iv,ciphertext]=a.split('.');
    await expect(open(key,'x',iv+'.'+(ciphertext[0]==='A'?'B':'A')+ciphertext.slice(1))).rejects.toThrow();
  });
  it('encodes pairing without sending its key to the relay',()=>{
    const pair={id:'test',key:newKey(),origin:'https://nightos.example'};
    expect(decodePairing(encodePairing(pair))).toEqual(pair);
    expect(()=>decodePairing('other.'+encodePairing(pair))).toThrow();
  });
});
describe('execution and confirmation boundaries',()=>{
  const peer='u00000000000000000000000000000002';
  const form={mode:'form',message:'宛先と本文',requestedSchema:{type:'object',required:['decision'],properties:{decision:{type:'string',enum:['送信しない','表示された宛先と本文で今すぐ送信する']}}}};
  it('does not accept arbitrary tools or model-supplied approval flags',()=>{
    expect(()=>toolFor('line_send_draft',{})).toThrow();
    expect(()=>toolFor('prepare',{chat_id:peer,recipient_kind:'direct',text:'test',approved:true})).toThrow();
    expect(()=>toolFor('send',{chat_id:peer,recipient_kind:'direct',text:'test',id:'draft',account:peer,review_token:'f'.repeat(64),approved:true})).toThrow();
    expect(toolFor('messages',{chat_id:peer,limit:50})).toBe('line_get_messages');
    expect(()=>toolFor('messages',{chat_id:'../../bad',limit:50})).toThrow();
    expect(()=>toolFor('messages',{chat_id:peer,limit:10000})).toThrow();
  });
  it('requires exactly the existing explicit-choice MCP form',()=>{
    expect(validSendForm(form)).toBe(true);
    expect(validSendForm({...form,mode:'url'})).toBe(false);
    expect(validSendForm({...form,requestedSchema:{...form.requestedSchema,properties:{decision:{...form.requestedSchema.properties.decision,default:'送信しない'}}}})).toBe(false);
    expect(validSendForm({...form,requestedSchema:{type:'object',required:['approved'],properties:{approved:{type:'boolean'}}}})).toBe(false);
  });
  it('never requeues a started send on timeout',()=>{
    expect(timedOutState('send','running')).toBe('unknown');
    expect(timedOutState('send','awaiting_confirmation')).toBe('unknown');
    expect(timedOutState('send','queued')).toBe('expired');
    expect(timedOutState('messages','running')).toBe('expired');
  });
  it('requires same-origin user writes and HTTPS for remote Mac traffic',()=>{
    expect(()=>assertSameOrigin(new Request('https://nightos.example/api',{method:'POST',headers:{origin:'https://evil.example'}}))).toThrow();
    expect(()=>assertSameOrigin(new Request('https://nightos.example/api',{method:'POST'}))).toThrow();
    expect(()=>assertSameOrigin(new Request('https://nightos.example/api',{method:'POST',headers:{origin:'https://nightos.example'}}))).not.toThrow();
    expect(validateOrigin('https://nightos.example')).toBe('https://nightos.example');
    expect(validateOrigin('http://localhost:3000')).toBe('http://localhost:3000');
    for(const value of ['http://example.com','https://user:password@example.com','https://example.com/?key=bad','file:///tmp'])expect(()=>validateOrigin(value)).toThrow();
  });
  it('rejects public/model execution parameters at the relay boundary',()=>{
    expect(jobSchema.safeParse({id:crypto.randomUUID(),deviceId:crypto.randomUUID(),operation:'send',ciphertext:'x'.repeat(16)+'.'+'y'.repeat(30),approved:true}).success).toBe(false);
  });
});
describe('browser send recovery',()=>{
  const connection={userId:'owner',deviceId:'device',key:newKey()};
  it('never creates another job when the initial HTTP response is lost',async()=>{
    const fetch=vi.fn().mockRejectedValue(new Error('network_lost'));vi.stubGlobal('fetch',fetch);
    const onJob=vi.fn();
    await expect(runLineJob(connection,'send',{text:'private'},undefined,onJob)).rejects.toThrow('network_lost');
    expect(onJob).toHaveBeenCalledOnce();expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].body).not.toContain('private');
  });
  it('recovers by GET only, without calling prepare or send again',async()=>{
    const id='job';
    const result=await seal(connection.key,'device:'+id+':result',{ok:true,data:{state:'sent'}});
    const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({state:'completed',result})));vi.stubGlobal('fetch',fetch);
    expect(await waitLineJob(connection,id)).toEqual({state:'sent'});
    expect(fetch).toHaveBeenCalledOnce();expect(fetch.mock.calls[0][0]).toBe('/api/personal-line/jobs/job');expect(fetch.mock.calls[0][1].method).toBe('GET');
  });
  it('binds explicit confirmation to this job and a fresh form challenge',async()=>{
    const fetch=vi.fn().mockResolvedValue(new Response('{}'));vi.stubGlobal('fetch',fetch);
    await answerLineForm(connection,'job',{challenge:'nonce',message:'not approval',expiresAt:Date.now()+30000},true);
    const payload=JSON.parse(fetch.mock.calls[0][1].body);
    expect(await open(connection.key,'device:job:confirmation',payload.ciphertext)).toEqual({jobId:'job',challenge:'nonce',action:'send'});
    await expect(open(connection.key,'device:other:confirmation',payload.ciphertext)).rejects.toThrow();
  });
  it('does not submit expired forms',async()=>{
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    await expect(answerLineForm(connection,'job',{challenge:'x',message:'x',expiresAt:Date.now()-1},true)).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
