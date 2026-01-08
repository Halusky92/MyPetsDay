import Image from "next/image";

export default function AppLogo({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="MyPetsDay"
      width={size}
      height={size}
      priority
      className={`select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
