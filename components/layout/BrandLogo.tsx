import Image from "next/image";

const src = "/nf-horizontal-logo/two-colors/nf-horizontal-logo-two-colors.png";

export function BrandLogo({
  className = "h-9 w-auto",
  priority = false,
  id,
}: {
  className?: string;
  priority?: boolean;
  id?: string;
}) {
  return (
    <Image
      id={id}
      src={src}
      alt="New Foster"
      width={3543}
      height={895}
      sizes="180px"
      priority={priority}
      className={className}
    />
  );
}
