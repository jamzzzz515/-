import { ArcanaType, Spread, Suit, TarotCard, Theme } from './types';

// --- Themes ---
export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: '深邃星空',
    primaryColor: 'indigo',
    accentColor: 'yellow',
    cardBackBg: 'bg-indigo-950',
    cardBackBorder: 'border-yellow-600/50',
    cardBackPattern: 'stars',
    frontBg: 'bg-slate-900'
  },
  {
    id: 'nature',
    name: '森林秘境',
    primaryColor: 'emerald',
    accentColor: 'amber',
    cardBackBg: 'bg-emerald-950',
    cardBackBorder: 'border-amber-600/50',
    cardBackPattern: 'leaves',
    frontBg: 'bg-stone-900'
  },
  {
    id: 'mystic',
    name: '紫罗兰梦',
    primaryColor: 'purple',
    accentColor: 'pink',
    cardBackBg: 'bg-fuchsia-950',
    cardBackBorder: 'border-pink-500/50',
    cardBackPattern: 'moon',
    frontBg: 'bg-gray-900'
  }
];

// --- Spreads ---
export const SPREADS: Spread[] = [
  {
    id: 'single',
    name: '每日指引 (单张)',
    description: '抽取一张牌，获取当下的核心启示或今日运势。',
    positions: ['核心指引']
  },
  {
    id: 'time',
    name: '时间之流 (圣三角)',
    description: '探索事情的过去成因、当下状况以及未来趋势。',
    positions: ['过去的影响', '现在的状况', '未来的趋势']
  },
  {
    id: 'relationship',
    name: '关系探究 (爱之维纳斯)',
    description: '深度分析你与对方的关系动态、阻碍与结果。',
    positions: ['你的心态', '对方的心态', '关系现状', '未来发展']
  },
  {
    id: 'choice',
    name: '二选一抉择',
    description: '当面临两个选择时，分析各自的发展路径。',
    positions: ['现状', '选择A的结果', '选择B的结果', '综合建议']
  },
  {
    id: 'celtic',
    name: '凯尔特十字',
    description: '最经典的牌阵，全方位剖析复杂问题的内外因素。',
    positions: [
      '当前处境', '阻碍/助力', '潜意识基础', '过去经历', '近期未来', 
      '最佳结果', '自我状态', '环境影响', '希望与恐惧', '最终结果'
    ]
  }
];

// --- Deck Generation Data ---

const MAJOR_ARCANA_DATA = [
  { name: "愚人", mean: "新的开始，冒险，纯真，自发性", rev: "鲁莽，冒险，被利用" },
  { name: "魔术师", mean: "创造力，技能，意志力，自信", rev: "欺骗，意志薄弱，技能滥用" },
  { name: "女祭司", mean: "直觉，潜意识，神秘，智慧", rev: "压抑感情，隐藏秘密，肤浅" },
  { name: "皇后", mean: "丰饶，母性，自然，感官享受", rev: "依赖，创造力受阻，家庭问题" },
  { name: "皇帝", mean: "权威，结构，控制，父性", rev: "暴政，僵化，缺乏纪律" },
  { name: "教皇", mean: "传统，精神指引，信仰，学习", rev: "反叛，新的信仰，限制" },
  { name: "恋人", mean: "爱，和谐，关系，价值观选择", rev: "不和谐，失衡，分离" },
  { name: "战车", mean: "胜利，意志力，控制，决心", rev: "失控，侵略性，失败" },
  { name: "力量", mean: "勇气，耐心，控制，同情心", rev: "自我怀疑，软弱，不安全感" },
  { name: "隐士", mean: "内省，孤独，寻找真理，指导", rev: "孤立，孤独，拒绝帮助" },
  { name: "命运之轮", mean: "改变，周期，命运，转折点", rev: "厄运，抵抗变化，坏周期" },
  { name: "正义", mean: "公正，真相，因果，法律", rev: "不公，不诚实，缺乏责任" },
  { name: "倒吊人", mean: "牺牲，放下，新视角，等待", rev: "无谓的牺牲，停滞，拖延" },
  { name: "死神", mean: "结束，转变，重生，放手", rev: "抵抗改变，停滞，恐惧" },
  { name: "节制", mean: "平衡，适度，耐心，目标", rev: "失衡，过度，缺乏长期视野" },
  { name: "恶魔", mean: "束缚，物质主义，成瘾，欲望", rev: "打破束缚，重获自由，力量" },
  { name: "高塔", mean: "突变，混乱，启示，觉醒", rev: "避免灾难，推迟改变，恐惧" },
  { name: "星星", mean: "希望，灵感，宁静，精神力量", rev: "绝望，缺乏信仰，消极" },
  { name: "月亮", mean: "幻觉，恐惧，焦虑，潜意识", rev: "释放恐惧，清晰，揭示真相" },
  { name: "太阳", mean: "快乐，成功，活力，积极", rev: "悲伤，暂时受挫，不切实际" },
  { name: "审判", mean: "重生，内心的召唤，宽恕，决断", rev: "自我怀疑，拒绝召唤，悔恨" },
  { name: "世界", mean: "完成，整合，成就，旅行", rev: "未完成，缺乏封闭，停滞" }
];

const SUIT_MEANINGS: Record<Suit, { name: string, keywords: string, element: string }> = {
  [Suit.WANDS]: { name: "权杖", keywords: "行动，灵感，野心，火元素", element: "Fire" },
  [Suit.CUPS]: { name: "圣杯", keywords: "情感，关系，直觉，水元素", element: "Water" },
  [Suit.SWORDS]: { name: "宝剑", keywords: "思想，智力，冲突，风元素", element: "Air" },
  [Suit.PENTACLES]: { name: "星币", keywords: "物质，财富，工作，土元素", element: "Earth" },
  [Suit.NONE]: { name: "", keywords: "", element: "" }
};

const RANK_KEYWORDS = [
  "", // 0 placeholder
  "新的开始，潜力 (Ace)",
  "平衡，伙伴关系，决定 (Two)",
  "合作，成长，扩展 (Three)",
  "稳定，基础，休息 (Four)",
  "冲突，损失，变化 (Five)",
  "和谐，回忆，帮助 (Six)",
  "选择，评估，策略 (Seven)",
  "行动，力量，掌握 (Eight)",
  "完成，独立，反思 (Nine)",
  "圆满，结局，遗产 (Ten)",
  "消息，好奇，新想法 (Page)",
  "行动，追求，冲动 (Knight)",
  "培育，理解，组织 (Queen)",
  "权威，控制，掌握 (King)"
];

const generateDeck = (): TarotCard[] => {
  const deck: TarotCard[] = [];
  let idCounter = 1;

  // Major Arcana
  MAJOR_ARCANA_DATA.forEach((data, index) => {
    deck.push({
      id: idCounter++,
      name: data.name,
      suit: Suit.NONE,
      arcana: ArcanaType.MAJOR,
      number: index,
      description: "大阿卡纳代表生命中的重大课题与原型力量。",
      keywordsUpright: data.mean.split("，"),
      keywordsReversed: data.rev.split("，"),
      meaning: `${data.name}是塔罗中的第${index}号牌。它象征着：${data.mean}。在心理层面，它呼吁我们关注内在的这一部分能量。`
    });
  });

  // Minor Arcana
  const suits = [Suit.WANDS, Suit.CUPS, Suit.SWORDS, Suit.PENTACLES];
  
  suits.forEach(suit => {
    for (let i = 1; i <= 14; i++) {
      let name = "";
      let rankName = "";
      
      if (i <= 10) {
        rankName = i === 1 ? "王牌 (Ace)" : ["", "二", "三", "四", "五", "六", "七", "八", "九", "十"][i-1];
        name = `${suit}${rankName}`;
      } else {
        const courtNames = ["侍从", "骑士", "王后", "国王"];
        rankName = courtNames[i - 11];
        name = `${suit}${rankName}`;
      }

      const baseMeaning = SUIT_MEANINGS[suit];
      const rankKey = RANK_KEYWORDS[i];
      
      deck.push({
        id: idCounter++,
        name: name,
        suit,
        arcana: ArcanaType.MINOR,
        number: i,
        description: `小阿卡纳 - ${baseMeaning.name}牌组 (${baseMeaning.element})`,
        keywordsUpright: [`${baseMeaning.keywords}`, `${rankKey}`.split(' ')[0]],
        keywordsReversed: ["阻滞", "反向能量", "内在探索"],
        meaning: `${name}结合了${baseMeaning.name}的能量（${baseMeaning.keywords}）与数字/宫廷牌的含义（${rankKey}）。正位通常代表能量的顺畅流动与正向显化。`
      });
    }
  });

  return deck;
};

export const FULL_DECK = generateDeck();