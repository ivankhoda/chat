function formatMessage(username, text) {
  // Formatting time to HH:MM format

  const time = new Date().toISOString().substring(11).slice(0, 5);
  return {
    username,
    text,
    time,
  };
}

module.exports = formatMessage;
