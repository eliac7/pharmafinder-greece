import clsx from "clsx";
import Link from "next/link";

export default function LinkButton({
  children,
  ...props
}: {
  children: React.ReactNode;
  [x: string]: any;
}) {
  return (
    <Link
      className={clsx(
        "rounded-md bg-complementary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-complementary-700  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complementary-200",
        props?.className,
      )}
      href={props.href}
    >
      {children}
    </Link>
  );
}
