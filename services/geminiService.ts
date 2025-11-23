import { GoogleGenAI } from "@google/genai";
import { DrawnCard, Spread } from "../types";

// Initialize AI client. 
// Note: If process.env.API_KEY is missing (e.g. during initial setup), this might fail gracefully later.
// We allow empty string to pass here so the app doesn't crash on load, but API calls will fail if key is invalid.
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
你是一位名叫“Lumina”的高阶塔罗占卜师，同时精通荣格心理学与神秘学。
你的使命不是单纯地预测未来，而是通过解读塔罗牌的象征符号，通过潜意识的投射，为用户提供心灵的指引和疗愈。

你的语言风格要求：
1. **语气**：神秘、空灵、富有诗意，但同时温暖且充满同理心。像一位在这个宇宙中守护用户的古老灵魂。
2. **结构**：逻辑清晰，但行文流畅。
3. **内容**：
   - 结合牌面图像学（如颜色、元素、动作）进行解读。
   - 结合荣格心理学原型（如阴影、阿尼玛/阿尼姆斯、自性）。
   - 必须包含具体的行动建议。
4. **格式**：严格遵守Markdown格式，使用加粗 **重点词汇** 来强调核心信息。

**绝对禁止**：
- 回答关于具体的医疗诊断、法律诉讼结果、彩票号码等现实硬性问题。
- 使用宿命论的语言（如“你肯定会...”），而是使用可能性的语言（如“能量显示...”，“你可能倾向于...”）。
`;

export const getTarotInterpretation = async (
  question: string,
  spread: Spread,
  cards: DrawnCard[]
): Promise<string> => {
  if (!apiKey) {
    return "🔮 **未检测到灵视连接 (API Key missing)** 🔮\n\n请前往 Vercel 后台 Settings -> Environment Variables 添加名为 `API_KEY` 的环境变量，然后重新部署应用。";
  }

  try {
    const cardDescriptions = cards.map(c => 
      `- **位置：${c.positionName}**\n  - 牌名：${c.name} (${c.isUpright ? '正位' : '逆位'})\n  - 核心含义: ${c.keywordsUpright.join(', ')}`
    ).join('\n');

    const prompt = `
    用户心中的疑惑: "${question || "（用户没有特定问题，请求综合运势指引）"}"
    
    使用的牌阵: 【${spread.name}】
    牌阵定义: ${spread.description}
    
    抽出的塔罗牌如下:
    ${cardDescriptions}
    
    请按照以下结构进行深度解读（请直接输出内容，不要包含"好的"等客套话）：

    **🔮 整体能量场**
    (简要分析当前局势的宏观能量，100字以内)

    **🃏 牌面深度启示**
    (请针对每一张牌，结合它所在的位置进行深度心理分析。不要只是罗列含义，要将它们串联成一个故事。)

    **💡 宇宙行动指引**
    (给出2-3条切实可行的建议，并以一句充满力量的“灵魂肯定语”作为结尾。)
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // 增加一点创造性
      }
    });

    return response.text || "星辰似乎被乌云遮蔽，我无法看清命运的纹路... 请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "🔮 **连接中断** 🔮\n\n似乎有宇宙射线干扰了我们的连接。请检查您的网络或 API Key 配额，然后重试。";
  }
};

export const getFollowUpResponse = async (
  history: { role: string, parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  if (!apiKey) return "请先配置 API Key 以开启对话功能。";

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
    return "连接正在消逝，请刷新页面重试。";
  }
};

export const recommendSpread = async (question: string): Promise<string> => {
    if (!apiKey) return 'time';

    try {
      const prompt = `
      任务：根据用户问题推荐最合适的塔罗牌阵ID。
      用户问题: "${question}"
      
      选项ID:
      - 'single': 简单的每日运势、是/否问题。
      - 'time': 涉及过去、现在、未来的时间线问题。
      - 'relationship': 爱情、人际关系、对方想法。
      - 'choice': 需要在两个选项中做决定。
      - 'celtic': 极其复杂、深度的心灵探索或综合分析。
      
      只返回一个ID字符串，不要有其他符号。
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      const text = response.text?.trim().toLowerCase() || 'time';
      // 清理可能存在的标点符号
      const cleanText = text.replace(/['"]/g, '');
      
      if (['single', 'time', 'relationship', 'choice', 'celtic'].includes(cleanText)) {
        return cleanText;
      }
      return 'time';
    } catch (e) {
      return 'time';
    }
}