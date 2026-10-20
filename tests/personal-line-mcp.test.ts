import { describe, it, expect } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LineMcpClient } from '../scripts/personal-line/mcp-client.mjs';
import { createSendFormHandler } from '../scripts/personal-line/send-form.mjs';
import { newKey, open, seal } from '../lib/personal-line/crypto.mjs';

// Always an isolated demo database. Never use the user's live LINE state.
const binary=process.env.LINE_MCP_TEST_BINARY;
describe.skipIf(!binary)('installed connector + NIGHTOS MCP client (synthetic LINE only)',()=>{
  it.each([false,true])('explicit browser decision send=%s is passed through MCP',async send=>{
    const directory=await mkdtemp(join(tmpdir(),'nightos-line-demo-'));
    let forms=0;
    const connection={deviceId:'synthetic-mac',key:newKey()};
    const job={id:crypto.randomUUID(),operation:'send',expires_at:new Date(Date.now()+90000).toISOString()};
    const context=connection.deviceId+':'+job.id;
    let challenge='';
    const handler=createSendFormHandler({connection,getJob:()=>job,wait:async()=>{},api:async(_path:string,method:string,payload:any)=>{
      if(method==='PATCH'){
        forms++;const form=await open(connection.key,context+':form',payload.form);
        expect(form.message).toContain('NIGHTOS synthetic integration test');
        challenge=form.challenge;return {};
      }
      return {state:'awaiting_confirmation',expires_at:job.expires_at,confirmation:await seal(connection.key,context+':confirmation',{jobId:job.id,challenge,action:send?'send':'decline'})};
    }});
    const client=new LineMcpClient(binary!,['serve','--demo','--allow-chat-send','--data-dir',directory],handler);
    try{
      await client.initialize();
      expect((await client.call('line_status',{})).demo).toBe(true);
      const preview=await client.call('line_prepare_send',{chat_id:'u00000000000000000000000000000002',recipient_kind:'direct',text:'NIGHTOS synthetic integration test'});
      const args=Object.fromEntries(['id','account','chat_id','recipient_kind','text','review_token'].map(k=>[k,preview[k]]));
      const result=await client.call('line_send_draft',args);
      expect(forms).toBe(1);expect(result.state).toBe(send?'sent':'pending');
      if(send){
        expect((await client.call('line_send_draft',args)).send_confirmed_in_this_call).toBe(false);
        expect(forms).toBe(1);
      }
    }finally{client.close();await new Promise(resolve=>setTimeout(resolve,100));await rm(directory,{recursive:true,force:true});}
  });
});
