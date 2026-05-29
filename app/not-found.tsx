import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="text-5xl font-display font-bold text-ink-mute mb-2">404</div>
        <h1 className="text-lg font-bold text-ink mb-2">
          ページが見つかりません
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-btn bg-gradient-to-r from-[#9a7bbb] to-[#c98d80] text-white font-medium shadow-soft"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
