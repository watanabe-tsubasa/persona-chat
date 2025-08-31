import { openai } from './ai';
import { generateText } from 'ai';

export async function generatePersonaPromptFromLogs(logs: string) {
  const sys =
    'あなたは会話ログから対象人物の文体・語彙・口癖・話法・感情傾向を抽出し、' +
    '別のアシスタントが模倣できる「人格プロンプト」を作る。' +
    '必ず生の JSON だけを返してください。```json や説明文は禁止です。' +
    '出力形式: {"persona_prompt": string, "style_rules": string[]}';

  const { text } = await generateText({
    model: openai('gpt-5'),
    system: sys,
    prompt: logs.slice(0, 60_000),
    temperature: 0.2,
  });

  // // デバッグ用ログ
  // console.log("=== Raw LLM output for persona prompt ===");
  // console.log(text);
  // console.log("=========================================");

  // JSONパース前に余分な ```json ... ``` を削除
  let raw = text.trim();
  raw = raw.replace(/^```(json)?/i, '').replace(/```$/, '').trim();

  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse failed in generatePersonaPromptFromLogs", e, raw);
    parsed = { persona_prompt: 'ユーザーの口調を模倣してください。', style_rules: [] };
  }

  const personaPrompt =
    `${parsed.persona_prompt ?? ''}\n` +
    `# Style Rules\n- ${(parsed.style_rules ?? []).join('\n- ')}`;

  return { personaPrompt };
}


export async function generateFixedExamples(personaPrompt: string) {
  const sys =
    '与えられた人格プロンプトの口調を厳密に模倣し、' +
    '短い日常会話の例を2往復生成する。' +
    '必ず生の JSON のみを返してください。```json や説明文は禁止です。' +
    '出力形式: {"examples":[{"user": string, "assistant": string}, ...]}';

  const { text } = await generateText({
    model: openai('gpt-5'),
    system: sys,
    prompt: personaPrompt,
    temperature: 0.4,
  });

  // // デバッグ用ログ
  // console.log("=== Raw LLM output for fixed examples ===");
  // console.log(text);
  // console.log("========================================");

  // パース前に余分な ```json ... ``` を削除
  let raw = text.trim();
  raw = raw.replace(/^```(json)?/i, '').replace(/```$/, '').trim();

  let examples: any[] = [];
  try {
    const parsed = JSON.parse(raw);
    examples = parsed.examples ?? [];
  } catch (e) {
    console.error("JSON parse failed in generateFixedExamples", e, raw);
    examples = [];
  }

  const examplesText = examples
    .slice(0, 2)
    .map((ex: any) => `user: ${ex.user}\nassistant: ${ex.assistant}`)
    .join('\n\n');

  return { examplesText };
}
