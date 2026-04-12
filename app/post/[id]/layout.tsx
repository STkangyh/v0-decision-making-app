import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://decide-for-me-bay.vercel.app";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("title, option_a, option_b, category")
    .eq("id", id)
    .single();

  const title = post ? `${post.title} | 대신결정해줘` : "대신결정해줘";
  const description = post
    ? `A: ${post.option_a} vs B: ${post.option_b}`
    : "공부하다 막히면 우리한테 맡겨";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`${BASE_URL}/api/og?id=${id}`],
      siteName: "대신결정해줘",
      locale: "ko_KR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/api/og?id=${id}`],
    },
  };
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
