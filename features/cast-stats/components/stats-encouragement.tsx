import Image from "next/image";

interface Props {
  /** 宛名 (キャスト名)。「{name}さんへ」と表示。 */
  name: string;
  message: string;
}

/**
 * さくらママからの応援 — dark bordeaux band + champagne-gold metallic frame の
 * トロフィーアバター + metallic 見出し。
 * (design ref: cast-stats.jsx EncouragementCard)
 */
export function StatsEncouragement({ name, message }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-hero p-[18px] flex items-start gap-3.5"
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 20% 20%, rgba(154,93,93,0.45) 0%, transparent 60%)," +
          "radial-gradient(ellipse 60% 60% at 90% 90%, rgba(140,111,68,0.18) 0%, transparent 60%)," +
          "linear-gradient(135deg, #3A1F1F 0%, #5E3838 60%, #3A1F1F 100%)",
        border: "1px solid rgba(235,217,168,0.25)",
        boxShadow:
          "0 8px 20px rgba(45,24,24,0.55), 0 28px 56px rgba(20,10,10,0.45)",
      }}
    >
      {/* top brass edge */}
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(235,217,168,0.50) 15%, rgba(235,217,168,0.50) 85%, transparent 100%)",
        }}
      />
      {/* avatar — champagne-gold metallic frame + さくらママ photo */}
      <span
        className="w-11 h-11 rounded-full p-0.5 shrink-0 block"
        style={{
          background: "var(--v5-champ-gold)",
          boxShadow: "0 6px 18px rgba(140,111,68,0.30)",
        }}
      >
        <span
          className="w-full h-full rounded-full overflow-hidden block"
          style={{ border: "1px solid #3A1F1F" }}
        >
          <Image
            src="/cast/sakura-mama.jpg"
            alt="さくらママ"
            width={44}
            height={44}
            className="w-full h-full object-cover"
          />
        </span>
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="font-serif text-[16px] leading-[1.2] mb-2 inline-block v5-metallic"
          style={{ letterSpacing: "0.04em" }}
        >
          {name}さんへ
        </div>
        <p
          className="m-0 font-serif text-[13px] leading-[1.75] font-medium"
          style={{ color: "#fdfcf9", letterSpacing: "0.02em" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
