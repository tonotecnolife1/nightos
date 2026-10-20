import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

// Narrow MCP stdio client for the installed, tested 0.1.6 binary. No shell,
// arbitrary tools, model callbacks or content-derived execution.
export class LineMcpClient {
  constructor(binary, args = ['serve'], onForm = async () => ({action:'cancel'})) {
    this.pending = new Map(); this.counter = 0; this.onForm = onForm;
    this.process = spawn(binary,args,{stdio:['pipe','pipe','pipe']});
    this.process.stderr.resume(); // Do not forward library logs / private data.
    this.process.on('error', () => this.fail());
    this.process.on('exit', () => this.fail());
    this.lines = createInterface({input:this.process.stdout});
    this.lines.on('line', line => {
      if (line.length > 1_500_000) return this.close();
      let message;
      try { message = JSON.parse(line); } catch { return this.close(); }
      if (message.method && message.id !== undefined) {
        void this.handleRequest(message); return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id); clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error('mcp_request_failed'));
      else pending.resolve(message.result);
    });
  }
  async handleRequest(message) {
    let result = {action:'cancel'};
    if (message.method === 'elicitation/create') {
      try { result = await this.onForm(message.params); } catch { /* fail closed */ }
    } else {
      this.write({jsonrpc:'2.0',id:message.id,error:{code:-32601,message:'Unsupported request'}});return;
    }
    this.write({jsonrpc:'2.0',id:message.id,result});
  }
  write(message) {
    if (this.process.stdin.writable) this.process.stdin.write(JSON.stringify(message)+'\n');
  }
  request(method, params) {
    const id = ++this.counter;
    return new Promise((resolve,reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('mcp_timeout')); this.close(); },110_000);
      this.pending.set(id,{resolve,reject,timer});
      this.write({jsonrpc:'2.0',id,method,params});
    });
  }
  async initialize() {
    const result = await this.request('initialize',{protocolVersion:'2025-11-25',capabilities:{elicitation:{form:{}}},clientInfo:{name:'nightos-mac-line-bridge',version:'0.1.0'}});
    if (result.protocolVersion !== '2025-11-25') throw new Error('unsupported_mcp_protocol');
    this.write({jsonrpc:'2.0',method:'notifications/initialized'});
  }
  async call(name,args) {
    const result = await this.request('tools/call',{name,arguments:args});
    if (result.isError || !result.structuredContent || !('data' in result.structuredContent)) throw new Error('line_tool_failed');
    return result.structuredContent.data;
  }
  fail() {
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(new Error('mcp_disconnected')); }
    this.pending.clear();
  }
  close() { this.process.kill(); this.lines.close(); this.fail(); }
}

export function toolFor(operation,args) {
  if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('invalid_arguments');
  const keys = Object.keys(args);
  const only = (allowed) => { if (keys.some(k => !allowed.includes(k))) throw new Error('unexpected_argument'); };
  const chat = () => { if (!/^[uUcCrR][A-Za-z0-9_-]{32,128}$/.test(args.chat_id)) throw new Error('invalid_chat'); };
  const limit = () => { if (args.limit !== undefined && (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 100)) throw new Error('invalid_limit'); };
  const text = () => { if (typeof args.text !== 'string' || !args.text.trim() || args.text.length > 5000) throw new Error('invalid_text'); };
  switch (operation) {
    case 'status': only([]); return 'line_status';
    case 'chats': only(['cursor','limit']);limit();if(args.cursor !== undefined && typeof args.cursor !== 'string') throw new Error('invalid_cursor');return 'line_list_chats';
    case 'contacts': only(['offset','limit']);limit();if(args.offset !== undefined && (!Number.isInteger(args.offset)||args.offset<0||args.offset>100000)) throw new Error('invalid_offset');return 'line_list_contacts';
    case 'messages': only(['chat_id','limit']);chat();limit();return 'line_get_messages';
    case 'prepare': only(['chat_id','recipient_kind','text']);chat();text();if(!['direct','group','room'].includes(args.recipient_kind))throw new Error('invalid_kind');return 'line_prepare_send';
    case 'send': only(['id','account','chat_id','recipient_kind','text','review_token']);chat();text();if(keys.length !== 6 || !['direct','group','room'].includes(args.recipient_kind) || !/^[a-f0-9]{64}$/.test(args.review_token) || typeof args.id!=='string' || args.id.length>128 || typeof args.account!=='string' || args.account.length>160)throw new Error('invalid_draft');return 'line_send_draft';
    case 'draft_status': only(['id']);if(typeof args.id!=='string'||args.id.length>128)throw new Error('invalid_id');return 'line_draft_status';
    default: throw new Error('operation_not_allowed');
  }
}

export function validSendForm(form) {
  const schema = form?.requestedSchema;
  return (form?.mode === undefined || form.mode === 'form') && typeof form?.message === 'string' && form.message.length < 20_000 && schema?.type === 'object' &&
    JSON.stringify(schema.required) === '["decision"]' && Object.keys(schema.properties ?? {}).length === 1 &&
    schema.properties.decision.type === 'string' && !('default' in schema.properties.decision) &&
    JSON.stringify(schema.properties.decision.enum) === '["送信しない","表示された宛先と本文で今すぐ送信する"]';
}
