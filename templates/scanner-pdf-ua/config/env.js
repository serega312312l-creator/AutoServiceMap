/** Читання змінних з Cursor Cloud Secrets / .env */
function envFirst(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value?.trim()) return value.trim();
  }
  return "";
}

module.exports = { envFirst };
