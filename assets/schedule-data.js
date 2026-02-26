const { neon } = require("@netlify/neon");

exports.handler = async () => {
  const sql = neon();
  const rows = await sql`SELECT id, grade, subject, day, time, "group" FROM schedules ORDER BY id DESC`;
  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
