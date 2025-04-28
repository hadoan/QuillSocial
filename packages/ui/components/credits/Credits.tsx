import { COMPANY_NAME, IS_SELF_HOSTED } from "@quillsocial/lib/constants";
import Link from "next/link";
import { useEffect, useState } from "react";

// Relative to prevent triggering a recompile
import pkg from "../../../../apps/web/package.json";

export const CalComVersion = `v.${pkg.version}-${!IS_SELF_HOSTED ? "h" : "sh"}`;

export default function Credits() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <small className="text-default mx-3 mb-2 mt-1 hidden text-[0.5rem] opacity-50 lg:block">
      &copy; {new Date().getFullYear()}{" "}
      <Link
        href="https://go.quillsocial.co/credits"
        target="_blank"
        className="hover:underline"
      >
        {COMPANY_NAME}
      </Link>{" "}
      {hasMounted && (
        <Link
          href="https://go.quillsocial.co/releases"
          target="_blank"
          className="hover:underline"
        >
          {CalComVersion}
        </Link>
      )}
    </small>
  );
}
