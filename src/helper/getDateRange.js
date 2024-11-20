export default function getDateRange(startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const dates = [];
  // Set start date
  let currentDate = new Date(startDate);
  // Iterate through dates until the end date is reached
  while (currentDate <= endDate) {
    // Add current date to the array
    const dateString = currentDate.toDateString();
    dates.push(dateString);
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}