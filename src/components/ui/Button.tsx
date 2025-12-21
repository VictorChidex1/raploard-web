import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

// Define custom props
interface ButtonCustomProps {
  variant?: "primary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  withArrow?: boolean;
}

// Combine with Framer Motion button props
// We use Omit to avoid conflicts if they existed, though usually fine
type CombinedProps = ButtonCustomProps &
  Omit<
    HTMLMotionProps<"button">,
    keyof ButtonCustomProps | "ref" | "children"
  > & {
    ref?: React.Ref<HTMLButtonElement>;
    children?: React.ReactNode;
  };

const Button = React.forwardRef<HTMLButtonElement, CombinedProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      withArrow,
      children,
      ...props
    },
    ref
  ) => {
    // Variants for style
    const variants = {
      primary:
        "bg-brand-gold text-brand-dark hover:bg-white hover:text-black border border-transparent shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]",
      outline:
        "bg-transparent border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark",
      ghost: "bg-transparent text-white hover:bg-white/10",
      link: "bg-transparent text-brand-gold hover:underline p-0 h-auto",
    };

    // Sizes
    const sizes = {
      sm: "h-9 px-4 text-xs font-semibold uppercase tracking-wider",
      md: "h-11 px-6 text-sm font-semibold uppercase tracking-wider",
      lg: "h-14 px-8 text-base font-bold uppercase tracking-widest",
      icon: "h-11 w-11",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || (props as any).disabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {withArrow && (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
