export type Category = "옷" | "음식" | "인간관계" | "기타";
export type Choice = "A" | "B";

export interface Post {
  id: string;
  category: Category;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  comments: Comment[];
  expiresAt: string; // ISO string for JSON serialization
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  nickname: string;
  createdAt: string;
}

export interface UserProfile {
  anonId: string;
  nickname: string;
  password: string;
}
