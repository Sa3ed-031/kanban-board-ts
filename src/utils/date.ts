export function formatDate(value?: string): string {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
