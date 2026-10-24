import { seal, open } from '../../lib/personal-line/crypto.mjs';
import { validSendForm } from './mcp-client.mjs';

// This is the only path that returns an MCP send acceptance. It consumes an
// encrypted, explicit decision from the owner's UI for this job and nonce.
export function createSendFormHandler({connection,getJob,api,wait=ms=>new Promise(r=>setTimeout(r,ms)),now=Date.now}) {
  const used=new Set();
  return async form=>{
    const job=getJob();
    if(!job || job.operation!=='send' || !validSendForm(form) || used.has(job.id))return {action:'cancel'};
    used.add(job.id);
    const challenge=crypto.randomUUID();
    const context=connection.deviceId+':'+job.id;
    const until=Math.min(Date.parse(job.expires_at),now()+60_000);
    if(until<=now())return {action:'cancel'};
    await api('jobs/'+job.id,'PATCH',{state:'awaiting_confirmation',form:await seal(connection.key,context+':form',{challenge,message:form.message,expiresAt:until})});
    while(now()<until){
      await wait(1000);
      const row=await api('jobs/'+job.id+'/confirmation');
      if(row.state!=='awaiting_confirmation'||Date.parse(row.expires_at)<=now()||now()>=until)return {action:'cancel'};
      if(row.confirmation){
        const answer=await open(connection.key,context+':confirmation',row.confirmation);
        if(answer.challenge!==challenge||answer.jobId!==job.id||answer.action!=='send')return {action:'decline'};
        return {action:'accept',content:{decision:'表示された宛先と本文で今すぐ送信する'}};
      }
    }
    return {action:'cancel'};
  };
}
