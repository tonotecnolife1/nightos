"use client";

import { useCallback, useRef } from "react";
import type { CompositionEvent } from "react";
import { isKanaReading, katakanaToHiragana } from "./kana";

/**
 * 氏名入力の IME 変換確定前のかなを採取し、読み仮名（name_kana）へ
 * 自動反映するためのフック。辞書を使わず、ユーザーが実際に打鍵した
 * 読みをそのまま拾うので依存ゼロ・誤読ゼロ。
 *
 * 仕組み:
 *  - compositionupdate でかな列の候補を控える（漢字へ変換される直前の値）
 *  - compositionend で確定読みを蓄積し、未編集なら name_kana へ反映
 *  - ユーザーが読み欄を手動編集したら以後の自動反映を停止（markKanaEdited）
 *  - 氏名を空にしたら蓄積をリセットし、自動反映を再開
 *
 * 使い方:
 *   const autoKana = useAutoKana({ setKana: setNameKana, initialEdited: !!初期値 });
 *   <input {...autoKana.bind}
 *          onChange={(e) => { setName(e.target.value); autoKana.onNameChange(e.target.value); }} />
 *   <input value={nameKana}
 *          onChange={(e) => { setNameKana(e.target.value); autoKana.markKanaEdited(); }} />
 */
export function useAutoKana(opts: {
  setKana: (value: string) => void;
  /** 既に読みが入っている編集画面では true（自動上書きしない）。 */
  initialEdited?: boolean;
}) {
  const { setKana } = opts;
  // 確定済みセッションの読み（複数回の変換確定を連結）
  const committed = useRef("");
  // 進行中の composition で観測した最新のかな候補
  const pending = useRef("");
  // ユーザーが読み欄を触ったら true（以後は自動反映しない）
  const kanaEdited = useRef(opts.initialEdited ?? false);

  const onCompositionStart = useCallback(() => {
    pending.current = "";
  }, []);

  const onCompositionUpdate = useCallback(
    (e: CompositionEvent<HTMLInputElement>) => {
      const data = (e.data ?? "").normalize("NFKC");
      // 変換前のかな列だけを控える。漢字混じりになったら更新しない。
      if (isKanaReading(data)) pending.current = katakanaToHiragana(data);
    },
    [],
  );

  const onCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLInputElement>) => {
      let reading = pending.current;
      // update を拾えなかった環境向けのフォールバック（確定値自体がかな）
      if (!reading) {
        const data = (e.data ?? "").normalize("NFKC");
        if (isKanaReading(data)) reading = katakanaToHiragana(data);
      }
      pending.current = "";
      if (!reading) return;
      committed.current += reading;
      if (!kanaEdited.current) setKana(committed.current);
    },
    [setKana],
  );

  /** 氏名 onChange 内で呼ぶ。クリア時に蓄積と自動反映をリセット。 */
  const onNameChange = useCallback(
    (value: string) => {
      if (value === "") {
        committed.current = "";
        pending.current = "";
        kanaEdited.current = false;
        setKana("");
      }
    },
    [setKana],
  );

  /** 読み仮名を手動編集／外部設定したら呼ぶ。以後の自動反映を止める。 */
  const markKanaEdited = useCallback(() => {
    kanaEdited.current = true;
  }, []);

  return {
    bind: { onCompositionStart, onCompositionUpdate, onCompositionEnd },
    onNameChange,
    markKanaEdited,
  };
}
