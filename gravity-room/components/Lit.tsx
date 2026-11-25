import type { ElementType } from "react";

/**
 * Display type split into letters, so each one can dock, sway and catch the
 * light on its own (see ScrollStage). The full text is the accessible name;
 * the letters themselves are hidden from assistive tech.
 */
export function Lit({ as: Tag = "h2", text, className }: { as?: ElementType; text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text} data-dock>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span className="lit-w">
            {Array.from(word).map((ch, j) => (
              <span key={j} className="lit-u" data-u>
                {ch}
              </span>
            ))}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
