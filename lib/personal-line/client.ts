import { open, seal } from './crypto.mjs';
import type { LineOperation } from './protocol';

export interface BrowserConnection { userId:string; deviceId:string; key:string }
export interface ConfirmationForm { challenge:string; message:string; expiresAt:number }
const errors:Record<string,string> = {
  bridge_not_configured:'LINE接続の準備ができていません。設定担当者に確認してください。',
  authentication_required:'NIGHTOSのキャストアカウントでログインしてください。',
  cast_account_required:'LINEはキャスト本人のアカウントで利用してください。',
  relay_storage_unavailable:'LINE中継用のデータベースが利用できません。設定を確認してください。',
  mac_offline:'Macとの接続が切れています。Macで接続プログラムを開いてください。',
  send_result_unknown:'送信結果を確認できません。LINEで確認してください。再送はしません。',
  line_operation_failed:'LINEを読み込めませんでした。Macの接続状態を確認してください。',
  ai_not_configured:'AIがまだ設定されていません。文面を直接入力して送信できます。',
  job_not_found:'操作の確認期限が切れています。送信の場合はLINEで結果を確認してください。',
  confirmation_expired_or_used:'この送信確認は期限切れか処理済みです。再送はせず、結果を確認してください。',
  disconnect_old_devices:'古い接続を解除してから、新しい接続コードを作ってください。',
};
export function lineError(error:unknown) { const code=error instanceof Error?error.message:'';return errors[code] ?? '操作を完了できませんでした。入力は残しています。送信の場合はLINEで結果を確認してください。'; }
export async function lineApi(path='',method='GET',body?:unknown) {
  const response = await fetch('/api/personal-line'+path,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15_000)});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error ?? 'line_request_failed');
  return result;
}
export async function runLineJob(
  connection:BrowserConnection, operation:LineOperation, args:unknown,
  onForm?:(jobId:string,form:ConfirmationForm)=>void,
  onJob?:(id:string)=>void,
) {
  const id=crypto.randomUUID();
  const context=connection.deviceId+':'+id;
  const ciphertext=await seal(connection.key,context+':request',args);
  // Keep a send job ID before the first network request. A lost HTTP response
  // must never cause a second send job or a second draft automatically.
  onJob?.(id);
  await lineApi('/jobs','POST',{id,deviceId:connection.deviceId,operation,ciphertext});
  return waitLineJob(connection,id,onForm);
}
export async function waitLineJob(connection:BrowserConnection,id:string,onForm?:(jobId:string,form:ConfirmationForm)=>void) {
  const context=connection.deviceId+':'+id;
  let shown=false;
  const until=Date.now()+125_000;
  while(Date.now()<until) {
    const job=await lineApi('/jobs/'+id);
    if(job.state==='awaiting_confirmation' && job.form && !shown) {
      const form=await open(connection.key,context+':form',job.form);
      if(!onForm)throw new Error('send_result_unknown');
      onForm(id,form);shown=true;
    }
    if(['completed','failed','unknown','expired','cancelled'].includes(job.state)) {
      if(job.result) {
        const result=await open(connection.key,context+':result',job.result);
        if(!result.ok)throw new Error(result.error);
        return result.data;
      }
      throw new Error('send_result_unknown');
    }
    await new Promise(resolve=>setTimeout(resolve,900));
  }
  throw new Error('send_result_unknown');
}
export async function answerLineForm(connection:BrowserConnection,jobId:string,form:ConfirmationForm,send:boolean) {
  if(Date.now()>=form.expiresAt)throw new Error('confirmation_expired_or_used');
  const ciphertext=await seal(connection.key,connection.deviceId+':'+jobId+':confirmation',{jobId,challenge:form.challenge,action:send?'send':'decline'});
  await lineApi('/jobs/'+jobId+'/confirm','POST',{ciphertext});
}
