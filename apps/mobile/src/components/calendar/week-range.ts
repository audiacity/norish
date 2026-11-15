const pad = (n: number) => String(n).padStart(2, "0");

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Monday-start week containing `date`, shifted by `offsetWeeks`; returns the 7 local ISO dates. */
export function getWeekDays(date: Date, offsetWeeks = 0): string[] {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offsetWeeks * 7);

  return Array.from({ length: 7 }, (_, i) =>
    toISODate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
  );
}
