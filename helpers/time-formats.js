// Create a new Date object from the given timestamp
const timestamp = new Date("2023-03-17T13:46:01.829Z");
// console.log(timestamp);

// Get the user's timezone offset in minutes
const timezoneOffset = new Date().getTimezoneOffset();
// console.log(timezoneOffset);

// Convert the timezone offset to milliseconds
const timezoneOffsetMs = timezoneOffset * 60 * 1000;
// console.log(timezoneOffsetMs);

// Add the timezone offset to the timestamp
const localTimestamp = new Date(timestamp.getTime() - timezoneOffsetMs);
// console.log(localTimestamp);

const localHour = localTimestamp.getHours();
const localMinutes = localTimestamp.getMinutes();
// Output the local timestamp in ISO 8601 format
// console.log(localHour, localMinutes);
// console.log(`Local time: ${localHour}:${localMinutes}`);

exports.getCurrentGMTDate = () => {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes} GMT`;
};

exports.extractTime = (date) => {
  // console.log(new Date().getTimezoneOffset())
// Create a new Date object from the given timestamp
const timestamp = new Date(date);

// Get the user's timezone offset in minutes
const timezoneOffset = new Date().getTimezoneOffset();

// Convert the timezone offset to milliseconds
const timezoneOffsetMs = timezoneOffset * 60 * 1000;

// Add the timezone offset to the timestamp
const localTimestamp = new Date(timestamp.getTime() - timezoneOffsetMs);

  const hours = String(localTimestamp.getUTCHours()).padStart(2,"0");
  const minutes = String(localTimestamp.getUTCMinutes()).padStart(2,"0");
  return `${hours}:${minutes}`;
};
