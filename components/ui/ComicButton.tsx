import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "red" | "blue" | "green" | "orange" | "black" | "outline";

const variantClasses: Record<Variant, string> = {
  red: "bg-comic-red text-white",
  blue: "bg-sky-blue text-white",
  green: "bg-hero-green text-white",
  orange: "bg-action-orange text-white",
  black: "bg-comic-black text-white",
  outline: "bg-white text-comic-black",
};

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function ComicButton({
  href,
  variant = "red",
  className,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<
    React.ComponentProps<typeof Link>,
    "href" | "className"
  >) {
  return (
    <Link
      href={href}
      className={cn(
        "comic-panel-sm motion-safe-wiggle inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-lg tracking-wide transition-transform duration-150",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ComicButtonAsButton({
  variant = "red",
  className,
  children,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "comic-panel-sm motion-safe-wiggle inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-lg tracking-wide transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
