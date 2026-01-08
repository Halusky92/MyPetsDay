import Image from "next/image";

export default function AppLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="shrink-0 rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm grid place-items-center"
      style={{ width: size, height: size }}
      aria-label="MyPetsDay logo"
      title="MyPetsDay"
    >
      <Image
        src="/logo.png"
        alt="MyPetsDay"
        width={size - 8}
        height={size - 8}
        className="rounded-xl"
        priority
      />
    </div>
  );
}
