export function formatDate(value?: string): string {
  // 1. if value is empty or undefined → return ""
  if (!value) return "";

  // 2. create a Date from it
  const date = new Date(`${value}T00:00:00`);

  // 3. if the date is invalid → return the original value as it is
  if (isNaN(date.getTime())) return value;

  // 4. otherwise → return it formatted like "Nov 27, 2026"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
