"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceInputArgs {
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export interface UseVoiceInputResult {
  recording: boolean;
  supported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/**
 * Thin wrapper around the Web Speech API (`SpeechRecognition` /
 * `webkitSpeechRecognition`). Defaults to Japanese.
 *
 * - Works on Safari iOS 14.5+, Chrome desktop/Android, Edge
 * - Requires HTTPS or localhost (Vercel deployment is fine)
 * - First use prompts the user for microphone permission
 *
 * The hook re-attaches event handlers via refs so the latest `onResult`
 * closure is always used without recreating the recognition object.
 */
export function useVoiceInput({
  onResult,
  onError,
  lang = "ja-JP",
}: UseVoiceInputArgs): UseVoiceInputResult {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR =
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      const combined = (final + interim).trim();
      if (combined) {
        onResultRef.current(combined, Boolean(final));
      }
    };

    recognition.onend = () => setRecording(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setRecording(false);
      const code = event?.error ?? "unknown";
      const msg =
        code === "not-allowed"
          ? "マイクの使用が許可されていません。ブラウザの設定を確認してください"
          : code === "no-speech"
            ? "音声を検出できませんでした。もう一度試してください"
            : code === "audio-capture"
              ? "マイクが見つかりませんでした"
              : `音声認識エラー: ${code}`;
      setError(msg);
      onErrorRef.current?.(msg);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    setError(null);
    try {
      recognition.start();
      setRecording(true);
    } catch (e) {
      // start() throws if already running
      console.error(e);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setRecording(false);
  }, []);

  const toggle = useCallback(() => {
    if (recording) stop();
    else start();
  }, [recording, start, stop]);

  return { recording, supported, error, start, stop, toggle };
}
