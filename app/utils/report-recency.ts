export type ReportRecency = "today" | "last-7-days" | "older-than-7-days";

export function getReportRecency(timestamp: number, now = Date.now()): ReportRecency {
  const reportDate = new Date(timestamp);
  const currentDate = new Date(now);

  if (
    reportDate.getFullYear() === currentDate.getFullYear()
    && reportDate.getMonth() === currentDate.getMonth()
    && reportDate.getDate() === currentDate.getDate()
  ) {
    return "today";
  }

  if (timestamp >= now - 7 * 24 * 60 * 60 * 1000) {
    return "last-7-days";
  }

  return "older-than-7-days";
}
