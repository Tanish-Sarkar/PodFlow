/** The PodFlow mark as an `next/og` element, for the favicon and touch icon. */
export function BrandMark({ size }: { size: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#4F46E5",
        borderRadius: Math.round(size * 0.25),
      }}
    >
      <svg width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} viewBox="0 0 32 32">
        <path
          d="M5 10h7c3 0 4 2 4 6s1 6 4 6h7M5 16h22M5 22h7c3 0 4-2 4-6s1-6 4-6h7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
