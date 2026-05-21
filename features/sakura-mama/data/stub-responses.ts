import type { CustomerContext, Intent, ReplyOption } from "@/types/nightos";

/**
 * Deterministic 3-option "さくらママ" replies used when ANTHROPIC_API_KEY is unset
 * OR when the live Claude call errors out. Each call returns 3 stylistic
 * variations (safe / practical / warm) so the UX stays consistent with live mode.
 */
export function generateStubOptions(opts: {
  intent: Intent;
  hearingContext: Record<string, string>;
  customer?: CustomerContext | null;
  userText: string;
}): ReplyOption[] {
  const { intent, customer } = opts;
  const name = customer?.customer.name ?? "お客様";
  const surname = (customer?.customer.name ?? "お客様").split(/\s|　/)[0];
  const lastTopic = customer?.memo?.last_topic ?? null;
  const bottle = customer?.bottles[0] ?? null;
  const isVip = customer?.customer.category === "vip";

  if (intent === "follow") {
    const topicHint = lastTopic
      ? `${lastTopic}のお話`
      : `この前のお話`;
    return [
      {
        id: "A",
        style: "safe",
        label: "丁寧に寄り添う",
        content: `【文面例】\n「${surname}さま、先日はありがとうございました🌸 ${topicHint}、お伺いできて嬉しかったです。また続きを聞かせてくださいね。」\n\n【なぜ効く】\n3行で軽やか、かつ「覚えてる」が伝わる王道パターン。朝8時頃が読まれやすいわよ。`,
      },
      {
        id: "B",
        style: "practical",
        label: "端的で実用的",
        content: `【文面例】\n「${surname}さま、昨日はお疲れさまでした。${topicHint}の続き、次にお話しするの楽しみにしてます。」\n\n【なぜ効く】\n「続きを楽しみに」で次回の来店動機を軽く仕込む。VIPほど短いLINEが刺さるの。${bottle ? `\n\n「${bottle.brand}も残り${bottle.remaining_glasses}杯ですよ」と残量連絡をセットにするのも効く。` : ""}`,
      },
      {
        id: "C",
        style: "warm",
        label: "温かみと自嘲",
        content: `【文面例】\n「${surname}さま、昨日は私ずっと笑ってしまって、今朝ちょっと頬が痛いくらいです🌸 また元気をいただきに、お顔見せてくださいね。」\n\n【なぜ効く】\n自分の不完全さを軽く自開示する型。相手との距離を縮めるのに効くわよ。${isVip ? "VIPはこういう人間らしさに弱いの。" : ""}`,
      },
    ];
  }

  if (intent === "serving") {
    const exampleOpen = lastTopic
      ? `「${surname}さま、${lastTopic}、その後どうなりました？」`
      : `「${surname}さま、最近お忙しいですか？」`;
    return [
      {
        id: "A",
        style: "safe",
        label: "王道の切り出し",
        content: `【アドバイス】\n前回の話題から自然に繋げるのが一番安全。お酒を作りながら軽く聞くの。\n\n【文面例】\n${exampleOpen}\n\n【なぜ効く】\n「覚えてくれてる」実感が心を開かせる。無理に新しい話題を作らない。`,
      },
      {
        id: "B",
        style: "practical",
        label: "即効性のある問い",
        content: `【アドバイス】\n迷ったら「今日どこから来られました？」で場所の話に持ち込むの。移動経路は誰でも話せる話題。\n\n【文面例】\n「${surname}さま、今日はどちらからいらしたんですか？お疲れじゃないですか？」\n\n【なぜ効く】\n場所→疲れ→仕事、の連想で自然に近況を聞ける。新規にも使える万能技よ。`,
      },
      {
        id: "C",
        style: "warm",
        label: "空気を緩ませる",
        content: `【アドバイス】\n話させようとしないで、こっちが笑わせる一言から。「今日お店の前の桜、風で散りまくってて、私箒持って掃除してました🌸」みたいな小ネタ。\n\n【文面例】\n（自分の話→相手の反応を見て→質問、の順で）\n\n【なぜ効く】\n無口なお客様は質問されるより、自然に笑わせてほしいのよ。緊張がほどけたら向こうから話し出す。`,
      },
    ];
  }

  if (intent === "strategy") {
    return [
      {
        id: "A",
        style: "safe",
        label: "王道の型",
        content: `【アドバイス】\nまずは連絡の頻度を整えるの。24時間以内のお礼LINEを全員に送る、それだけで半分解決するわ。\n\n【行動】\n・毎日寝る前に未送信のお礼リストを確認\n・翌朝8時に送信予約\n・返信率を週単位で記録\n\n【なぜ効く】\n数字より「習慣」を作る方が先。習慣さえ作れば品質は後からついてくるわよ。`,
      },
      {
        id: "B",
        style: "practical",
        label: "即効の一手",
        content: `【アドバイス】\n今週1週間だけ、「前回の話題を1つ入れるLINE」を全員に送ってみて。型は同じでもお客様ごとの話題で個別化する。\n\n【例】\n「${surname}さまにはポルシェのお話、△△さまにはゴルフのお話、◯◯さまには出張のお話」\n\n【なぜ効く】\n個別化されたLINEは開封率が2倍。テンプレ感を一掃できる。`,
      },
      {
        id: "C",
        style: "warm",
        label: "心を整える",
        content: `【アドバイス】\n焦りは必ず相手に伝わるの。今夜は数字を忘れて「会いに来てくれてありがとう」って気持ちで一晩過ごしてみて。\n\n【行動】\n・鏡の前で笑顔を作る\n・好きな香水を一吹き\n・「今日も誰かを幸せにできる」と自分に言い聞かせる\n\n【なぜ効く】\n気の持ちようは接客に全部出る。土台の気持ちを整える夜も大事よ🌸`,
      },
    ];
  }

  // freeform
  const opener = lastTopic
    ? `${surname}さま、${lastTopic}のこと`
    : `${surname}さま`;
  return [
    {
      id: "A",
      style: "safe",
      label: "無難に近況から",
      content: `【文面例】\n「${opener}、その後いかがですか？🌸 ふと気になって連絡してしまいました。」\n\n【なぜ効く】\n『ふと気になって』は「追ってない感」を出しつつ関心を伝える魔法の言葉。`,
    },
    {
      id: "B",
      style: "practical",
      label: "用事をつくる",
      content: `【文面例】\n「${name}さま、お店に新しい銘柄が入って、${name}さまに教えたくて一筆。次いらした時に味見してみませんか？」\n\n【なぜ効く】\n来店理由を提供するのが最強。抽象的な誘いより具体的な「試す」が効く。`,
    },
    {
      id: "C",
      style: "warm",
      label: "空気で伝える",
      content: `【文面例】\n「${opener}、今日ふと思い出して、私ちょっと嬉しくなりました🌙 ${name}さまもお変わりなく、お元気でいらしたら嬉しいです。」\n\n【なぜ効く】\nこちらの気持ちを静かに伝えるだけで返信を期待しない。心に残る手紙風のLINEよ。`,
    },
  ];
}

/**
 * ブラッシュアップ用のスタブ。前回回答と方向性から3バリエーションを返す。
 */
export function generateStubRefinedOptions(opts: {
  previousReply: string;
  direction: string;
}): ReplyOption[] {
  const { direction, previousReply } = opts;
  const snippet = previousReply.slice(0, 80).replace(/\n/g, " ");
  return [
    {
      id: "A",
      style: "safe",
      label: `${direction}（安全策）`,
      content: `【文面例】\n「（${direction}を意識した丁寧な書き直し）」\n\n【なぜ効く】\n前回の「${snippet}…」をベースに、${direction}の方向でトーンを整えた版。無難な仕上がりで失敗しない型。\n\n（本番ではClaudeが具体的な文面を生成します）`,
    },
    {
      id: "B",
      style: "practical",
      label: `${direction}（実用版）`,
      content: `【文面例】\n「（${direction}を実用寄りで適用した短めの書き直し）」\n\n【なぜ効く】\n${direction}の方向性を実用度優先で反映。すぐ使える短さを重視。\n\n（本番ではClaudeが具体的な文面を生成します）`,
    },
    {
      id: "C",
      style: "warm",
      label: `${direction}（情緒版）`,
      content: `【文面例】\n「（${direction}を温度感強めで適用）」\n\n【なぜ効く】\n${direction}を最大限活かし、感情の機微を前面に出した書き直し。\n\n（本番ではClaudeが具体的な文面を生成します）`,
    },
  ];
}

/**
 * @deprecated Use generateStubOptions instead. Keeps backward compat until old call sites migrate.
 */
export function generateStubReply(opts: {
  intent: Intent;
  hearingContext: Record<string, string>;
  customer?: CustomerContext | null;
  userText: string;
}): string {
  return generateStubOptions(opts)[0].content;
}
