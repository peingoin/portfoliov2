/**
 * Everything personal lives here. Edit this file to change the name, intro,
 * bio and contact details across the whole site.
 */
import type { SceneName } from "@/lib/scenes/types";

/**
 * The set piece in the middle of the page. Change this one word to switch:
 *   "supernova"   a star you scroll into until it blows; the tools are the debris
 *   "planetfall"  one long fall from orbit through cloud to a dawn landing
 *   "orbit"       a planet with the tools in orbit
 * To compare without editing, add ?scene=planetfall (or any name) to the address.
 */
const scene: SceneName = "supernova";

export const site = {
  scene,
  firstName: "Austin",
  lastName: "Cheng",
  role: "Student",
  tagline: "I build software, design interfaces and cut video.",
  year: "2026",
  url: "https://example.com",
  bio: [
    "Hi, I'm Austin. I'm a student who likes making things end to end: the idea, the interface, the code and the video that explains it.",
    "Everything up there is a real object in zero gravity. Throw it around. When you've had enough, press Dock and it all flies back into formation.",
  ],
  skills: [
    { area: "Code", items: ["TypeScript", "React", "Python", "SQL"] },
    { area: "Design", items: ["Figma", "Brand identity", "Prototyping"] },
    { area: "Video", items: ["DaVinci Resolve", "Scripting", "Sound mixing"] },
  ],
  // Placeholder contact details. Replace before publishing.
  email: "hello@example.com",
  links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ],
};
