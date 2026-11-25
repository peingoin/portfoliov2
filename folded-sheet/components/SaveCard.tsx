"use client";

import { useState } from "react";

interface Props {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  links: string[];
}

/** Draws the business card to a canvas and downloads it as a PNG. */
export function SaveCard({ firstName, lastName, role, email, links }: Props) {
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const css = getComputedStyle(document.documentElement);
      const serif = css.getPropertyValue("--font-newsreader").trim() || "Georgia, serif";
      const sans = css.getPropertyValue("--font-archivo").trim() || "system-ui, sans-serif";
      const paper = css.getPropertyValue("--color-paper").trim() || "#f7f3ea";
      const ink = css.getPropertyValue("--color-ink").trim() || "#1c1a17";
      const blue = css.getPropertyValue("--color-blue").trim() || "#2f4fe0";
      const pink = css.getPropertyValue("--color-pink").trim() || "#ff6b8b";
      await Promise.all([document.fonts.load(`500 96px ${serif}`), document.fonts.load(`500 36px ${sans}`)]).catch(() => {});

      const W = 1050;
      const H = 600;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const c = canvas.getContext("2d")!;
      c.fillStyle = paper;
      c.fillRect(0, 0, W, H);
      // Grain
      for (let i = 0; i < 9000; i++) {
        c.fillStyle = `rgba(28,26,23,${Math.random() * 0.06})`;
        c.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      }
      // Folded-corner mark
      c.fillStyle = blue;
      c.beginPath();
      c.moveTo(72, 72);
      c.lineTo(126, 72);
      c.lineTo(150, 96);
      c.lineTo(150, 150);
      c.lineTo(72, 150);
      c.closePath();
      c.fill();
      c.fillStyle = paper;
      c.beginPath();
      c.moveTo(126, 72);
      c.lineTo(126, 96);
      c.lineTo(150, 96);
      c.closePath();
      c.fill();
      // Name, with a riso misregistration in pink underneath
      c.textBaseline = "alphabetic";
      c.font = `500 96px ${serif}`;
      c.fillStyle = pink;
      c.fillText(`${firstName} ${lastName}`, 76, 318);
      c.fillStyle = blue;
      c.fillText(`${firstName} ${lastName}`, 72, 315);
      c.font = `italic 400 40px ${serif}`;
      c.fillStyle = ink;
      c.fillText(role, 72, 378);
      c.font = `500 30px ${sans}`;
      c.fillStyle = ink;
      c.fillText(email, 72, 486);
      c.fillStyle = "rgba(28,26,23,0.7)";
      c.fillText(links.join("  ·  "), 72, 530);

      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("no blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${firstName}-${lastName}-card.png`.toLowerCase();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-blue" onClick={save} disabled={busy}>
      {busy ? "Saving…" : "Save the card as an image"}
    </button>
  );
}
