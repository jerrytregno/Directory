import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label="SaaSListingHub">
      <img src="/saaslistinghub-logo.png" alt="" width={448} height={88} className="h-8 w-auto sm:h-10" />
    </Link>
  );
}
