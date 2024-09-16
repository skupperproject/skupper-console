export function timeAgo(microseconds: number): string {
  if (!microseconds) {
    return ' ';
  }

  const baseTime = new Date(microseconds / 1000);

  // Format date as 'DD MMM YYYY' and time as 'HH:mm'
  const formattedDate = `${baseTime.getDate()} ${baseTime.toLocaleString('it-IT', { month: 'short' })} ${baseTime.getFullYear()}`;
  const formattedTime = `${baseTime.getHours()}:${baseTime.getMinutes().toString().padStart(2, '0')}`;

  return `${formattedDate}, ${formattedTime}`;
}
