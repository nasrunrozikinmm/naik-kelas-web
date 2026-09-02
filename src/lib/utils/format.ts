import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function formatDate(value: string | Date | undefined, formatStr = "DD MMM YYYY"): string {
  if (!value) return "-";
  return dayjs(value).format(formatStr);
}

export function formatRelativeTime(value: string | Date | undefined): string {
  if (!value) return "-";
  return dayjs(value).fromNow();
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short"
  }).format(value || 0);
}

