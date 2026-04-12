const adjectives = ["졸린", "배고픈", "피곤한", "신난", "억울한", "떨리는"];
const animals = ["판다", "고양이", "강아지", "토끼", "햄스터", "수달"];

export function generateNickname(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj} ${animal}${num}`;
}
