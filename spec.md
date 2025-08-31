# spec.md

## 概要

* **目的**: LINE などの会話履歴を貼り付け → そこから相手の「文体・口癖・傾向」を抽出 → 生成した**人格プロンプト**を使って、その人風に対話できる Web アプリ（試作）。
* **最重要要件**: トークンコストを抑えつつ“それっぽさ”を維持。

  * OpenAI **Prompt Caching** を前提とし、**毎回同一の静的プレフィックス**（人格プロンプト＋少数の固定サンプル）を **先頭**に置く設計で、キャッシュヒットを最大化。([OpenAI Platform][1])
  * 人格プロンプトは**短い規則**＋**最小限の例**に圧縮（必要に応じて自動圧縮）。
* **想定規模**: 個人/小チームのプロトタイプ。Web（Next.js）＋簡易 DB（Supabase）。

## スコープ

* ✅ できること

  * 履歴貼り付け → 人格抽出 → プロンプト保存
  * 保存済み人格を選んでチャット
  * Prompt Caching ベストプラクティスに従ったメッセージ構造
* 🚫 今回はやらない

  * マルチモーダル（画像/音声）
  * 外部 SNS/LINE 公式 API からの自動取り込み
  * 本番級の多段 RAG・Fine-tuning

## アーキテクチャ

* **フロント**: Next.js（App Rouer)
* **API**: Next.js API Routes（/api/personas, /api/chat）
* **LLM**: OpenAI（抽出: `gpt-4o-mini`、対話: `gpt-4o`）
* **DB**: Supabase（`personas` テーブルで人格を管理）
* **キャッシュ戦略**:

  * OpenAI **Prompt Caching（自動）**。キャッシュは**同一組織内での同一プレフィックス一致**時に効果。**プロンプトの“先頭”に静的内容**、可変は末尾。**最低 1024 トークン以上**で効果が出る点も考慮（必要なら“固定の会話例”でプレフィックスを補強）。([OpenAI Platform][1], [Microsoft Learn][3])
  * **課金**: キャッシュ命中分は**割引**（OpenAI 公開情報に準拠）。([OpenAI][2])

## データモデル（Supabase）

```sql
create table personas (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,               -- 相手の名前や識別子
  persona_prompt text not null,     -- 圧縮済みの人格プロンプト（静的）
  examples text,                    -- 固定少数の例（静的）
  created_at timestamp default now()
);
```

## API 仕様

### POST `/api/personas`（人格生成）

* **req**: `{ userId: string, name: string, logs: string }`
* **flow**:

  1. `logs` から人格抽出 → 圧縮
  2. 固定サンプル（2〜3 往復）を生成（任意）
  3. Supabase に保存 → `personaId` 返却
* **res**: `{ personaId, personaPrompt, examples }`

### POST `/api/chat`（対話）

* **req**: `{ personaId: string, message: string, history?: Array<{role:"user"|"assistant",content:string}> }`
* **prompt 構成（キャッシュ前提）**

  1. **system**: `personaPrompt`（静的・先頭）
  2. **assistant/user**: `examples`（固定）
  3. **（任意）** 過去の圧縮履歴（短縮）
  4. **user**: 最新メッセージ
* **res**: `{ reply: string }`

## プロンプト設計

* **出力形式の厳格化**: 箇条書き・禁止/許可・文体規則を明記
* **例（few-shot）**: 2〜3 往復まで（固定化してキャッシュ対象）
* **圧縮**: 300〜600 tokens 目安。足りなければ固定例で 1024+ に調整し、キャッシュ割引を狙う。([OpenAI Platform][1])

## セキュリティ/プライバシー/倫理

* 実在人物の模倣については **同意の有無**に配慮。ログはユーザーの**端末→サーバ間で TLS**、DB は**暗号化**・**アクセス制御**。
* 利用規約上の**同意取得**・削除リクエスト（忘れられる権利に準じた実装）を用意。
* OpenAI 側の **Prompt Caching は組織内で共有**される仕組みだが、**他組織と共有されない**（ドキュメントの趣旨）。社外ログの扱いは社内規程に合わせる。([OpenAI Platform][1])

## 運用・監視

* ログ: 失敗時の LLM リクエスト、トークン使用量、レイテンシ
* メトリクス: キャッシュ想定ヒット率（同一プレフィックス数）、平均応答時間
* リトライ: ネットワーク 5xx は指数バックオフ

## テスト

* 単体: 人格抽出の出力形式、プロンプト圧縮の最大長
* 結合: `/api/personas`→`/api/chat` の一連
* 回帰: 人格変更時も**先頭プレフィックスの安定性**を保てているか

## 環境変数

```
OPENAI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...  # サーバ側のみ
```

## 既知の制約

* Prompt Caching は**短期のエフェメラルキャッシュ**。長期的な永続は保証されない。**キャッシュに頼りすぎず**、プロンプト自体の圧縮・最適化を併用。([OpenAI Platform][1])

---

## 実装メモ（キャッシュ最適化のコツ）

* **静的プレフィックスを常に同一に**（`system` と固定 few-shot を必ず同順・同内容で先頭に）。キャッシュは**正確な先頭一致**でヒットします。([OpenAI Platform][1])
* **可変要素は末尾に寄せる**（最新 user・必要最低限の履歴だけ）。
* **短い人格＋固定例**のハイブリッド：

  * 人格を 300–600 tokens に圧縮しつつ、必要なら固定例を 2〜3 往復付与して **1024+** を満たし、キャッシュ割引の恩恵を受けやすくする。([Microsoft Learn][3])
* **コスト見積**と監視：モデルは `gpt-4o` / `gpt-4o-mini` を使い分け。キャッシュ命中時は**入力トークン割引**が適用されます。([OpenAI][2])

---

必要なら、この spec/snippets を **RAG 追加（Supabase pgvector）**や**ストリーミング**、\*\*認証（Clerk/Supabase Auth）\*\*まで拡張した版も用意できます。

[1]: https://platform.openai.com/docs/guides/prompt-caching/how-it-works?utm_source=chatgpt.com "Prompt caching - OpenAI API"
[2]: https://openai.com/index/api-prompt-caching/?utm_source=chatgpt.com "Prompt Caching in the API - OpenAI"
[3]: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/prompt-caching?utm_source=chatgpt.com "Prompt caching with Azure OpenAI in Azure AI Foundry ..."
