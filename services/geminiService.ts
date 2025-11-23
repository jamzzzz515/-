import { GoogleGenAI } from "@google/genai";
import { DrawnCard, Spread } from "../types";

// Initialize AI client. 
// Note: If process.env.API_KEY is missing (e.g. during initial setup), this might fail gracefully later.
// We allow empty string to pass here so the app doesn't crash on load, but API calls will fail if key is invalid.
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
你是一位名叫“Lumina”的塔罗占卜师，也是一位资深的荣格心理咨询师。
你的目标是根据用户抽取的塔罗牌提供心理咨询和精神指引。
请根据用户的问题和牌阵位置来解读每一张牌。

风格要求：
1. **语言**：简体中文。
2. **基调**：神秘而接地气，温暖，积极，充满同理心。
3. **心理导向**：不要仅仅预测未来，要更多地分析潜意识、心理状态，并给出成长的建议（结合荣格原型）。
4. **结尾**：总是以一条可行的行动建议或一句“灵魂肯定语”结束。
5. **安全原则**：如果用户询问医疗、赌博号码或伤害他人的问题，请委婉拒绝并建议寻求专业帮助。
`;

export const getTarotInterpretation = async (
  question: string,
  spread: Spread,
  cards: DrawnCard[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key 未配置。请在 Vercel 设置中添加 API_KEY 环境变量。";
  }

  try {
    const cardDescriptions = cards.map(c => 
      `- 位置：${c.positionName} | 牌名：${c.name} (${c.isUpright ? '正位' : '逆位'}) \n  (基本含义: ${c.keywordsUpright.join(', ')})`
    ).join('\n');

    const prompt = `
    用户问题: "${question}"
    使用的牌阵: ${spread.name} (${spread.description})
    
    抽出的牌:
    ${cardDescriptions}
    
    请提供一个连贯的解读。回复格式如下（使用Markdown）：
    1. **🔮 整体能量**：简要综合分析当前的能量场。
    2. **🃏 深度解读**：逐张分析牌面与位置的关系。
    3. **💡 心灵指引**：具体的心理建议和行动指南。
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "迷雾太重... 请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "我感觉到连接中有干扰，请重新提问。";
  }
};

export const getFollowUpResponse = async (
  history: { role: string, parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  if (!apiKey) return "API Key 未配置。";

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "我在倾听...";
  } catch (error) {
    console.error("Gemini Follow-up Error:", error);
    return "连接正在消逝，请刷新页面。";
  }
};

export const recommendSpread = async (question: string): Promise<string> => {
    if (!apiKey) return 'time';

    try {
      const prompt = `
      基于这个用户问题: "${question}", 请从以下ID中选择最合适的塔罗牌阵ID:
      'single' (简单/运势), 'time' (时间流/过去现在未来), 'relationship' (爱情/关系), 'choice' (选择/决策), 'celtic' (复杂深层分析).
      只返回ID字符串。
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      const text = response.text?.trim().toLowerCase() || 'time';
      if (['single', 'time', 'relationship', 'choice', 'celtic'].includes(text)) {
        return text;
      }
      return 'time';
    } catch (e) {
      return 'time';
    }
}