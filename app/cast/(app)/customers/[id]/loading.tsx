// お客様カルテ専用のローディングスケルトン。
// list → karte の遷移時、next/link のプリフェッチがこの loading 境界まで
// 先読みされるため、クリック直後にカルテ型のスケルトンが即表示される。
export default function CustomerCardLoading() {
  return (
    <div className="animate-pulse">
      {/* PageHeader 相当 */}
      <div className="px-5 pt-8 pb-3">
        <div className="h-6 w-40 bg-pearl-soft rounded-btn" />
      </div>

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* ヘッダーカード */}
        <div className="h-24 bg-pearl-soft rounded-card" />

        {/* ファネル + 紹介元バッジ */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-pearl-soft rounded-badge" />
          <div className="h-5 w-24 bg-pearl-soft rounded-badge" />
        </div>

        {/* 写真アップロード枠 */}
        <div className="h-28 bg-pearl-soft rounded-card" />

        {/* §1 顧客情報 */}
        <div className="border-t border-line pt-4 space-y-2.5">
          <div className="h-5 w-28 bg-pearl-soft rounded-btn" />
          <div className="h-20 bg-pearl-soft rounded-card" />
        </div>

        {/* §2 来店情報 */}
        <div className="border-t border-ink/[0.06] pt-4 space-y-2.5">
          <div className="h-5 w-28 bg-pearl-soft rounded-btn" />
          <div className="h-24 bg-pearl-soft rounded-card" />
        </div>

        {/* §3 / §4 折りたたみセクション見出し */}
        <div className="border-t border-ink/[0.06] pt-2">
          <div className="h-10 bg-pearl-soft rounded-card" />
        </div>
        <div className="border-t border-ink/[0.06] pt-2">
          <div className="h-10 bg-pearl-soft rounded-card" />
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-pearl-soft rounded-btn" />
          <div className="h-12 bg-pearl-soft rounded-btn" />
        </div>
      </div>
    </div>
  );
}
