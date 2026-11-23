/** Créneaux planifiés Europe/Paris (toutes les 8 h). */
export const SCHEDULE_SLOTS = [4, 12, 20] as const;
export type ScheduleSlot = (typeof SCHEDULE_SLOTS)[number];

export function parisDateString(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Heure Europe/Paris (0–23). */
export function parisHour(d = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      hour: "numeric",
      hourCycle: "h23",
    }).format(d),
  );
}

/** Créneau 04 / 12 / 20 le plus proche (fuseau Europe/Paris). */
export function parisScheduleSlot(d = new Date()): ScheduleSlot {
  const hour = parisHour(d);
  let best: ScheduleSlot = SCHEDULE_SLOTS[0];
  let bestDist = Infinity;
  for (const slot of SCHEDULE_SLOTS) {
    const dist = Math.min(Math.abs(hour - slot), 24 - Math.abs(hour - slot));
    if (dist < bestDist) {
      bestDist = dist;
      best = slot;
    }
  }
  return best;
}
