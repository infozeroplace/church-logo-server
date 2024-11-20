const formatDateToISO = (date) => {
  const pad = (num) => String(num).padStart(2, "0");
  const padMilliseconds = (num) => String(num).padStart(3, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const milliseconds = padMilliseconds(date.getUTCMilliseconds());

  const timezoneOffset = date.getTimezoneOffset();
  const offsetSign = timezoneOffset <= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
};

const getBstTime = () => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const nd = new Date(utc + 3600000 * 6); // BST is UTC+6
  const bst = nd.toLocaleString();
  const [date, time] = bst.split(", ");
  return { time, date: new Date(date).toDateString() };
};

const getDates = () => {
  const date = new Date();
  const dateString = date.toDateString();
  const timeNumber = date.getTime();
  const timeString = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const UTC = new Date().toISOString()

  return { dateString, timeNumber, timeString, UTC };
};

export const dateFormatter = {
  getDates,
  formatDateToISO,
  getBstTime,
};
