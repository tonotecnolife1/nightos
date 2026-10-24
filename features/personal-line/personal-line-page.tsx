'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, RefreshCw, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/nightos/page-header';
import { MoreMenu } from '@/components/nightos/more-menu';
import { useVoiceInput } from '@/features/ruri-mama/use-voice-input';
import { encodePairing, newKey } from '@/lib/personal-line/crypto.mjs';
import { answerLineForm, BrowserConnection, ConfirmationForm, lineApi, lineError, runLineJob, waitLineJob } from '@/lib/personal-line/client';
import { isOnline, LineChat, LineDevice, LineMessage, LinePreview } from '@/lib/personal-line/protocol';

const button='min-h-[44px] rounded-pill bg-wine-deep px-5 py-3 text-sm text-pearl-light shadow-warm disabled:opacity-40';
const secondary='min-h-[44px] rounded-pill border border-wine/25 px-4 py-2 text-sm text-wine-deep disabled:opacity-40';
const input='w-full min-w-0 rounded-btn border border-wine/20 bg-pearl-light p-3 text-base text-ink';
interface Customer {id:string;name:string}
interface Props { customers:Customer[]; initialSettings?:boolean; initialCustomerId?:string }
interface Review { jobId:string; form:ConfirmationForm }
const connectionKey=(userId:string)=>'nightos.line.connection.'+userId;
const sendKey=(connection:BrowserConnection)=>'nightos.line.pending.'+connection.userId+'.'+connection.deviceId;

export function PersonalLinePage({customers,initialSettings=false,initialCustomerId}:Props) {
  const [userId,setUserId]=useState('');
  const [devices,setDevices]=useState<LineDevice[]>([]);
  const [connection,setConnection]=useState<BrowserConnection|null>(null);
  const [settings,setSettings]=useState(initialSettings);
  const [pairCode,setPairCode]=useState('');
  const [chats,setChats]=useState<LineChat[]>([]);
  const [cursor,setCursor]=useState<string|undefined>();
  const [contactOffset,setContactOffset]=useState<number|undefined>();
  const [selected,setSelected]=useState<LineChat|null>(null);
  const [messages,setMessages]=useState<LineMessage[]>([]);
  const [account,setAccount]=useState('');
  const [query,setQuery]=useState('');
  const [instruction,setInstruction]=useState('');
  const [draft,setDraft]=useState('');
  const [links,setLinks]=useState<Record<string,string>>({});
  const [customerQuery,setCustomerQuery]=useState('');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [review,setReview]=useState<Review|null>(null);
  const [answering,setAnswering]=useState(false);
  const [pendingSend,setPendingSend]=useState<string|null>(null);
  const [preview,setPreview]=useState<LinePreview|null>(null);
  const [syncedAt,setSyncedAt]=useState<number|null>(null);
  const active=useRef(false);
  const currentUser=useRef('');
  const autoLoaded=useRef(new Set<string>());
  const draftInput=useRef<HTMLTextAreaElement>(null);
  const reviewDialog=useRef<HTMLDivElement>(null);
  const showForm=useCallback((jobId:string,form:ConfirmationForm)=>{setReview({jobId,form});setAnswering(false);},[]);
  const voice=useVoiceInput({onResult:(text,final)=>{if(final)setInstruction(old=>old+(old?' ':'')+text);},onError:setError});

  useEffect(()=>{
    let alive=true;
    const load=async()=>{
      try {
        const data=await lineApi();
        if(!alive)return;
        if(currentUser.current && currentUser.current!==data.userId) {
          sessionStorage.removeItem(connectionKey(currentUser.current));
          setConnection(null);setSelected(null);setChats([]);setMessages([]);setDraft('');setReview(null);setPairCode('');
          location.replace('/cast/line');return;
        }
        currentUser.current=data.userId;
        setUserId(data.userId);setDevices(data.devices);
        const saved=sessionStorage.getItem(connectionKey(data.userId));
        if(saved) {
          const parsed=JSON.parse(saved) as BrowserConnection;
          if(parsed.userId===data.userId && data.devices.some((d:LineDevice)=>d.id===parsed.deviceId))setConnection(parsed);
        }
      }catch(e){if(alive){setError(lineError(e));if(e instanceof Error&&['authentication_required','cast_account_required'].includes(e.message)){currentUser.current='';setConnection(null);setSelected(null);setMessages([]);setChats([]);setDraft('');setReview(null);setPairCode('');}}}
    };
    void load();const timer=setInterval(()=>void load(),10_000);
    return()=>{alive=false;clearInterval(timer);};
  },[]);

  const finishSend=useCallback((result:{state:string})=>{
    setReview(null);
    if(result.state==='sent') {setNotice('LINEに送信しました。相手の受信・既読はまだ確認していません。');setDraft('');}
    else if(result.state==='pending')setNotice('送信を取りやめました。');
    else throw new Error('send_result_unknown');
  },[]);

  useEffect(()=>{
    if(!connection)return;
    const id=sessionStorage.getItem(sendKey(connection));
    if(!id)return;
    setPendingSend(id);setBusy(true);active.current=true;
    // Recovery only reads the existing job. Never create or resend a message.
    void waitLineJob(connection,id,showForm).then(result=>{
      finishSend(result);sessionStorage.removeItem(sendKey(connection));setPendingSend(null);
    }).catch(e=>setError(lineError(e))).finally(()=>{active.current=false;setBusy(false);});
  },[connection?.deviceId,finishSend,showForm]); // Stable device identity, not each heartbeat.

  useEffect(()=>{
    const element=draftInput.current;
    if(element){element.style.height='auto';element.style.height=Math.min(element.scrollHeight,280)+'px';}
  },[draft]);
  useEffect(()=>{if(initialSettings)setSettings(true);},[initialSettings]);
  useEffect(()=>{
    if(!review)return;
    const previous=document.activeElement as HTMLElement|null;
    reviewDialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return()=>{if(previous?.isConnected)previous.focus();};
  },[review?.jobId]);

  async function action(fn:()=>Promise<void>) {
    if(active.current)return;
    active.current=true;setBusy(true);setError('');
    try{await fn();}catch(e){setReview(null);setError(lineError(e));}finally{active.current=false;setBusy(false);}
  }
  async function createConnection() {
    const key=newKey();
    const result=await lineApi('/pairing','POST',{name:'LINE接続用Mac'});
    const next={userId,deviceId:result.device.id,key};
    sessionStorage.setItem(connectionKey(userId),JSON.stringify(next));
    setConnection(next);setPairCode(encodePairing({origin:location.origin,id:next.deviceId,secret:result.secret,key}));
    setNotice('Macで接続プログラムを開き、このコードを入力してください。有効期限は10分です。');
  }
  async function loadChats(more=false) {
    if(!connection)return;
    const status=await runLineJob(connection,'status',{});
    if(!status.chat_send_available || status.demo)throw new Error('line_operation_failed');
    setAccount(status.account);
    const page=(!more||cursor)?await runLineJob(connection,'chats',{limit:100,...(more&&cursor?{cursor}: {})}):{items:[]};
    const contacts=(!more || contactOffset!==undefined)?await runLineJob(connection,'contacts',{limit:100,...(more&&contactOffset!==undefined?{offset:contactOffset}:{})}):{items:[]};
    const combined:LineChat[]=[...page.items,...contacts.items.filter((c:LineChat)=>!page.items.some((ch:LineChat)=>ch.id===c.id)).map((c:LineChat)=>({...c,kind:'direct',unread:0}))];
    setChats(old=>Array.from(new Map([...(more?old:[]),...combined].map(c=>[c.id,c])).values()));
    setCursor(page.next_cursor);setContactOffset(contacts.next_offset);
    const linked=await lineApi('/links?deviceId='+connection.deviceId);
    if(currentUser.current!==connection.userId)return;
    setLinks(Object.fromEntries(linked.links.map((l:{chat_id:string;customer_id:string})=>[l.chat_id,l.customer_id])));
    setSyncedAt(Date.now());setPairCode('');setSettings(false);
    if(initialCustomerId&&!selected){
      const match=linked.links.find((l:{chat_id:string;customer_id:string})=>l.customer_id===initialCustomerId);
      const chat=match?combined.find(c=>c.id===match.chat_id):undefined;
      if(chat)await choose(chat);
      else setQuery(customers.find(c=>c.id===initialCustomerId)?.name??'');
    }
  }
  async function choose(chat:LineChat) {
    if(!connection)return;
    if(draft && selected?.id!==chat.id && !window.confirm('入力中の文案があります。別のお客様に移動しますか？'))return;
    const items=await runLineJob(connection,'messages',{chat_id:chat.id,limit:50});
    if(currentUser.current!==connection.userId)return;
    setSelected(chat);setMessages([...items].sort((a:LineMessage,b:LineMessage)=>a.time_ms-b.time_ms));
    if(selected?.id!==chat.id){setDraft('');setInstruction('');setCustomerQuery(chat.name);setPreview(null);}
    setNotice('');setSyncedAt(Date.now());
  }
  async function generate(direction?:string) {
    if(!connection||!selected)return;
    const result=await lineApi('/reply','POST',{deviceId:connection.deviceId,chatId:selected.id,account,recipientName:selected.name,instruction:direction||instruction||'直近のメッセージへの自然な返信を作って',draft:direction?draft:undefined,messages:messages.filter(m=>['plaintext','decrypted','imported'].includes(m.state)&&m.text).slice(-30).map(m=>({sender:m.sender,text:m.text!.slice(0,5000),state:m.state}))});
    if(currentUser.current!==connection.userId)return;
    setDraft(result.text);setPreview(null);
  }
  async function prepareSend() {
    if(!connection||!selected||!draft.trim()||pendingSend)return;
    const p:LinePreview=await runLineJob(connection,'prepare',{chat_id:selected.id,recipient_kind:selected.kind,text:draft});
    if(p.chat_id!==selected.id||p.recipient.id!==selected.id||p.recipient_kind!==selected.kind||p.text!==draft)throw new Error('line_operation_failed');
    setPreview(p);
    const args={id:p.id,account:p.account,chat_id:p.chat_id,recipient_kind:p.recipient_kind,text:p.text,review_token:p.review_token};
    const result=await runLineJob(connection,'send',args,showForm,id=>{
      sessionStorage.setItem(sendKey(connection),id);setPendingSend(id);
    });
    finishSend(result);sessionStorage.removeItem(sendKey(connection));setPendingSend(null);
    if(result.state==='sent'&&result.message_id){
      setMessages(old=>old.some(m=>m.id===result.message_id)?old:[...old,{id:result.message_id,chat_id:p.chat_id,sender:p.account,time_ms:Date.now(),state:'plaintext',text:p.text}]);
    }
  }
  async function confirm(send:boolean) {
    if(!connection||!review||answering)return;
    setAnswering(true);setError('');
    try{await answerLineForm(connection,review.jobId,review.form,send);setNotice(send?'送信結果を確認しています。':'送信を取りやめています。');}
    catch(e){setError(lineError(e));} // Do not re-enable an uncertain approval.
  }
  const device=devices.find(d=>d.id===connection?.deviceId);
  const online=isOnline(device?.last_seen??null);
  useEffect(()=>{
    if(connection&&online&&!pendingSend&&!active.current&&!autoLoaded.current.has(connection.deviceId)){
      autoLoaded.current.add(connection.deviceId);
      void action(()=>loadChats());
    }
  },[connection?.deviceId,online,pendingSend]);
  const found=customers.filter(c=>c.name.replace(/[\s　]/g,'').includes(customerQuery.replace(/[\s　]/g,''))).slice(0,5);
  const linkedCustomer=selected?customers.find(c=>c.id===links[selected.id]):null;

  return <div>
    <PageHeader title="LINE" right={<MoreMenu/>}/>
    <div className="space-y-5 px-4 py-5">
      <div className="flex items-center justify-between gap-2 text-xs text-ink-soft">
        <span role="status">{online?'Macに接続中':'Macの接続待ち'}{syncedAt?' · 読込 '+new Date(syncedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):''}</span>
        <button className={secondary} disabled={!online||busy||!!pendingSend} onClick={()=>void action(()=>loadChats())}><RefreshCw size={14} className="mr-1 inline"/>読み込む</button>
      </div>
      {error&&<p role="alert" className="rounded-card bg-wine/10 p-4 text-sm text-wine-deep">{error}</p>}
      {notice&&<p role="status" className="rounded-card bg-success/15 p-4 text-sm text-ink">{notice}</p>}
      {(!connection||settings)&&<section className="space-y-4 rounded-card bg-pearl-light p-5 shadow-warm">
        <h2 className="font-serif text-xl text-wine-deep">自分のLINEをつなぐ</h2>
        <p className="flex gap-2 text-sm text-ink-soft"><ShieldCheck size={20} className="shrink-0"/>本文・要約・下書きは店舗スタッフに共有されません。送信する内容は毎回確認できます。</p>
        <p className="text-sm text-ink-soft">このブラウザとMacを接続します。Macの接続プログラムを開いている間、LINEを利用できます。</p>
        <button className={button} disabled={!userId||busy||!!pendingSend} onClick={()=>void action(createConnection)}>接続コードを作る</button>
        {pairCode&&<div className="space-y-2"><label htmlFor="pair-code" className="text-sm">Macに入力する接続コード</label><textarea id="pair-code" readOnly rows={3} className={input+' break-all text-xs'} value={pairCode}/><button className={secondary} onClick={()=>void navigator.clipboard.writeText(pairCode).then(()=>setNotice('接続コードをコピーしました。')).catch(()=>setError('コードを選択してコピーしてください。'))}>コードをコピー</button><p className="text-xs text-ink-soft">接続コードは他の人に渡さないでください。このタブを閉じると再接続が必要です。</p></div>}
        {devices.map(d=><div key={d.id} className="flex items-center justify-between gap-2 border-t border-wine/10 pt-3 text-sm"><span>{d.name} · {isOnline(d.last_seen)?'接続中':'未接続'}</span><button className={secondary} disabled={busy} onClick={()=>void action(async()=>{await lineApi('/devices/'+d.id,'DELETE');if(d.id===connection?.deviceId){sessionStorage.removeItem(connectionKey(userId));setConnection(null);setMessages([]);setChats([]);setDraft('');}setDevices(old=>old.filter(x=>x.id!==d.id));})}>接続を解除</button></div>)}
      </section>}
      {connection&&!selected&&<section className="space-y-3">
        <label className="block text-sm text-ink-soft" htmlFor="line-search">お名前や呼び名で探す</label>
        <input id="line-search" className={input} value={query} onChange={e=>setQuery(e.target.value)} placeholder="田中さん、ダイニー…"/>
        {!chats.length&&<p className="py-8 text-center text-sm text-ink-soft">Macの接続後、「読み込む」でトークと友だちを表示します。</p>}
        {chats.filter(c=>!query||[c.name,customers.find(x=>x.id===links[c.id])?.name??''].some(n=>n.toLocaleLowerCase().includes(query.toLocaleLowerCase()))).map(c=><button key={c.id} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-card bg-pearl-light p-4 text-left shadow-soft disabled:opacity-40" disabled={busy||!!pendingSend} onClick={()=>void action(()=>choose(c))}><span className="min-w-0"><span className="block break-words text-ink">{c.name}</span><span className="text-xs text-ink-soft">{c.kind==='direct'?'個人トーク':c.kind==='group'?'グループ':'複数人トーク'}</span></span>{c.unread>0&&<span className="rounded-pill bg-wine-deep px-2 py-1 text-xs text-pearl-light" aria-label={'未読'+c.unread+'件'}>{c.unread}</span>}</button>)}
        {(cursor||contactOffset!==undefined)&&<button className={secondary} disabled={busy||!!pendingSend} onClick={()=>void action(()=>loadChats(true))}>続きを読み込む</button>}
      </section>}
      {selected&&<section className="space-y-4">
        <button className={secondary} disabled={busy||!!pendingSend} onClick={()=>{if(!draft||window.confirm('文案を閉じて一覧に戻りますか？')){setSelected(null);setDraft('');}}}><ArrowLeft size={14} className="inline"/>一覧へ</button>
        <div className="flex items-start justify-between gap-2"><h2 className="break-words font-serif text-xl">{selected.name}</h2><span className="shrink-0 text-xs text-ink-soft">{selected.kind==='direct'?'個人トーク':'複数人への送信'}</span></div>
        {linkedCustomer?<p className="text-sm text-ink-soft">お客様の記憶：<Link className="underline" href={'/cast/customers/'+linkedCustomer.id}>{linkedCustomer.name}さん</Link><button className="ml-3 underline" disabled={busy||!!pendingSend} onClick={()=>void action(async()=>{await lineApi('/links','DELETE',{deviceId:connection!.deviceId,chatId:selected.id});setLinks(old=>{const next={...old};delete next[selected.id];return next;});})}>紐づけを解除</button></p>:<details className="rounded-card border border-wine/15 p-3"><summary className="text-sm text-wine-deep">お客様の記憶とつなぐ（初回のみ・任意）</summary><p className="my-2 text-xs text-ink-soft">同じ名前だけで自動統合しません。このLINEの相手がお客様本人か確認してください。</p><input aria-label="紐づけるお客様" className={input} value={customerQuery} onChange={e=>setCustomerQuery(e.target.value)}/>{found.map(c=><button className={secondary+' mt-2 w-full'} key={c.id} disabled={busy||!!pendingSend} onClick={()=>void action(async()=>{await lineApi('/links','PUT',{deviceId:connection!.deviceId,chatId:selected.id,customerId:c.id});setLinks(old=>({...old,[selected.id]:c.id}));})}>{c.name}さんに紐づける</button>)}</details>}
        <div aria-label="LINEの会話" className="max-h-[48dvh] space-y-3 overflow-y-auto rounded-card bg-pearl-warm p-3">
          {messages.map(m=><div key={m.id} className={'max-w-[88%] rounded-card p-3 text-sm '+(m.sender===account?'ml-auto bg-wine/15':'bg-pearl-light')}><p className="whitespace-pre-wrap break-words">{m.text??(m.state==='non_text'?'画像・ファイルなどの添付（本文の表示には未対応）':'本文を取得できませんでした')}</p><p className="mt-1 text-right text-[10px] text-ink-soft">{new Date(m.time_ms).toLocaleString('ja-JP')}</p></div>)}
          {!messages.length&&<p className="text-sm text-ink-soft">直近のメッセージはありません。</p>}
        </div>
        <button className={secondary} disabled={busy||!!pendingSend} onClick={()=>void action(()=>choose(selected))}>会話を更新</button>
        <div className="space-y-3 rounded-card bg-pearl-light p-4 shadow-warm">
          <label htmlFor="reply-instruction" className="font-serif text-lg text-wine-deep">どんな返信にする？</label>
          <div className="flex items-end gap-2"><textarea id="reply-instruction" className={input} rows={2} maxLength={1000} disabled={busy||!!pendingSend} value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder="お礼を伝えて、来週の予定を聞きたい"/>{voice.supported&&<button aria-label={voice.recording?'音声入力を止める':'音声で伝える'} className={secondary} disabled={busy||!!pendingSend} onClick={voice.toggle}><Mic size={20} className={voice.recording?'text-warning':'text-wine-deep'}/></button>}</div>
          <button className={button} disabled={busy||!!pendingSend||!messages.some(m=>!!m.text)} onClick={()=>void action(()=>generate())}>返信案を作る</button>
          <label htmlFor="line-draft" className="block text-sm text-ink-soft">送る文面</label>
          <textarea ref={draftInput} id="line-draft" className={input+' max-h-[280px] resize-none overflow-y-auto whitespace-pre-wrap'} rows={4} maxLength={5000} disabled={busy||!!pendingSend} value={draft} onChange={e=>{setDraft(e.target.value);setPreview(null);}} placeholder="返信案を調整するか、そのまま入力できます。"/>
          {draft&&<div className="flex flex-wrap gap-2">{['短く','もう少し軽く','自分の口調に寄せて'].map(direction=><button key={direction} className={secondary} disabled={busy||!!pendingSend} onClick={()=>void action(()=>generate(direction))}>{direction}</button>)}</div>}
          <button className={button+' w-full'} disabled={busy||!!pendingSend||!online||!draft.trim()} onClick={()=>void action(prepareSend)}>送信内容を確認</button>
          <p className="text-xs text-ink-soft">次の確認画面で送信を選ぶまで、LINEは送られません。</p>
        </div>
      </section>}
      {pendingSend&&!busy&&!review&&<div className="space-y-3 rounded-card border border-warning/40 p-4"><p className="text-sm">前の送信の確認が必要です。同じ内容を自動で送り直すことはありません。</p><button className={secondary} onClick={()=>void action(async()=>{if(!connection)return;const r=await waitLineJob(connection,pendingSend,showForm);finishSend(r);sessionStorage.removeItem(sendKey(connection));setPendingSend(null);})}>前の送信結果だけ確認</button><button className={secondary} onClick={()=>{if(connection&&window.confirm('LINEアプリで送信結果を確認しましたか？この操作で再送はしません。')){sessionStorage.removeItem(sendKey(connection));setPendingSend(null);setError('');}}}>LINEで結果を確認済み</button></div>}
    </div>
    {review&&<div ref={reviewDialog} onKeyDown={event=>{if(event.key==='Escape'&&!answering){event.preventDefault();void confirm(false);}if(event.key==='Tab'){const elements=reviewDialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), summary');if(!elements?.length)return;const first=elements[0],last=elements[elements.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-3" role="dialog" aria-modal="true" aria-labelledby="line-send-title"><div className="max-h-[90dvh] w-full max-w-[500px] space-y-4 overflow-y-auto rounded-hero bg-pearl-light p-5 shadow-luxe">
      <h2 id="line-send-title" className="font-serif text-xl text-wine-deep">この内容でLINEを送りますか？</h2>
      {preview&&<div className="space-y-2 text-sm"><p>宛先：{preview.recipient.name}（{preview.recipient_kind==='direct'?'個人':'複数人'}）</p><p className="break-all text-xs text-ink-soft">{preview.chat_id}</p><p className="whitespace-pre-wrap break-words rounded-card bg-pearl-warm p-3">{preview.text}</p></div>}
      <details open={!preview}><summary className="text-xs text-ink-soft">接続先が返した送信内容・期限</summary><p className="mt-2 whitespace-pre-wrap break-all text-xs text-ink-soft">{review.form.message}</p></details>
      <p className="text-xs text-ink-soft">有効期限：{new Date(review.form.expiresAt).toLocaleTimeString('ja-JP')}</p>
      <div className="flex gap-2"><button className={secondary+' flex-1'} disabled={answering} onClick={()=>void confirm(false)}>送信しない</button><button className={button+' flex-1'} disabled={answering} onClick={()=>void confirm(true)}>{answering?'確認中…':'送信する'}</button></div>
    </div></div>}
  </div>;
}
