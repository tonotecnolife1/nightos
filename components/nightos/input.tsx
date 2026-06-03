import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-label-md text-ink font-medium"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        style={{ fontSize: "16px" }}
        className={cn(
          "w-full h-11 px-3.5 rounded-btn bg-pearl-warm text-ink",
          "border border-pearl-soft outline-none transition-colors",
          "placeholder:text-ink-muted",
          "focus:border-champagne-dark focus:bg-white",
          error && "border-rose",
          className,
        )}
        {...rest}
      />
      {error ? (
        <p className="text-label-sm text-wine-deep">{error}</p>
      ) : hint ? (
        <p className="text-label-sm text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
});
