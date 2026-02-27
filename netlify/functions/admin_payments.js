const { query } = require("./_db");
const { json, requireJWT } = require("./_auth");

async function rolesOf(uid) {
  const r = await query(
    `select roles.name from user_roles join roles on roles.id=user_roles.role_id where user_roles.user_id=$1`,
    [uid]
  );
  return r.rows.map(x => x.name);
}
function isStaff(roles) {
  return roles.includes("owner") || roles.includes("admin") || roles.includes("support");
}

exports.handler = async (event) => {
  try {
    const { uid } = requireJWT(event);
    const myRoles = await rolesOf(uid);
    if (!isStaff(myRoles)) return json(403, { error: "Forbidden" });

    if (event.httpMethod === "GET") {
      const p = await query(
        `select pr.id, pr.status, pr.method, pr.reference, pr.created_at,
                u.full_name, u.phone, c.title as course_title, pr.course_id, pr.user_id
         from payment_requests pr
         join users u on u.id=pr.user_id
         join courses c on c.id=pr.course_id
         order by pr.id desc
         limit 200`
      );
      return json(200, { payments: p.rows });
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { action, paymentId } = body;

      if (action === "approve") {
        // mark payment approved + enrollment active
        const pr = await query("select user_id, course_id from payment_requests where id=$1", [paymentId]);
        if (pr.rowCount === 0) return json(404, { error: "Payment not found" });

        const { user_id, course_id } = pr.rows[0];
        await query("update payment_requests set status='approved' where id=$1", [paymentId]);
        await query(
          `insert into enrollments(user_id, course_id, status)
           values($1,$2,'active')
           on conflict(user_id, course_id) do update set status='active'`,
          [user_id, course_id]
        );

        // add a demo video if none exist (for testing)
        const v = await query("select id from course_videos where course_id=$1 limit 1", [course_id]);
        if (v.rowCount === 0) {
          await query(
            `insert into course_videos(course_id, title, youtube_url, sort_order, is_active)
             values($1,'Demo Video','https://www.youtube.com/watch?v=dQw4w9WgXcQ',0,true)`,
            [course_id]
          );
        }

        return json(200, { ok: true });
      }

      return json(400, { error: "Unknown action" });
    }

    return json(405, { error: "Method not allowed" });
  } catch (e) {
    return json(400, { error: e.message });
  }
};
