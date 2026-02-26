const { neon } = require("@netlify/neon");

exports.handler = async (event) => {
  const key = event.headers["x-admin-key"] || "";
  if (key !== process.env.ADMIN_KEY) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const { grade, subject, day, time, group } = JSON.parse(event.body);

  const sql = neon();
  const rows = await sql`
    INSERT INTO schedules (grade, subject, day, time, "group")
    VALUES (${grade}, ${subject}, ${day}, ${time}, ${group})
    RETURNING id, grade, subject, day, time, "group"
  `;

  return {
    statusCode: 200,
    body: JSON.stringify(rows[0]),
  };
};
