import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f1a",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Blob-like background circles */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,116,217,0.3) 0%, transparent 70%)",
            top: "-80px",
            left: "-100px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,65,54,0.25) 0%, transparent 70%)",
            top: "50px",
            right: "-50px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,153,112,0.25) 0%, transparent 70%)",
            bottom: "-60px",
            left: "200px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(177,13,201,0.2) 0%, transparent 70%)",
            bottom: "50px",
            right: "150px",
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            letterSpacing: "-2px",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          대신결정해줘
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "50px",
            display: "flex",
          }}
        >
          공부하다 막히면 우리한테 맡겨
        </div>

        {/* A vs B buttons */}
        <div style={{ display: "flex", gap: "24px" }}>
          <div
            style={{
              background: "rgba(59,130,246,0.25)",
              border: "2px solid rgba(59,130,246,0.5)",
              borderRadius: "20px",
              padding: "20px 48px",
              fontSize: "28px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "rgb(96,165,250)" }}>A</span> 이거
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
            }}
          >
            vs
          </div>
          <div
            style={{
              background: "rgba(239,68,68,0.25)",
              border: "2px solid rgba(239,68,68,0.5)",
              borderRadius: "20px",
              padding: "20px 48px",
              fontSize: "28px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "rgb(248,113,113)" }}>B</span> 저거
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
