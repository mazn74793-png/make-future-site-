import { neon } from "@netlify/neon";

export default async () => {
  const sql = neon(); // يستخدم NETLIFY_DATABASE_URL تلقائيًا
  const rows = await sql`SELECT id, grade, subject, day, time, "group" FROM schedules ORDER BY id DESC`;
  return Response.json(rows);
};
