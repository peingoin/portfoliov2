export type Discipline = "code" | "design" | "video";

export interface Project {
  slug: string;
  title: string;
  year: number;
  weeks: number;
  discipline: Discipline;
  role: string;
  tools: string[];
  summary: string;
  sections: { heading: string; body: string[]; points?: string[] }[];
}

/**
 * Placeholder projects. Replace each entry with your own work; the cards,
 * case studies and plain list all come from this file.
 */
export const projects: Project[] = [
  {
    slug: "timetable",
    title: "Timetable",
    year: 2025,
    weeks: 9,
    discipline: "code",
    role: "Solo developer",
    tools: ["TypeScript", "React", "Supabase"],
    summary: "A class schedule app that shows the next lesson and room at a glance.",
    sections: [
      {
        heading: "The problem",
        body: ["The school timetable was a PDF. Finding the next room meant zooming into a grid on a phone between classes."],
      },
      {
        heading: "What I did",
        body: ["I built a web app that opens straight to the next lesson. It reads the timetable once, stores it on the device, and works without a signal in the corridors."],
        points: [
          "Interviewed 12 students about how they checked their schedule.",
          "Prototyped three layouts and tested them in the five minutes between lessons.",
          "Built the final version in React with offline storage.",
        ],
      },
      {
        heading: "Result",
        body: ["140 students used it in the first term. The most common feedback was that it opened faster than the PDF."],
      },
      {
        heading: "What I learned",
        body: ["Speed was the feature. Every extra tap I removed mattered more than anything I added."],
      },
    ],
  },
  {
    slug: "tide-clock",
    title: "Tide Clock",
    year: 2024,
    weeks: 5,
    discipline: "code",
    role: "Solo developer",
    tools: ["Python", "Raspberry Pi", "E-ink"],
    summary: "A desk display that shows today's tides and weather on an e-ink screen.",
    sections: [
      {
        heading: "The problem",
        body: ["I wanted to know the tide before cycling to the beach, without picking up my phone."],
      },
      {
        heading: "What I did",
        body: ["I wrote a Python service on a Raspberry Pi that fetches tide and weather data each hour and draws it to an e-ink panel."],
        points: [
          "Designed the layout for a screen with two colours and a slow refresh.",
          "Cached the data so the display still works when the network drops.",
        ],
      },
      { heading: "Result", body: ["It has run on my desk for a year without a restart."] },
      {
        heading: "What I learned",
        body: ["Designing for a screen that updates once an hour forced me to decide what actually mattered."],
      },
    ],
  },
  {
    slug: "field-notes",
    title: "Field Notes",
    year: 2024,
    weeks: 6,
    discipline: "design",
    role: "Designer",
    tools: ["Figma", "Illustrator"],
    summary: "A visual identity for the school hiking club, from logo to trail signs.",
    sections: [
      {
        heading: "The problem",
        body: ["The hiking club had 60 members and no consistent look. Every poster was made from scratch."],
      },
      {
        heading: "What I did",
        body: ["I designed a small identity system: a logo, two typefaces, a colour set and poster templates anyone in the club could fill in."],
        points: [
          "Presented three directions to the committee.",
          "Built the templates in Figma so non-designers could use them.",
        ],
      },
      {
        heading: "Result",
        body: ["The club has used the templates for every event since. Sign-ups for the first trip of the year rose from 18 to 31."],
      },
      {
        heading: "What I learned",
        body: ["A system other people can use is worth more than one perfect poster."],
      },
    ],
  },
  {
    slug: "wayfinder",
    title: "Wayfinder",
    year: 2025,
    weeks: 11,
    discipline: "design",
    role: "UX and UI designer",
    tools: ["Figma", "Maze", "After Effects"],
    summary: "A redesign concept for a city transit app, tested with 20 commuters.",
    sections: [
      {
        heading: "The problem",
        body: ["Planning a trip with one transfer took nine taps in the existing transit app, and the live delay information was hidden two screens deep."],
      },
      {
        heading: "What I did",
        body: ["I redesigned the journey planner around one question: when do I need to leave?"],
        points: [
          "Shadowed five commuters and mapped where they got stuck.",
          "Rebuilt the flow so a saved trip takes two taps.",
          "Ran an unmoderated test with 20 people and iterated twice.",
        ],
      },
      {
        heading: "Result",
        body: ["Task time for planning a saved trip fell from 41 seconds to 12 in testing."],
      },
      {
        heading: "What I learned",
        body: ["Watching people use the old app taught me more in one morning than a week of looking at other apps."],
      },
    ],
  },
  {
    slug: "forty-seconds",
    title: "Forty Seconds",
    year: 2025,
    weeks: 4,
    discipline: "video",
    role: "Writer and editor",
    tools: ["DaVinci Resolve", "Premiere"],
    summary: "A series of 12 short explainers on study techniques, each under a minute.",
    sections: [
      { heading: "The problem", body: ["Study advice online was either an hour long or too thin to use."] },
      {
        heading: "What I did",
        body: ["I wrote, shot and edited 12 videos of 40 seconds each. Every one covers a single technique with one example."],
        points: [
          "Wrote all scripts before shooting, at 95 words each.",
          "Built a caption and title template to keep the edit fast.",
        ],
      },
      {
        heading: "Result",
        body: ["The series reached 48,000 views in its first month. The video on spaced repetition accounts for a third of that."],
      },
      { heading: "What I learned", body: ["Cutting a script from 150 words to 95 improved every video."] },
    ],
  },
  {
    slug: "low-tide",
    title: "Low Tide",
    year: 2026,
    weeks: 14,
    discipline: "video",
    role: "Director and editor",
    tools: ["DaVinci Resolve", "Sony FX30", "Audition"],
    summary: "A 12-minute documentary about the people who forage a city shoreline at dawn.",
    sections: [
      {
        heading: "The problem",
        body: ["A stretch of shoreline near my home is busy every morning before sunrise, and almost nobody in the city knows why."],
      },
      {
        heading: "What I did",
        body: ["I spent five weeks filming three foragers on nine mornings, then cut 22 hours of footage down to 12 minutes."],
        points: [
          "Recorded interviews separately so the shoreline scenes could run without talking heads.",
          "Mixed the sound myself, using field recordings from each location.",
        ],
      },
      {
        heading: "Result",
        body: ["The film screened at a student festival and was shortlisted for best documentary."],
      },
      { heading: "What I learned", body: ["The edit only worked once I removed my own narration."] },
    ],
  },
];
