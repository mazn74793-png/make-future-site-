import { neon } from "@netlify/neon";

export default async (req) => {
  const key = req.headers.get("x-admin-key") || "";
  if (key !== process.env.ADMIN_KEY) return new Response("Unauthorized", { status: 401 });

  const { grade, subject, day, time, group } = await req.json();

  const sql = neon();
  const [row] = await sql`
    INSERT INTO schedules (grade, subject, day, time, "group")
    VALUES (${grade}, ${subject}, ${day}, ${time}, ${group})
    RETURNING id, grade, subject, day, time, "group"
  `;
  return Response.json(row);
};
