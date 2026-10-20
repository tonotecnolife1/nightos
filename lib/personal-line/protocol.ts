import { z } from 'zod';

export const operationSchema = z.enum(['status', 'chats', 'contacts', 'messages', 'prepare', 'send', 'draft_status']);
export type LineOperation = z.infer<typeof operationSchema>;
export const uuidSchema = z.string().uuid();
export const ciphertextSchema = z.string().min(35).max(700_000).regex(/^[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]+$/);
export const jobSchema = z.object({ id: uuidSchema, deviceId: uuidSchema, operation: operationSchema, ciphertext: ciphertextSchema }).strict();
export const confirmSchema = z.object({ ciphertext: ciphertextSchema }).strict();
export const pairingSchema = z.object({ name: z.string().trim().min(1).max(60) }).strict();
export const pairClaimSchema = z.object({ id: uuidSchema, secret: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const bridgeUpdateSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('awaiting_confirmation'), form: ciphertextSchema }).strict(),
  z.object({ state: z.enum(['completed', 'failed', 'unknown']), result: ciphertextSchema }).strict(),
]);
export const ACTIVE_STATES = ['queued', 'running', 'awaiting_confirmation'];
export const JOB_LIFETIME_MS = 120_000;
export function timedOutState(operation: string, state: string): string {
  return operation === 'send' && state !== 'queued' ? 'unknown' : 'expired';
}
export function isOnline(lastSeen: string | null, now = Date.now()) {
  return !!lastSeen && now - Date.parse(lastSeen) < 30_000;
}
export function assertSameOrigin(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) throw new Error('origin_rejected');
}
export const replySchema = z.object({
  deviceId: uuidSchema,
  chatId: z.string().min(1).max(160),
  account: z.string().min(1).max(160),
  recipientName: z.string().max(200),
  instruction: z.string().trim().min(1).max(1000),
  draft: z.string().max(5000).optional(),
  messages: z.array(z.object({ sender:z.string().max(160), text:z.string().max(5000), state:z.enum(['plaintext','decrypted','imported']) }).strict()).max(30),
}).strict();

export interface LineChat { id: string; name: string; kind: 'direct' | 'group' | 'room'; unread: number }
export interface LineMessage { id: string; chat_id: string; sender: string; time_ms: number; state: string; text?: string }
export interface LinePreview { id: string; account: string; chat_id: string; recipient_kind: string; text: string; review_token: string; expires_ms: number; recipient: { id:string; name:string; kind:string } }
export interface LineDevice { id:string; name:string; last_seen:string|null; revoked_at:string|null; paired_at:string|null }
