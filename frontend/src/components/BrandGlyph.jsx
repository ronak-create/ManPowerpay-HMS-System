// Platform brand mark: the HMS emblem (same asset as /favicon.png,
// background removed so it sits on light and dark surfaces alike).
export default function BrandGlyph({ size = 36 }) {
  return (
    <img
      src="/favicon.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className="object-contain select-none"
      draggable="false"
    />
  );
}
