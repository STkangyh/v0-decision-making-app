const BAD_WORDS = [
  "씨발", "시발", "ㅅㅂ", "병신", "ㅂㅅ", "개새끼", "새끼",
  "지랄", "ㅈㄹ", "미친", "ㅁㅊ", "꺼져", "죽어", "보지",
  "자지", "섹스", "sex", "fuck", "shit", "bitch", "asshole",
  "존나", "ㅈㄴ", "닥쳐", "개같은", "창녀", "걸레",
];

export function filterBadWords(text: string): string {
  let filtered = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}

export function hasBadWords(text: string): boolean {
  return BAD_WORDS.some((word) =>
    text.toLowerCase().includes(word.toLowerCase())
  );
}
