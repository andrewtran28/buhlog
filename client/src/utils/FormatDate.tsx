const formatDate = (date: Date | string) => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const options: Intl.DateTimeFormatOptions = { month: "short" };
  const month = new Intl.DateTimeFormat("en-US", options).format(dateObj);
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  return `${month} ${day}, ${year}`;
};

const formatDateTime = (date: Date | string) => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date); // Ensure it's a Date object
  if (isNaN(dateObj.getTime())) return ""; // Handle invalid dates

  const now = new Date();
  const isSameDay =
    dateObj.getFullYear() === now.getFullYear() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getDate() === now.getDate();

  if (isSameDay) {
    const hours = dateObj.getHours() % 12 || 12;
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const ampm = dateObj.getHours() < 12 ? "AM" : "PM";
    return `Today at ${hours}:${minutes}${ampm}`;
  } else {
    const options: Intl.DateTimeFormatOptions = { month: "short" };
    const month = new Intl.DateTimeFormat("en-US", options).format(dateObj);
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  }
};

const updateDateTime = (createdAt: Date | string, updatedAt: Date | string) => {
  if (!createdAt || !updatedAt) return ""; // Handle invalid inputs

  // Convert to Date objects if they are strings
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const updatedDate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  // Check if both dates are on the same day
  const isSameDay =
    createdDate.getFullYear() === updatedDate.getFullYear() &&
    createdDate.getMonth() === updatedDate.getMonth() &&
    createdDate.getDate() === updatedDate.getDate();

  // If not the same day, log "hello"
  if (!isSameDay) {
    return `(Last updated ${formatDateTime(updatedAt)})`;
  }

  return "";
};

export { formatDate, formatDateTime, updateDateTime };
