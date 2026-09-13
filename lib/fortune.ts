import type { BirthInfo, FortuneCategory, FortuneResult } from "@/types/fortune";

interface ScoreTier {
  min: number;
  texts: string[];
  keywords: string[];
}

// FNV-1a style string hash, kept small and dependency-free for a mock generator.
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// mulberry32: tiny seeded PRNG so the same inputs always produce the same result.
function createRandom(seed: number): () => number {
  let state = seed;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function pickCategory(tiers: readonly ScoreTier[], random: () => number): FortuneCategory {
  const score = Math.floor(40 + random() * 59); // 40 - 98
  const tier = tiers.find((t) => score >= t.min) ?? tiers[tiers.length - 1];
  return { score, description: pick(tier.texts, random), keywords: tier.keywords };
}

const OVERALL_TIERS: ScoreTier[] = [
  {
    min: 85,
    texts: [
      "하고자 하는 일마다 순조롭게 풀리는 기운이 가득한 하루예요. 자신감을 갖고 도전해보세요.",
      "행운이 자연스럽게 따라붙는 날이에요. 평소보다 적극적으로 움직여도 좋아요.",
    ],
    keywords: ["순항", "자신감"],
  },
  {
    min: 65,
    texts: [
      "무난하고 안정적인 흐름이 이어지는 하루예요. 서두르지 않아도 괜찮아요.",
      "특별한 굴곡 없이 평온하게 흘러가는 날이에요. 소소한 즐거움을 챙겨보세요.",
    ],
    keywords: ["안정", "평온"],
  },
  {
    min: 0,
    texts: [
      "평소보다 예민해지기 쉬운 날이에요. 중요한 결정은 잠시 미뤄두는 것도 방법이에요.",
      "생각만큼 속도가 나지 않을 수 있어요. 무리하지 말고 페이스를 조절해보세요.",
    ],
    keywords: ["예민함", "페이스조절"],
  },
];

const WEALTH_TIERS: ScoreTier[] = [
  {
    min: 85,
    texts: [
      "뜻밖의 수입이나 좋은 제안이 들어올 수 있는 날이에요. 기회를 놓치지 마세요.",
      "돈의 흐름이 원활해요. 미뤄뒀던 재정 계획을 세워보기 좋은 타이밍이에요.",
    ],
    keywords: ["재물기회", "수입증가"],
  },
  {
    min: 65,
    texts: [
      "지출과 수입이 균형을 이루는 안정적인 하루예요.",
      "큰 변동은 없지만 계획한 대로 관리하면 무난하게 흘러가요.",
    ],
    keywords: ["수지균형", "안정관리"],
  },
  {
    min: 0,
    texts: [
      "충동적인 소비는 피하는 게 좋겠어요. 지출 전 한 번 더 생각해보세요.",
      "예상치 못한 지출이 생길 수 있어요. 여유 자금을 확인해두세요.",
    ],
    keywords: ["지출주의", "충동소비주의"],
  },
];

const LOVE_TIERS: ScoreTier[] = [
  {
    min: 85,
    texts: [
      "설레는 만남이나 관계의 진전이 기대되는 하루예요.",
      "상대방과의 마음이 잘 통하는 날이에요. 솔직한 대화를 나눠보세요.",
    ],
    keywords: ["설렘", "관계진전"],
  },
  {
    min: 65,
    texts: [
      "평온하고 편안한 관계의 흐름이 이어져요.",
      "작은 배려가 관계를 더 따뜻하게 만들어주는 날이에요.",
    ],
    keywords: ["편안함", "배려"],
  },
  {
    min: 0,
    texts: [
      "사소한 오해가 생기기 쉬운 날이에요. 감정적인 대화는 피해보세요.",
      "혼자만의 시간을 가지며 마음을 정리하기 좋은 하루예요.",
    ],
    keywords: ["오해주의", "감정정리"],
  },
];

const CAREER_TIERS: ScoreTier[] = [
  {
    min: 85,
    texts: [
      "집중력이 크게 오르는 날이에요. 미뤄둔 일을 처리하기에 좋아요.",
      "성과를 인정받거나 좋은 평가를 받을 수 있는 기운이에요.",
    ],
    keywords: ["집중력상승", "성과인정"],
  },
  {
    min: 65,
    texts: [
      "꾸준한 페이스로 진행하면 무리 없이 마무리되는 하루예요.",
      "협업이 순조로운 날이에요. 동료와의 소통을 늘려보세요.",
    ],
    keywords: ["꾸준함", "협업순조"],
  },
  {
    min: 0,
    texts: [
      "집중력이 흐트러지기 쉬워요. 중요한 업무는 오전에 처리해보세요.",
      "예상치 못한 변수가 생길 수 있어요. 여유 있게 일정을 잡아두세요.",
    ],
    keywords: ["집중력분산", "일정관리"],
  },
];

const HEALTH_TIERS: ScoreTier[] = [
  {
    min: 85,
    texts: [
      "몸과 마음의 컨디션이 모두 좋은 하루예요. 활동적으로 움직여보세요.",
      "에너지가 넘치는 날이에요. 가볍게 운동을 시작해보기 좋아요.",
    ],
    keywords: ["컨디션최상", "활력"],
  },
  {
    min: 65,
    texts: [
      "특별히 무리하지 않는다면 편안한 컨디션을 유지할 수 있어요.",
      "규칙적인 생활 리듬을 지키면 무난하게 지나가는 하루예요.",
    ],
    keywords: ["컨디션유지", "규칙적생활"],
  },
  {
    min: 0,
    texts: [
      "피로가 쌓이기 쉬운 날이에요. 평소보다 일찍 휴식을 취해보세요.",
      "무리한 일정은 피하고 몸의 신호에 귀 기울여보세요.",
    ],
    keywords: ["피로누적", "휴식필요"],
  },
];

const MESSAGES = [
  "완벽하지 않아도 괜찮아요. 오늘의 최선이면 충분해요.",
  "작은 용기가 큰 변화를 만드는 하루입니다.",
  "지금의 속도도 나쁘지 않아요, 남과 비교하지 마세요.",
  "마음이 이끄는 대로 하루를 채워보세요.",
  "쉬어가는 것도 나아가는 방법 중 하나예요.",
  "오늘 만나는 인연을 소중히 여겨보세요.",
  "생각보다 당신은 잘 해내고 있어요.",
  "가벼운 마음으로 하루를 시작해보세요.",
];

const LUCKY_COLORS = [
  { name: "라벤더", hex: "#B9A6EC" },
  { name: "세이지 그린", hex: "#9CB69A" },
  { name: "코랄 핑크", hex: "#F3A79B" },
  { name: "스카이 블루", hex: "#8FC4E3" },
  { name: "크림 베이지", hex: "#EAD9B8" },
  { name: "미드나잇 블루", hex: "#5A6FA8" },
  { name: "로즈 우드", hex: "#C98594" },
  { name: "레몬 옐로", hex: "#EFD976" },
];

function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates a deterministic mock fortune for the given birth info.
 * The same name + birth date (+ time/gender) on the same day always return
 * the exact same result - there is no randomization knob here on purpose.
 */
export function generateFortune(info: BirthInfo): FortuneResult {
  const seedInput = [info.name, info.birthDate, info.birthTime, info.gender, todayKey()].join("|");
  const random = createRandom(hashString(seedInput));

  return {
    overall: pickCategory(OVERALL_TIERS, random),
    wealth: pickCategory(WEALTH_TIERS, random),
    love: pickCategory(LOVE_TIERS, random),
    career: pickCategory(CAREER_TIERS, random),
    health: pickCategory(HEALTH_TIERS, random),
    message: pick(MESSAGES, random),
    luckyColor: pick(LUCKY_COLORS, random),
    luckyNumber: Math.floor(1 + random() * 99),
  };
}
