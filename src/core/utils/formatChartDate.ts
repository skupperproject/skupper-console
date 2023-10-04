// timestamp and start are expressed in seconds
export function formatChartDate(timestamp: number, start: number) {
  const now = Date.now();

  if (start * 1000 <= now - 14 * 24 * 3600 * 1000) {
    return getMonthAndDay(timestamp);
  }

  if (start * 1000 <= now - 2 * 24 * 3600 * 1000) {
    return getDayFromTimestamp(timestamp);
  }

  if (start * 1000 <= now - 60 * 1000) {
    return getTimeFromTimestamp(timestamp, true);
  }

  return getTimeFromTimestamp(timestamp);
}

export function getTimeFromTimestamp(timestamp: number, withSeconds = false) {
  // Convert timestamp to milliseconds
  const milliseconds = timestamp * 1000;

  // Create a new Date object with the milliseconds
  const dateObject = new Date(milliseconds);
  // Use the Date object's getHours() method to get the hours
  const hours = dateObject.getHours();

  // Use the String object's padStart() method to add padding to the hours
  const paddedHours = hours.toString().padStart(2, '0');

  // Use the Date object's getMinutes() method to get the minutes
  const minutes = dateObject.getMinutes();

  // Use the String object's padStart() method to add padding to the minutes
  const paddedMinutes = minutes.toString().padStart(2, '0');

  if (withSeconds) {
    //Use the Date object's getSeconds() method to get the seconds
    const seconds = dateObject.getSeconds() || 0;
    // Use the String object's padStart() method to add padding to the seconds
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  // Return the padded hours and minutes as a string
  return `${paddedHours}:${paddedMinutes}`;
}

export function getDayFromTimestamp(timestamp: number) {
  const timeString = getTimeFromTimestamp(timestamp);
  // Create a new Date object using the timestamp (in milliseconds)
  const date = new Date(timestamp * 1000);

  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();

  // Define an array with the names of the days of the week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get the name of the day of the week
  const dayOfWeekName = daysOfWeek[dayOfWeek];
  const day = date.getDate(); // get the day of the month

  // Return an object with the day of the week, number of days, hours, and minutes
  return `${dayOfWeekName} ${day} ${timeString}`;
}

export function getMonthAndDay(timestamp: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(timestamp * 1000); // convert timestamp to milliseconds
  const monthIndex = date.getMonth(); // get the zero-based month index
  const month = months[monthIndex]; // get the month abbreviation from the array
  const day = date.getDate(); // get the day of the month

  return `${month} ${day}`;
}
