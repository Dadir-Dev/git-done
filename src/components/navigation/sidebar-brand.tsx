import Image from "next/image";
import Link from "next/link";

export default function SidebarBrand() {
  return (
    <Link href="/dashboard">
      <Image
        src="/git-done_remove-bg_.png"
        alt="GitDone"
        width={200}
        height={200}
      />
    </Link>
  );
}
