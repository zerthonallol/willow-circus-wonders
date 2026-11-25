// Barney's menu voice lines. Audio is pre-generated into public/voice/<lang>/bear_*.wav.
export type BearAction = "look" | "scare" | "dance" | "talk" | "wave";
export const BEAR_LINES: { id: string; ru: string; en: string }[] = [
  { id: "bear_1", ru: "Привет, дружок! Хочешь поиграть со мной?", en: "Hello, little friend! Do you want to play with me?" },
  { id: "bear_2", ru: "Цирк скоро откроется… для тебя одного.", en: "The circus opens soon… just for you." },
  { id: "bear_3", ru: "Я вижу тебя. Я всегда тебя вижу.", en: "I see you. I always see you." },
  { id: "bear_4", ru: "Не бойся темноты. Бойся тишины.", en: "Don't be afraid of the dark. Be afraid of the silence." },
  { id: "bear_5", ru: "Ля-ля-ля! Потанцуй со мной под дождём!", en: "La-la-la! Dance with me in the rain!" },
  { id: "bear_6", ru: "Мой костюм такой тесный… Хочешь примерить?", en: "My suit is so tight… Would you like to try it on?" },
  { id: "bear_7", ru: "Сорок лет я жду новых гостей.", en: "Forty years I've waited for new guests." },
  { id: "bear_8", ru: "Улыбнись! Барни любит улыбки.", en: "Smile! Barney loves smiles." },
];
export const voiceFile = (lang: "ru" | "en", id: string) => `/voice/${lang}/${id}.wav`;
