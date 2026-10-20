import { readFile, writeFile, mkdir, open as openFile, unlink, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { decodePairing, seal, open } from '../../lib/personal-line/crypto.mjs';
import { LineMcpClient, toolFor } from './mcp-client.mjs';
import { createSendFormHandler } from './send-form.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
export function validateOrigin(value) {
  const url = new URL(value);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('https_origin_required');
  return url.origin;
}
export async function run() {
  // This bridge has separate state. It never copies or changes LINE login,
  // Keychain, MCP config, or the existing connector database.
  const directory = join(homedir(),'Library/Application Support/nightos-line-bridge');
  await mkdir(directory,{recursive:true,mode:0o700});
  const lockPath = join(directory,'bridge.lock');
  try {
    const old = Number(await readFile(lockPath,'utf8'));
    let alive = true;
    try { process.kill(old,0); } catch (error) { if(error.code === 'ESRCH')alive=false; }
    if (alive) throw new Error('bridge_already_running');
    await unlink(lockPath);
  } catch (error) { if(error.code !== 'ENOENT')throw error; }
  const lock = await openFile(lockPath,'wx',0o600);
  await lock.writeFile(String(process.pid));
  let client;
  let cleaned=false;
  const cleanup = async () => { if(cleaned)return;cleaned=true;client?.close();await lock.close();await unlink(lockPath).catch(()=>{}); };
  process.once('SIGINT',()=>{void cleanup().then(()=>process.exit(0));});
  process.once('SIGTERM',()=>{void cleanup().then(()=>process.exit(0));});
  try {
    const configPath = join(directory,'connection.json');
    let config;
    if (process.argv.includes('--pair')) {
      const terminal = createInterface({input:process.stdin,output:process.stdout});
      const code = (await terminal.question('NIGHTOSのLINE接続画面に表示された接続コードを貼り付けてEnter: ')).trim();
      terminal.close();
      const pair = decodePairing(code);
      const origin = validateOrigin(pair.origin);
      if(!/^[a-f0-9]{64}$/.test(pair.secret) || !/^[A-Za-z0-9_-]{43}$/.test(pair.key) || !/^[a-f0-9-]{36}$/.test(pair.id))throw new Error('invalid_pairing');
      const result = await fetch(origin+'/api/personal-line/bridge/pair',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:pair.id,secret:pair.secret}),signal:AbortSignal.timeout(15_000)});
      if(!result.ok)throw new Error('pairing_failed');
      const {token} = await result.json();
      if(!/^[a-f0-9]{64}$/.test(token))throw new Error('invalid_device_token');
      config = {origin,deviceId:pair.id,key:pair.key,token};
      await writeFile(configPath,JSON.stringify(config),{mode:0o600});
    } else {
      if ((await stat(configPath)).mode & 0o077) throw new Error('connection_file_permissions');
      config = JSON.parse(await readFile(configPath,'utf8'));validateOrigin(config.origin);
    }
    const api = async (path,method='GET',payload) => {
      const response = await fetch(config.origin+'/api/personal-line/bridge/'+path,{method,redirect:'error',headers:{Authorization:'Bearer '+config.token,'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload),signal:AbortSignal.timeout(15_000)});
      if(!response.ok)throw new Error(response.status===401?'device_revoked':'relay_unavailable');
      return response.json();
    };
    const binary = process.env.NIGHTOS_LINE_BINARY || join(homedir(),'.local/share/line-personal-mcp-independent/bin/line-personal-mcp');
    let currentJob = null;
    client = new LineMcpClient(binary,['serve'],createSendFormHandler({connection:config,getJob:()=>currentJob,api}));
    await client.initialize();
    const status = await client.call('line_status',{});
    if(status.version !== '0.1.6' || !status.chat_send_available || !status.confirmation_supported || status.demo)throw new Error('line_connector_not_ready');
    if(config.account && config.account !== status.account)throw new Error('line_account_changed');
    if(!config.account){config.account=status.account;await writeFile(configPath,JSON.stringify(config),{mode:0o600});}
    process.stdout.write('MacのLINE接続を開始しました。NIGHTOSに戻って読み込みを試せます。停止はControl+C。\n');
    while(true) {
      let job;
      try { ({job} = await api('poll','POST',{})); }
      catch(error) { if(error.message==='device_revoked')throw error;process.stdout.write('NIGHTOSとの通信を再接続しています。送信の再実行はしません。\n');await pause(10_000);continue; }
      if(!job) { await pause(2000);continue; }
      currentJob = job;
      const context = config.deviceId+':'+job.id;
      try {
        if(Date.parse(job.expires_at)<=Date.now())throw new Error('job_expired');
        const args = await open(config.key,context+':request',job.ciphertext);
        const tool = toolFor(job.operation,args);
        const result = await client.call(tool,args);
        await api('jobs/'+job.id,'PATCH',{state:'completed',result:await seal(config.key,context+':result',{ok:true,data:result})});
      } catch {
        // No retries, including a failed result acknowledgement AFTER sending.
        // The existing MCP's durable draft state remains the source of truth.
        await api('jobs/'+job.id,'PATCH',{state:job.operation==='send'?'unknown':'failed',result:await seal(config.key,context+':result',{ok:false,error:job.operation==='send'?'send_result_unknown':'line_operation_failed'})}).catch(()=>{});
      } finally { currentJob = null; }
    }
  } finally { await cleanup(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run().catch(error => { process.stderr.write('LINE接続を停止しました（'+(['bridge_already_running','pairing_failed','line_connector_not_ready','device_revoked','connection_file_permissions'].includes(error.message)?error.message:'bridge_start_failed')+'）。本文・鍵は出力していません。\n');process.exitCode=1; });
}
