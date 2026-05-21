/**
 * さくらママ 教師データ - Training Examples
 *
 * 現役キャスト（お姉さん・キャスト）が実際に遭遇する相談シーンを100パターン収録。
 * 本物の銀座のママが答える「型」「具体的な一言」「NG」を言語化し、
 * システムプロンプトの few-shot / RAG 検索で使う。
 *
 * 追加ルール（いずれ Phase 2 で実店舗のママに確認）:
 * - 抽象論禁止、具体的な台詞・LINE文面まで落とす
 * - LINE文面は3〜4行以内
 * - 顧客には「さま」、キャストには「〜ちゃん」「〜さん」
 */

export interface TrainingExample {
  id: string;
  category: string;
  situation: string;
  cast_query: string;
  sakura_answer: string;
  why_it_works: string;
  ng_example: string;
  tags: string[];
}
