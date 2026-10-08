import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "secondary-prominent"
  | "secondary-surface"
  | "destructive"
  | "destructive-subtle"
  | "destructive-quiet"
  | "quiet"
  | "quiet-accent";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand font-semibold text-zinc-950 hover:bg-brand-hover disabled:hover:bg-brand",
  secondary:
    "border border-white/10 text-zinc-300 hover:bg-white/6 disabled:hover:bg-transparent",
  "secondary-prominent":
    "border border-white/10 bg-white/10 text-zinc-300 hover:bg-white/30 disabled:hover:bg-white/10",
  "secondary-surface":
    "border border-white/10 bg-[#19191c] text-zinc-300 hover:bg-white/[0.07] disabled:hover:bg-[#19191c]",
  destructive:
    "bg-red-400 font-semibold text-zinc-950 hover:bg-red-300 disabled:hover:bg-red-400",
  "destructive-subtle":
    "border border-red-400/20 bg-red-400/10 text-red-300 hover:border-red-400/40 hover:bg-red-400/15 hover:text-red-200 disabled:hover:border-red-400/20 disabled:hover:bg-red-400/10 disabled:hover:text-red-300",
  "destructive-quiet":
    "border border-transparent text-red-400 hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-400 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-red-400",
  quiet: "text-zinc-300 hover:bg-white/[0.07] disabled:hover:bg-transparent",
  "quiet-accent":
    "text-brand-text hover:text-brand-hover disabled:hover:text-brand-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-9 px-3.5 text-sm",
  lg: "h-10 px-4 text-sm",
  icon: "size-9 p-0",
  "icon-sm": "size-8 p-0",
  "icon-lg": "size-10 p-0",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean;
  };

export default function Button({
  variant,
  size,
  loading = false,
  disabled = false,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
    />
  );
}
