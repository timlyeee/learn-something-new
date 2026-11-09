import { kanaRows } from "../../../data/content";

export type Script = "hiragana" | "katakana";
export interface Kana {
  hiragana: string;
  katakana: string;
  reading: string;
  row: number;
}
export const kana: Kana[] = kanaRows.flatMap(
  ([hiragana, katakana, readings], row) =>
    [...hiragana].map((letter, index) => ({
      hiragana: letter,
      katakana: katakana[index],
      reading: readings.split(" ")[index],
      row,
    })),
);
export const kanaGroups = [
  { title: "第一声问候", subtitle: "元音 · あ行", rows: [0] },
  { title: "慢慢找到节奏", subtitle: "か行 · さ行", rows: [1, 2] },
  { title: "再认识十个音", subtitle: "た行 · な行", rows: [3, 4] },
  { title: "把声音连起来", subtitle: "は行 · ま行", rows: [5, 6] },
  {
    title: "清音最后一站",
    subtitle: "や行 · ら行 · わ行 · ん",
    rows: [7, 8, 9],
  },
  {
    title: "声音的小变化",
    subtitle: "浊音 · が行 · ざ行 · だ行",
    rows: [10, 11, 12],
  },
  { title: "带上小圆点", subtitle: "ば行 · ぱ行", rows: [13, 14] },
];
export const katakanaGroups = [
  { title: "片假名的起点", subtitle: "元音 · ア行", rows: [0] },
  { title: "有角的假名", subtitle: "清音 · カ行", rows: [1] },
  { title: "再来五个角", subtitle: "清音 · サ行", rows: [2] },
  { title: "一笔一画", subtitle: "清音 · タ行", rows: [3] },
  { title: "柔和的一行", subtitle: "清音 · ナ行", rows: [4] },
  { title: "横竖交错", subtitle: "清音 · ハ行", rows: [5] },
  { title: "拐弯的线条", subtitle: "清音 · マ行", rows: [6] },
  { title: "三个小音", subtitle: "清音 · ヤ行", rows: [7] },
  { title: "笔直前行", subtitle: "清音 · ラ行", rows: [8] },
  { title: "收好结尾", subtitle: "清音 · ワ行 · ン", rows: [9] },
  {
    title: "两点浊音",
    subtitle: "浊音 · ガ行 · ザ行 · ダ行",
    rows: [10, 11, 12],
  },
  { title: "小圆圈半浊音", subtitle: "半浊音 · バ行 · パ行", rows: [13, 14] },
];
export interface KanaWord {
  text: string;
  kana: string;
  romaji: string;
  written: string;
  meaning: string;
  script: Script;
}
export const kanaWords: KanaWord[] = [
  {
    text: "ねこ",
    kana: "ねこ",
    romaji: "neko",
    written: "猫",
    meaning: "猫",
    script: "hiragana",
  },
  {
    text: "いぬ",
    kana: "いぬ",
    romaji: "inu",
    written: "犬",
    meaning: "狗",
    script: "hiragana",
  },
  {
    text: "すし",
    kana: "すし",
    romaji: "sushi",
    written: "寿司",
    meaning: "寿司",
    script: "hiragana",
  },
  {
    text: "みず",
    kana: "みず",
    romaji: "mizu",
    written: "水",
    meaning: "水",
    script: "hiragana",
  },
  {
    text: "やま",
    kana: "やま",
    romaji: "yama",
    written: "山",
    meaning: "山",
    script: "hiragana",
  },
  {
    text: "そら",
    kana: "そら",
    romaji: "sora",
    written: "空",
    meaning: "天空",
    script: "hiragana",
  },
  {
    text: "はな",
    kana: "はな",
    romaji: "hana",
    written: "花",
    meaning: "花",
    script: "hiragana",
  },
  {
    text: "あめ",
    kana: "あめ",
    romaji: "ame",
    written: "雨",
    meaning: "雨",
    script: "hiragana",
  },
  {
    text: "ほし",
    kana: "ほし",
    romaji: "hoshi",
    written: "星",
    meaning: "星星",
    script: "hiragana",
  },
  {
    text: "くるま",
    kana: "くるま",
    romaji: "kuruma",
    written: "車",
    meaning: "汽车",
    script: "hiragana",
  },
  {
    text: "コーヒー",
    kana: "こーひー",
    romaji: "kōhī",
    written: "コーヒー",
    meaning: "咖啡",
    script: "katakana",
  },
  {
    text: "パン",
    kana: "ぱん",
    romaji: "pan",
    written: "パン",
    meaning: "面包",
    script: "katakana",
  },
  {
    text: "ネコ",
    kana: "ねこ",
    romaji: "neko",
    written: "猫",
    meaning: "猫",
    script: "katakana",
  },
  {
    text: "バス",
    kana: "ばす",
    romaji: "basu",
    written: "バス",
    meaning: "公交车",
    script: "katakana",
  },
  {
    text: "ホテル",
    kana: "ほてる",
    romaji: "hoteru",
    written: "ホテル",
    meaning: "酒店",
    script: "katakana",
  },
  {
    text: "カメラ",
    kana: "かめら",
    romaji: "kamera",
    written: "カメラ",
    meaning: "相机",
    script: "katakana",
  },
  {
    text: "テレビ",
    kana: "てれび",
    romaji: "terebi",
    written: "テレビ",
    meaning: "电视",
    script: "katakana",
  },
  {
    text: "アイス",
    kana: "あいす",
    romaji: "aisu",
    written: "アイス",
    meaning: "冰淇淋",
    script: "katakana",
  },
  {
    text: "タクシー",
    kana: "たくしー",
    romaji: "takushī",
    written: "タクシー",
    meaning: "出租车",
    script: "katakana",
  },
  {
    text: "ケーキ",
    kana: "けーき",
    romaji: "kēki",
    written: "ケーキ",
    meaning: "蛋糕",
    script: "katakana",
  },
];

export interface KanaOrigin {
  source: string;
  story: string;
}
export const katakanaOrigins: Record<string, KanaOrigin> = {
  ア: { source: "阿", story: "来自汉字「阿」的左耳旁，像侧耳倾听，读 a。" },
  イ: { source: "伊", story: "取「伊」字左边的单人旁，像一个人站着，读 i。" },
  ウ: { source: "宇", story: "取「宇」字上面的宝盖头，像屋檐，读 u。" },
  エ: { source: "江", story: "取「江」字的工字旁，三道横，读 e。" },
  オ: { source: "於", story: "取「於」字的方字旁，像一面旗，读 o。" },
  カ: { source: "加", story: "取「加」字的力字旁，像用力挥手，读 ka。" },
  キ: { source: "幾", story: "取「幾」字上部，两横一竖，读 ki。" },
  ク: { source: "久", story: "取「久」字的左半，像弯曲的弧，读 ku。" },
  ケ: { source: "介", story: "取「介」字上部，像一个人，读 ke。" },
  コ: { source: "己", story: "取「己」字，方方正正的框，读 ko。" },
  サ: { source: "散", story: "取「散」字左上的草字头，读 sa。" },
  シ: { source: "之", story: "取「之」字，三点像水珠滑落，读 shi。" },
  ス: { source: "須", story: "取「須」字的一角，读 su。" },
  セ: { source: "世", story: "取「世」字，横竖交错，读 se。" },
  ソ: { source: "曾", story: "取「曾」字上部的两点，像轻轻点水，读 so。" },
  タ: { source: "多", story: "取「多」字的夕字旁，像夕阳，读 ta。" },
  チ: { source: "千", story: "取「千」字，一撇一横，读 chi。" },
  ツ: { source: "川", story: "取「川」字，三条水流，读 tsu。" },
  テ: { source: "天", story: "取「天」字的一横一撇，读 te。" },
  ト: { source: "止", story: "取「止」字的上半，读 to。" },
  ナ: { source: "奈", story: "取「奈」字的十字形，读 na。" },
  ニ: { source: "仁", story: "取「仁」字的二，两横，读 ni。" },
  ヌ: { source: "奴", story: "取「奴」字的一撇一捺，读 nu。" },
  ネ: { source: "祢", story: "取「祢」字的示字旁，读 ne。" },
  ノ: { source: "乃", story: "取「乃」字的一撇，干脆利落，读 no。" },
  ハ: { source: "八", story: "取「八」字，两撇分开，读 ha。" },
  ヒ: { source: "比", story: "取「比」字的左边，读 hi。" },
  フ: { source: "不", story: "取「不」字的上半，读 fu。" },
  ヘ: { source: "部", story: "取「部」字的右耳旁，像阶梯，读 he。" },
  ホ: { source: "保", story: "取「保」字的木字旁，读 ho。" },
  マ: { source: "末", story: "取「末」字，一横一竖，读 ma。" },
  ミ: { source: "三", story: "取「三」字，三横，读 mi。" },
  ム: { source: "牟", story: "取「牟」字的上部，读 mu。" },
  メ: { source: "女", story: "取「女」字，交叉的一撇，读 me。" },
  モ: { source: "毛", story: "取「毛」字，读 mo。" },
  ヤ: { source: "也", story: "取「也」字的上半，读 ya。" },
  ユ: { source: "由", story: "取「由」字，方框里一竖，读 yu。" },
  ヨ: { source: "与", story: "取「与」字，三横叠起，读 yo。" },
  ラ: { source: "良", story: "取「良」字的上半，读 ra。" },
  リ: { source: "利", story: "取「利」字的利刀旁，两竖，读 ri。" },
  ル: { source: "流", story: "取「流」字的一角，读 ru。" },
  レ: { source: "礼", story: "取「礼」字的右半，一撇一弯，读 re。" },
  ロ: { source: "呂", story: "取「呂」字，方方的口，读 ro。" },
  ワ: { source: "和", story: "取「和」字的禾字旁，读 wa。" },
  ヲ: { source: "乎", story: "取「乎」字，读 wo（作助词读 o）。" },
  ン: { source: "尓", story: "取「尓」字，轻轻一点，读 n。" },
};

export interface Level {
  id: string;
  title: string;
  subtitle: string;
  script: Script;
  rows: number[];
  kind: "kana" | "word";
}
export function levelsFor(script: Script): Level[] {
  const groups = script === "hiragana" ? kanaGroups : katakanaGroups;
  return [
    ...groups.map((group, index) => ({
      ...group,
      id: `${script}-${index}`,
      script,
      kind: "kana" as const,
    })),
    {
      id: `${script}-words`,
      title: "读懂你的第一个词",
      subtitle: "词语 · 看注音选中文",
      script,
      rows: [],
      kind: "word" as const,
    },
  ];
}
