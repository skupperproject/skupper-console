export function formatLocalizedDateTime(microseconds: number, locale?: string): string {
  if (!microseconds) {
    return ' ';
  }

  // Use the provided locale if available; fallback to the browser's locale or 'en-US'
  const userLocale = locale || navigator.language || 'en-US';

  // Convert the microseconds timestamp to a JavaScript Date object
  const baseTime = new Date(microseconds / 1000);

  // Options for formatting the date (e.g., '12 Dec 2024')
  const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };

  // Options for formatting the time (e.g., '14:30' or '2:30 PM')
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  // Format the date and time using the resolved locale
  const formattedDate = new Intl.DateTimeFormat(userLocale, optionsDate).format(baseTime);
  const formattedTime = new Intl.DateTimeFormat(userLocale, optionsTime).format(baseTime);

  // Combine the formatted date and time into a single string
  return `${formattedDate}, ${formattedTime}`;
}
