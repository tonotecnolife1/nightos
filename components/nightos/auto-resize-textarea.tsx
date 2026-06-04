"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Minimum rows before the textarea starts growing. Default: 1 */
  minRows?: number;
  /** Maximum rows before the textarea scrolls internally. Default: 8 */
  maxRows?: number;
  /** Show a subtle character count. Default: false */
  showCount?: boolean;
  /** Max character count for the counter. */
  maxLength?: number;
}

/**
 * A textarea that auto-resizes vertically as the user types, just
 * like LINE / iMessage / WhatsApp input fields.
 *
 * Key UX decisions:
 * - Font size is 16px minimum → prevents iOS zoom-on-focus
 * - Enter creates a newline (not send) → matches LINE behavior
 * - Smooth CSS transition on height changes
 * - Touch-friendly: min-height 44px (Apple HIG)
 * - `resize: none` to prevent manual drag resize
 * - Works with both controlled and uncontrolled mode
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, Props>(
  function AutoResizeTextarea(
    {
      minRows = 1,
      maxRows = 8,
      showCount = false,
      maxLength,
      className,
      value,
      onChange,
      style,
      placeholder,
      ...rest
    },
    ref,
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);

    // Expose the inner ref to the parent
    useImperativeHandle(ref, () => innerRef.current!);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      // Reset height to measure scrollHeight correctly
      el.style.height = "auto";
      // Compute line height from computed styles
      const computed = window.getComputedStyle(el);
      const lineHeight = parseFloat(computed.lineHeight) || 24;
      const paddingY =
        parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
      const minHeight = lineHeight * minRows + paddingY;
      const maxHeight = lineHeight * maxRows + paddingY;
      // When the field is empty, the placeholder can wrap to several lines on
      // narrow screens. scrollHeight ignores the placeholder, so measure it by
      // temporarily mirroring the placeholder text — this keeps the hint fully
      // visible (responsive) instead of clipping it. Done synchronously before
      // paint, so it does not flicker or fight React's controlled value.
      let measuredHeight = el.scrollHeight;
      if (el.value === "" && el.placeholder) {
        el.value = el.placeholder;
        measuredHeight = Math.max(measuredHeight, el.scrollHeight);
        el.value = "";
      }
      const contentHeight = Math.min(
        Math.max(measuredHeight, minHeight),
        maxHeight,
      );
      el.style.height = `${contentHeight}px`;
    }, [minRows, maxRows]);

    // Resize on value / placeholder change (controlled mode) and on mount
    useEffect(() => {
      resize();
    }, [value, placeholder, resize]);

    // Re-measure when the viewport width changes (resize / orientation change)
    // so a wrapping placeholder stays fully visible across screen sizes.
    useEffect(() => {
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, [resize]);

    const charCount =
      typeof value === "string" ? value.length : undefined;

    return (
      <div className="relative w-full">
        <textarea
          ref={innerRef}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange?.(e);
            // Resize after React processes the change
            requestAnimationFrame(resize);
          }}
          rows={minRows}
          style={{
            ...style,
            // Prevent iOS zoom (font-size must be >= 16px)
            fontSize: "16px",
          }}
          className={cn(
            "w-full bg-transparent resize-none outline-none",
            "text-ink placeholder:text-ink-muted",
            "leading-relaxed",
            // Smooth height transition
            "transition-[height] duration-100 ease-out",
            // Minimum touch target height
            "min-h-[44px]",
            className,
          )}
          {...rest}
        />
        {showCount && maxLength && charCount !== undefined && (
          <div
            className={cn(
              "absolute bottom-1 right-2 text-[10px] pointer-events-none",
              charCount > maxLength * 0.9
                ? "text-wine-deep"
                : "text-ink-muted",
            )}
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  },
);
