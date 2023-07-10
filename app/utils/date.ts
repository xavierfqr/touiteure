import { format } from "date-fns";

export function formatISODate(date: string) {
  return format(new Date(date), "PPpp");
}
