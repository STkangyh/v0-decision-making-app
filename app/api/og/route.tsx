import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
);

const EMOJI: Record<string, string> = {
  옷: "👕",
  음식: "🍔",
  인간관계: "💬",
  기타: "✨",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  let title = "고민 투표";
  let category = "기타";
  let optionA = "A";
  let optionB = "B";
  let pctA = 50;

  if (id) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      title = data.title;
      category = data.category;
      optionA = data.option_a;
      optionB = data.option_b;
      const total = (data.votes_a || 0) + (data.votes_b || 0);
      pctA = total > 0 ? Math.round((data.votes_a / total) * 100) : 50;
    }
  }

  const pctB = 100 - pctA;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background:
            "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            top: "-50px",
            right: "-30px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)",
            bottom: "40px",
            left: "-40px",
            display: "flex",
          }}
        />

        {/* Top: Category */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "22px",
              display: "flex",
            }}
          >
            {EMOJI[category] || "✨"} {category}
          </div>
        </div>

        {/* Center: Title */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            lineHeight: 1.3,
            maxWidth: "900px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Bottom section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Options */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                flex: 1,
                background: "rgba(59,130,246,0.2)",
                border: "2px solid rgba(59,130,246,0.4)",
                borderRadius: "16px",
                padding: "20px 24px",
                fontSize: "24px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "rgb(96,165,250)" }}>A.</span> {optionA}
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(239,68,68,0.2)",
                border: "2px solid rgba(239,68,68,0.4)",
                borderRadius: "16px",
                padding: "20px 24px",
                fontSize: "24px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "rgb(248,113,113)" }}>B.</span> {optionB}
            </div>
          </div>

          {/* Vote bar */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "36px",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pctA}%`,
                background: "rgb(59,130,246)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {pctA}%
            </div>
            <div
              style={{
                width: `${pctB}%`,
                background: "rgb(239,68,68)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {pctB}%
            </div>
          </div>

          {/* Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              fontSize: "20px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            대신결정해줘
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
