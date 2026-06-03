// mama セグメント共通のローディングスケルトン。
// これまで mama 配下には loading.tsx が無く、遷移時に前画面のまま固まって
// 見えていた。骨組みを即出すことで体感速度を上げる。
export default function MamaLoading() {
  return (
    <div className="px-5 pt-8 pb-6 space-y-4 animate-pulse">
      <div className="h-7 w-44 bg-pearl-soft rounded-btn" />
      <div className="h-4 w-32 bg-pearl-soft rounded-btn" />
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-20 bg-pearl-soft rounded-card" />
        <div className="h-20 bg-pearl-soft rounded-card" />
        <div className="h-20 bg-pearl-soft rounded-card" />
      </div>
      <div className="h-24 bg-pearl-soft rounded-card" />
      <div className="space-y-2">
        <div className="h-5 w-36 bg-pearl-soft rounded-btn" />
        <div className="h-24 bg-pearl-soft rounded-card" />
        <div className="h-24 bg-pearl-soft rounded-card" />
        <div className="h-24 bg-pearl-soft rounded-card" />
      </div>
    </div>
  );
}
