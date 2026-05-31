/**
 * モバイル回線でも壊れにくい fetch ラッパー。
 *
 * 背景: スマホのモバイル回線は瞬間的な電波切れ / LTE⇄WiFi 切替 /
 * バックグラウンド復帰が日常的に起きるため、素の `fetch()` がそのまま
 * 失敗 → 未捕捉例外 → `app/error.tsx`（「ページを読み込めませんでした」）
 * に落ちやすい。
 *
 * このヘルパーは以下を足してその確率を下げる:
 *  - AbortController によるタイムアウト（無限ハング防止）
 *  - 一過性エラー（ネットワーク失敗 / タイムアウト / 5xx / 429）に対する
 *    指数バックオフ付きリトライ
 *  - 失敗種別を判別できる `ApiFetchError`
 *
 * 呼び出し側はこのモジュールの `apiFetch` / `apiFetchJson` を使い、
 * `catch` でユーザー向けの穏やかなエラー表示に切り替えること。
 * （= 例外をコンポーネント外に投げてエラーバウンダリに到達させない）
 */

export type ApiFetchErrorKind =
  | "timeout" // AbortController がタイムアウトで中断
  | "offline" // navigator.onLine === false
  | "network" // TypeError 等の接続失敗
  | "http"; // レスポンスは返ったが !res.ok

export class ApiFetchError extends Error {
  readonly kind: ApiFetchErrorKind;
  readonly status?: number;

  constructor(kind: ApiFetchErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiFetchError";
    this.kind = kind;
    this.status = status;
  }

  /** ユーザーにそのまま見せられる日本語メッセージ。 */
  get userMessage(): string {
    switch (this.kind) {
      case "offline":
        return "オフラインのようです。通信状況を確認してください。";
      case "timeout":
        return "通信に時間がかかっています。電波の良い場所でもう一度お試しください。";
      case "network":
        return "通信に失敗しました。電波状況を確認してもう一度お試しください。";
      case "http":
        return "サーバーでエラーが発生しました。しばらくしてからお試しください。";
    }
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** 1 回あたりのタイムアウト(ms)。既定 15000。 */
  timeoutMs?: number;
  /** 追加リトライ回数（初回を除く）。既定 2（= 最大 3 回試行）。 */
  retries?: number;
  /** リトライ初期待機(ms)。指数バックオフの基準。既定 600。 */
  retryBaseMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_BASE_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBrowserOffline(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "onLine" in navigator &&
    navigator.onLine === false
  );
}

/** リトライする価値のある一過性エラーか。 */
function isRetryable(err: ApiFetchError): boolean {
  if (err.kind === "timeout" || err.kind === "network") return true;
  if (err.kind === "http" && err.status) {
    // 429 (rate limit) と 5xx は時間を置けば回復しうる
    return err.status === 429 || err.status >= 500;
  }
  return false;
}

/**
 * タイムアウト + リトライ付き fetch。`!res.ok` も `ApiFetchError` として
 * throw する（呼び出し側で res.ok を再チェックする必要はない）。
 */
export async function apiFetch(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryBaseMs = DEFAULT_RETRY_BASE_MS,
    signal: callerSignal,
    ...init
  } = options;

  let lastError: ApiFetchError = new ApiFetchError(
    "network",
    "リクエストを実行できませんでした",
  );

  for (let attempt = 0; attempt <= retries; attempt++) {
    // 送信前にオフラインが明確なら即座に分かるメッセージで止める
    if (isBrowserOffline()) {
      lastError = new ApiFetchError("offline", "オフライン状態です");
      // オフラインはバックオフしても無駄なので少しだけ待って再判定
      if (attempt < retries) {
        await sleep(retryBaseMs);
        continue;
      }
      throw lastError;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // 呼び出し側 signal と内部 timeout signal の両方で中断できるようにする
    const onCallerAbort = () => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener("abort", onCallerAbort);
    }

    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      if (!res.ok) {
        throw new ApiFetchError(
          "http",
          `HTTP ${res.status}`,
          res.status,
        );
      }
      return res;
    } catch (err) {
      if (err instanceof ApiFetchError) {
        lastError = err;
      } else if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        // 呼び出し側が明示的に中断した場合はリトライせず透過
        if (callerSignal?.aborted) throw err;
        lastError = new ApiFetchError("timeout", "リクエストがタイムアウトしました");
      } else {
        lastError = new ApiFetchError(
          "network",
          err instanceof Error ? err.message : String(err),
        );
      }

      if (attempt < retries && isRetryable(lastError)) {
        // 指数バックオフ + ジッター
        const backoff =
          retryBaseMs * 2 ** attempt + Math.floor(Math.random() * 200);
        await sleep(backoff);
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
      if (callerSignal) callerSignal.removeEventListener("abort", onCallerAbort);
    }
  }

  throw lastError;
}

/** `apiFetch` + JSON パース。レスポンスが JSON でない場合は network 扱い。 */
export async function apiFetchJson<T>(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {},
): Promise<T> {
  const res = await apiFetch(input, options);
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiFetchError("network", "レスポンスの解析に失敗しました");
  }
}

/** 任意の例外をユーザー向け日本語メッセージへ変換する。 */
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiFetchError) return err.userMessage;
  return "予期しないエラーが発生しました。もう一度お試しください。";
}
