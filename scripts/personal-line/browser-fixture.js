// Browser QA only. Loaded with agent-browser --init-script on localhost.
// No production bundle import, no LINE network, no real credentials.
(() => {
  if(!['127.0.0.1','localhost'].includes(location.hostname))return;
  const user='00000000-0000-4000-8000-000000000001';
  const device='10000000-0000-4000-8000-000000000001';
  const me='u00000000000000000000000000000001';
  const peer='u00000000000000000000000000000002';
  const key='AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  sessionStorage.setItem('nightos.line.connection.'+user,JSON.stringify({userId:user,deviceId:device,key}));
  const raw=Uint8Array.from(atob(key),c=>c.charCodeAt(0));
  const b64=data=>btoa(Array.from(new Uint8Array(data),b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const bytes=text=>Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  const cryptoKey=()=>crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
  const encrypt=async(context,value)=>{const iv=crypto.getRandomValues(new Uint8Array(12));const result=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('nightos-line-v1:'+context)},await cryptoKey(),new TextEncoder().encode(JSON.stringify(value)));return b64(iv)+'.'+b64(result);};
  const decrypt=async(context,value)=>{const [iv,data]=value.split('.');return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv),additionalData:new TextEncoder().encode('nightos-line-v1:'+context)},await cryptoKey(),bytes(data))));};
  const nativeFetch=window.fetch.bind(window),jobs=new Map();
  window.__lineQa={sent:0,prepared:0,requests:[]};
  window.fetch=async(url,init={})=>{
    const path=new URL(typeof url==='string'?url:url.url,location.origin).pathname;
    if(!path.startsWith('/api/personal-line'))return nativeFetch(url,init);
    const p=path.replace('/api/personal-line','');
    const json=body=>Promise.resolve(new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}}));
    const body=init.body?JSON.parse(init.body):{};
    window.__lineQa.requests.push({path:p,method:init.method??'GET'});
    if(p==='')return json({userId:user,devices:[{id:device,name:'テスト用Mac',last_seen:new Date().toISOString(),paired_at:new Date().toISOString(),revoked_at:null}]});
    if(p==='/links')return json({links:[]});
    if(p==='/reply')return json({text:'田中さん、昨日はありがとうございました😊 京都のお話、また聞かせてくださいね。'});
    if(p==='/jobs'){
      const args=await decrypt(device+':'+body.id+':request',body.ciphertext);
      let result={};
      if(body.operation==='status')result={account:me,chat_send_available:true,demo:false};
      if(body.operation==='chats')result={items:[{id:peer,name:'田中 太郎（テスト）',kind:'direct',unread:2}]};
      if(body.operation==='contacts')result={items:[]};
      if(body.operation==='messages')result=[{id:'1',chat_id:peer,sender:peer,time_ms:Date.now()-60000,state:'decrypted',text:'昨日はありがとう。来週は京都に行く予定です。'},{id:'2',chat_id:peer,sender:me,time_ms:Date.now()-30000,state:'decrypted',text:'こちらこそ、楽しかったです😊'}];
      if(body.operation==='prepare'){window.__lineQa.prepared++;result={id:'synthetic-draft',account:me,chat_id:peer,recipient_kind:'direct',text:args.text,review_token:'f'.repeat(64),expires_ms:Date.now()+900000,recipient:{id:peer,name:'田中 太郎（テスト）',kind:'direct'}};}
      if(body.operation==='send'){
        jobs.set(body.id,{id:body.id,state:'awaiting_confirmation',form:await encrypt(device+':'+body.id+':form',{challenge:'synthetic-nonce',message:'宛先: 田中 太郎（テスト）\n種類: 個人\n本文:\n'+args.text,expiresAt:Date.now()+60000})});
      }else jobs.set(body.id,{id:body.id,state:'completed',result:await encrypt(device+':'+body.id+':result',{ok:true,data:result})});
      return json({id:body.id});
    }
    if(/^\/jobs\/[^/]+\/confirm$/.test(p)){
      const id=p.split('/')[2],answer=await decrypt(device+':'+id+':confirmation',body.ciphertext);
      if(answer.action==='send')window.__lineQa.sent++;
      jobs.set(id,{id,state:'completed',result:await encrypt(device+':'+id+':result',{ok:true,data:{state:answer.action==='send'?'sent':'pending'}})});
      return json({ok:true});
    }
    if(p.startsWith('/jobs/'))return json(jobs.get(p.split('/')[2]));
    return json({});
  };
})();
