export function RotatingBadge() {
  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[360px] flex items-center justify-center" style={{ zIndex: -1 }}>
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full"
        style={{ animation: 'spin 20s linear infinite' }}
        aria-hidden="true"
      >
        <defs>
          <path
            id="rotating-badge-circle"
            d="M 180,180 m -135,0 a 135,135 0 1,1 270,0 a 135,135 0 1,1 -270,0"
          />
        </defs>
        <text>
          <textPath
            href="#rotating-badge-circle"
            style={{ fill: "#FF6B00", fontSize: "22px", fontWeight: "bold", letterSpacing: "0.2em" }}
          >
            LIKELION ANIMAL LEAGUE ✦ LIKELION ANIMAL LEAGUE ✦
          </textPath>
        </text>
      </svg>
    </div>
  );
}
