export function RotatingBadge() {
  return (
    <div className="fixed bottom-6 right-6 z-30 w-[120px] h-[120px] rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="animate-spin-slow w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <path
            id="rotating-badge-circle"
            d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
          />
        </defs>
        <text>
          <textPath
            href="#rotating-badge-circle"
            style={{ fill: "#FF6B00", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.15em" }}
          >
            LIKELION ANIMAL LEAGUE ✦ LIKELION ANIMAL LEAGUE ✦
          </textPath>
        </text>
      </svg>
    </div>
  );
}
