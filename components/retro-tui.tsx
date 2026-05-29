"use client";

import React, { useState, useEffect, useRef } from "react";

// 1. BlinkCursor
export function BlinkCursor() {
  return <span className="text-[var(--primary)] cursor-blink select-none inline">█</span>;
}

// 2. TypewriterText
export function TypewriterText({
  lines,
  delayMs = 80,
  onComplete,
}: {
  lines: string[];
  delayMs?: number;
  onComplete?: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);

  useEffect(() => {
    if (lines.length === 0) return;

    if (currentLineIdx >= lines.length) {
      if (onComplete) onComplete();
      return;
    }

    const currentLineText = lines[currentLineIdx];

    if (currentCharIdx < currentLineText.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => {
          const next = [...prev];
          next[currentLineIdx] = currentLineText.slice(0, currentCharIdx + 1);
          return next;
        });
        setCurrentCharIdx((prev) => prev + 1);
      }, delayMs);
      return () => clearTimeout(timer);
    } else {
      // Pause 300ms, then advance to next line
      const timer = setTimeout(() => {
        setCurrentLineIdx((prev) => prev + 1);
        setCurrentCharIdx(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [lines, currentLineIdx, currentCharIdx, delayMs, onComplete]);

  return (
    <pre className="font-mono text-left whitespace-pre-wrap leading-tight select-text text-[var(--text-standard)]">
      {visibleLines.map((line, idx) => (
        <div key={idx} className="min-h-[1.2em]">
          {line}
          {idx === currentLineIdx && currentLineIdx < lines.length && <BlinkCursor />}
        </div>
      ))}
      {currentLineIdx >= lines.length && <BlinkCursor />}
    </pre>
  );
}

// 3. AsciiBox
export function AsciiBox({
  title,
  variant,
  children,
  className = "",
  style = {},
}: {
  title?: string;
  variant: "single" | "double" | "active";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isDouble = variant === "double";
  const isActive = variant === "active";

  const cornerL = isDouble ? "╔" : "┌";
  const cornerR = isDouble ? "╗" : "┐";
  const fillChar = isDouble ? "═" : "─";

  const borderColor = isActive
    ? "border-[var(--primary)]"
    : "border-[var(--matrix-line)]";

  const borderStyle = isDouble
    ? "border-l-4 border-r-4 border-b-4 border-double"
    : "border-l border-r border-b border-solid";

  const textColor = isActive
    ? "text-[var(--primary)]"
    : "text-[var(--text-standard)]";

  const textGlow = isActive ? { textShadow: "0 0 8px var(--primary)" } : {};

  return (
    <div
      className={`relative pt-3 pb-3 px-4 bg-[var(--canvas)] ${borderColor} ${borderStyle} ${className}`}
      style={{ ...textGlow, ...style }}
    >
      {/* Top Border */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center -translate-y-1/2 select-none overflow-hidden h-[1ch] bg-[var(--canvas)] ${textColor}`}
        style={textGlow}
      >
        <span>{cornerL}{fillChar}</span>
        {title ? (
          <>
            <span className="px-1 text-xs font-bold font-mono">[{title}]</span>
            <span className="flex-1 truncate">{fillChar.repeat(80)}</span>
          </>
        ) : (
          <span className="flex-1">{fillChar.repeat(120)}</span>
        )}
        <span>{fillChar}{cornerR}</span>
      </div>

      {/* Box Inner Workspace */}
      <div className="h-full overflow-y-auto no-scrollbar font-mono text-[var(--text-standard)] select-text">
        {children}
      </div>
    </div>
  );
}

// 4. AsciiBar
export function AsciiBar({
  value,
  width = 24,
  label,
}: {
  value: number;
  width?: number;
  label?: string;
}) {
  const val = Math.max(0, Math.min(100, value));
  const filledCount = Math.round((val / 100) * width);
  const emptyCount = width - filledCount;

  const filledSegments = "█".repeat(filledCount);
  const emptySegments = "░".repeat(emptyCount);

  let textColor = "text-[var(--primary)]";
  let isBlinking = false;

  if (val > 60) {
    textColor = "text-[var(--primary)]"; // amber
  } else if (val >= 40) {
    textColor = "text-[var(--primary-dim)]"; // dim amber
  } else {
    textColor = "text-[var(--text-alert)]"; // red
    if (val < 20) {
      isBlinking = true;
    }
  }

  const blinkClass = isBlinking ? "cursor-blink animate-[blink_0.5s_infinite]" : "";

  return (
    <div className={`font-mono flex items-center text-xs leading-none select-none ${textColor} ${blinkClass}`}>
      {label && (
        <span className="w-14 flex-shrink-0 uppercase text-[var(--text-standard)] mr-2 truncate">
          {label}
        </span>
      )}
      <span className="font-mono tracking-tight">{filledSegments}</span>
      <span className="font-mono tracking-tight text-[var(--text-muted)]">{emptySegments}</span>
      <span className="ml-2 w-8 text-right font-mono">{val}%</span>
    </div>
  );
}

// 5. PromptButton
export function PromptButton({
  label,
  active = false,
  disabled = false,
  onClick,
  className = "",
  tabIndex = 0,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  tabIndex?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  if (disabled) {
    return (
      <span
        className={`font-mono text-[var(--text-muted)] pointer-events-none select-none ${className}`}
        aria-disabled="true"
        aria-label={`Disabled ${label}`}
      >
        [X] {label}
      </span>
    );
  }

  // Hover/focus state takes ultimate visual precedence
  const isSelected = isHovered;

  if (isSelected) {
    return (
      <span
        tabIndex={tabIndex}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={`font-mono inline-block px-[1ch] bg-[var(--primary)] text-[var(--on-primary)] select-none outline-none cursor-default ${className}`}
        aria-label={label}
        role="button"
      >
        {label}
      </span>
    );
  }

  if (active) {
    return (
      <span
        tabIndex={tabIndex}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={`font-mono text-[var(--primary)] select-none outline-none cursor-default ${className}`}
        style={{ textShadow: "0 0 6px var(--primary)" }}
        aria-label={label}
        role="button"
      >
        &gt; {label} &lt;
      </span>
    );
  }

  return (
    <span
      tabIndex={tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`font-mono text-[var(--text-standard)] select-none outline-none cursor-default ${className}`}
      aria-label={label}
      role="button"
    >
      &nbsp;&nbsp;{label}&nbsp;&nbsp;
    </span>
  );
}

// 6. StatusBadge
export function StatusBadge({
  label,
  variant,
  className = "",
}: {
  label: string;
  variant: "info" | "warn" | "crit" | "ok" | "muted";
  className?: string;
}) {
  let colorClass = "text-[var(--text-standard)]";
  if (variant === "warn") colorClass = "text-[var(--primary)]";
  else if (variant === "crit") colorClass = "text-[var(--primary-bright)] cursor-blink animate-[blink_0.5s_infinite]";
  else if (variant === "ok") colorClass = "text-[var(--text-bright)]";
  else if (variant === "muted") colorClass = "text-[var(--text-muted)]";

  return (
    <span className={`font-mono font-bold select-none ${colorClass} ${className}`}>
      [{label}]
    </span>
  );
}

// 7. ScanlinePanel
export function ScanlinePanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--surface-dim)] py-[1rem] px-[2ch] font-mono text-[var(--text-standard)] leading-tight ${className}`}
    >
      {children}
    </div>
  );
}

// 8. AsciiTitle
const asciiMap: Record<string, string[]> = {
  CTO: [
    " ██████╗ ████████╗ ██████╗ ",
    "██╔════╝ ╚══██╔══╝██╔═══██╗",
    "██║         ██║   ██║   ██║",
    "██║         ██║   ██║   ██║",
    "╚██████╗    ██║   ╚██████╔╝",
    " ╚═════╝    ╚═╝    ╚═════╝ "
  ],
  SIMULATOR: [
    "███████╗██╗███╗   ███╗██╗   ██╗██╗      ██████╗ ████████╗ ██████╗ ██████╗ ",
    "██╔════╝██║████╗ ████║██║   ██║██║     ██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗",
    "███████╗██║██╔████╔██║██║   ██║██║     ██║   ██║   ██║   ██║   ██║██████╔╝",
    "╚════██║██║██║╚██╔╝██║██║   ██║██║     ██║   ██║   ██║   ██║   ██║██╔══██╗",
    "███████║██║██║ ╚═╝ ██║╚██████╔╝███████╗╚██████╔╝   ██║   ╚██████╔╝██║  ██║",
    "╚══════╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝"
  ],
  "GAME OVER": [
    " ██████╗  █████╗ ███╗   ███╗███████╗     ██████╗ ██╗   ██╗███████╗██████╗ ",
    "██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔═══██╗██║   ██║██╔════╝██╔══██╗",
    "██║  ███╗███████║██╔████╔██║█████╗      ██║   ██║██║   ██║█████╗  ██████╔╝",
    "██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗",
    "╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║",
    " ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝     ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝"
  ],
  SURVIVED: [
    "███████╗██╗   ██╗██████╗ ██╗   ██╗██╗██╗   ██╗███████╗██████╗ ",
    "██╔════╝██║   ██║██╔══██╗██║   ██║██║██║   ██║██╔════╝██╔══██╗",
    "███████╗██║   ██║██████╔╝██║   ██║██║██║   ██║█████╗  ██║  ██║",
    "╚════██║██║   ██║██╔══██╗╚██╗ ██╔╝██║╚██╗ ██╔╝██╔══╝  ██║  ██║",
    "███████║╚██████╔╝██║  ██║ ╚████╔╝ ██║ ╚████╔╝ ███████╗██████╔╝",
    "╚══════╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═══╝  ╚══════╝╚═════╝ "
  ],
  FIRED: [
    "███████╗██╗██████╗ ███████╗██████╗ ",
    "██╔════╝██║██╔══██╗██╔════╝██╔══██╗",
    "█████╗  ██║██████╔╝█████╗  ██║  ██║",
    "██╔══╝  ██║██╔══██╗██╔══╝  ██║  ██║",
    "██║     ██║██║  ██║███████╗██████╔╝",
    "╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ "
  ],
  TERMINATED: [
    "████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ████████╗███████╗██████╗ ",
    "╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗",
    "   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║   ██║   █████╗  ██║  ██║",
    "   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║   ██║   ██╔══╝  ██║  ██║",
    "   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║   ██║   ███████╗██████╔╝",
    "   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═════╝ "
  ],
  "QUARTER COMPLETE": [
    " ██████╗  ██╗  ██╗  █████╗  ██████╗  ████████╗ ███████╗ ██████╗ ",
    "██╔═══██╗ ██║  ██║ ██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██╔════╝ ██╔══██╗",
    "██║   ██║ ██║  ██║ ███████║ ██████╔╝    ██║    █████╗   ██████╔╝",
    "██║▄▄ ██║ ██║  ██║ ██╔══██║ ██╔══██╗    ██║    ██╔══╝   ██╔══██╗",
    "╚██████╔╝ ╚█████╔╝ ██║  ██║ ██║  ██║    ██║    ███████╗ ██║  ██║",
    " ╚══▀▀═╝   ╚════╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝    ╚══════╝ ╚═╝  ╚═╝"
  ],
  LOADING: [
    "██╗      ██████╗  █████╗ ██████╗ ██╗███╗   ██╗ ██████╗ ",
    "██║     ██╔═══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔════╝ ",
    "██║     ██║   ██║███████║██║  ██║██║██╔██╗ ██║██║  ███╗",
    "██║     ██║   ██║██╔══██║██║  ██║██║██║╚██╗██║██║   ██║",
    "███████╗╚██████╔╝██║  ██║██████╔╝██║██║ ╚████║╚██████╔╝",
    "╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ "
  ],
  WEEK: [
    "██╗    ██╗███████╗███████╗██╗  ██╗",
    "██║    ██║██╔════╝██╔════╝██║ ██╔╝",
    "██║ █╗ ██║█████╗  █████╗  █████╔╝ ",
    "██║███╗██║██╔══╝  ██╔══╝  ██╔═██╗ ",
    "╚███╔███╔╝███████╗███████╗██║  ██╗",
    " ╚══╝╚══╝ ╚══════╝╚══════╝╚═╝  ╚═╝"
  ],
  CRISIS: [
    " ██████╗██████╗ ██╗███████╗██╗███████╗",
    "██╔════╝██╔══██╗██║██╔════╝██║██╔════╝",
    "██║     ██████╔╝██║███████╗██║███████╗",
    "██║     ██╔══██╗██║╚════██║██║╚════██║",
    "╚██████╗██║  ██║██║███████║██║███████║",
    " ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝╚══════╝"
  ]
};

export function AsciiTitle({
  text,
  size,
  className = "",
}: {
  text: string;
  size: "xl" | "xxl";
  className?: string;
}) {
  const lines = asciiMap[text.toUpperCase()] || [text];
  const isAmber =
    text.toUpperCase() === "CTO" ||
    text.toUpperCase() === "SURVIVED" ||
    text.toUpperCase() === "CRISIS" ||
    text.toUpperCase() === "WEEK";

  const isRed =
    text.toUpperCase() === "TERMINATED" ||
    text.toUpperCase() === "FIRED" ||
    text.toUpperCase() === "GAME OVER";

  const colorClass = isAmber
    ? "text-[var(--primary)]"
    : isRed
    ? "text-[var(--text-alert)]"
    : "text-[var(--text-bright)]";

  return (
    <pre
      className={`font-mono text-center leading-[1.1] select-none whitespace-pre overflow-x-auto no-scrollbar py-2 ${colorClass} ${className}`}
    >
      {lines.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
    </pre>
  );
}

// 9. TerminalInput
export function TerminalInput({
  value,
  onChange,
  prefix = "CTO@NOVACORP:~# ",
  charLimit,
  onSubmit,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  charLimit?: number;
  onSubmit?: () => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex items-center font-mono text-xs select-none cursor-text w-full py-1 text-[var(--text-bright)] ${className}`}
    >
      <span className="text-[var(--primary-dim)] flex-shrink-0 select-none mr-1">
        {prefix}
      </span>
      <span className="break-all whitespace-pre-wrap select-text">{value}</span>
      <BlinkCursor />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (charLimit === undefined || val.length <= charLimit) {
            onChange(val);
          }
        }}
        onKeyDown={handleKeyDown}
        className="absolute inset-0 opacity-0 cursor-text w-full h-full outline-none"
        maxLength={charLimit}
        autoFocus
      />
    </div>
  );
}
