export type DateFilter = "all" | "today" | "7" | "30";

export const DATE_FILTER_OPTIONS: { label: string; value: DateFilter }[] = [
  { label: "All dates", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
];

/** Parses a SQLite timestamp ("YYYY-MM-DD HH:MM:SS", UTC) or ISO string. */
export function parseDbDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
}

export function matchesDateFilter(value: string, filter: DateFilter) {
  if (filter === "all") return true;

  const date = parseDbDate(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  if (filter === "today") return date.toDateString() === now.toDateString();

  return now.getTime() - date.getTime() <= Number(filter) * 24 * 60 * 60 * 1000;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

/** List-row date: "2:00 PM" today, "Mon" within the last week, otherwise "28 Sept". */
export function formatListDate(value: string) {
  const date = parseDbDate(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (daysAgo <= 0) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (daysAgo < 7) return WEEKDAYS[date.getDay()];
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
