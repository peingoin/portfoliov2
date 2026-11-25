/** Colour of each discipline, in the same order as `site.skills`. Matches the project cards. */
export const ORBIT_COLORS = ["#9b8cff", "#ff7a6b", "#ffc857"];

/**
 * "What I use": the stage every scroll scene plays on.
 *
 * As plain HTML this is a heading and three short lists, which is what it
 * stays as with reduced motion or without scripts. With motion on, the stage
 * pins to the screen and whichever scene is chosen (lib/scenes) takes over
 * the titles and pills. The planet and rings belong to the orbit scene; the
 * canvas is there for any scene to draw on.
 */
export function Orbit({ skills }: { skills: { area: string; items: string[] }[] }) {
  return (
    <section id="orbit" className="orbit border-t border-line" aria-labelledby="orbit-h">
      <div className="orbit-stage">
        <canvas className="scene-canvas" aria-hidden="true" />
        <svg className="orbit-rings" aria-hidden="true">
          {skills.map((s, k) => (
            <ellipse key={s.area} data-ring-back stroke={ORBIT_COLORS[k % ORBIT_COLORS.length]} />
          ))}
        </svg>
        <div className="planet" aria-hidden="true">
          <span className="planet-bands" />
        </div>
        <svg className="orbit-rings front" aria-hidden="true">
          {skills.map((s, k) => (
            <path key={s.area} data-ring-front stroke={ORBIT_COLORS[k % ORBIT_COLORS.length]} />
          ))}
        </svg>

        <h2 id="orbit-h" className="orbit-h font-display text-[14px] font-semibold uppercase tracking-wide text-aurora">
          What I use
        </h2>
        {skills.map((s, k) => (
          <div
            key={s.area}
            className="orbit-set"
            data-set
            style={{ "--c": ORBIT_COLORS[k % ORBIT_COLORS.length] } as React.CSSProperties}
          >
            <h3 className="orbit-title display">{s.area}</h3>
            <ul>
              {s.items.map((item) => (
                <li key={item} className="sat" data-sat>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
