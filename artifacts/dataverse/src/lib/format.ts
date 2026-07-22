import { format } from "date-fns";

export function formatDateTime(isoString?: string | null) {
  if (!isoString) return "-";
  try {
    return format(new Date(isoString), "dd MMM yyyy, HH:mm");
  } catch (e) {
    return "-";
  }
}

export function formatDuration(seconds?: number | null) {
  if (seconds == null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const remainingM = m % 60;
  return `${h}h ${remainingM}m`;
}
