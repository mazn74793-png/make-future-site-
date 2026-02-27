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
  return roles.includes("owner") || roles.includes("admin") || roles.includes("editor");
}

exports.handler = async (event) => {
  try {
    const { uid } = requireJWT(event);
    const myRoles = await rolesOf(uid);
    if (!isStaff(myRoles)) return json(403, { error: "Forbidden" });

    if (event.httpMethod === "GET") {
      const c = await query("select * from courses order by id desc limit 200");
      return json(200, { courses: c.rows });
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (body.action === "seed_demo") {
        // demo courses for testing
        const demo = [
          { grade: "third_prep", subject: "math", title: "Math - Third Prep (Demo)", teacher: "Mr. A", price: 200 },
          { grade: "third_prep", subject: "english", title: "English - Third Prep (Demo)", teacher: "Ms. B", price: 200 },
          { grade: "first_secondary", subject: "math", title: "Math - First Secondary (Demo)", teacher: "Mr. C", price: 250 },
          { grade: "first_secondary", subject: "english", title: "English - First Secondary (Demo)", teacher: "Ms. D", price: 250 },
          { grade: "second_secondary", subject: "math", title: "Math - Second Secondary (Demo)", teacher: "Mr. E", price: 300 },
          { grade: "second_secondary", subject: "english", title: "English - Second Secondary (Demo)", teacher: "Ms. F", price: 300 },
          { grade: "third_secondary", subject: "math", title: "Math - Third Secondary (Demo)", teacher: "Mr. G", price: 350 },
          { grade: "third_secondary", subject: "english", title: "English - Third Secondary (Demo)", teacher: "Ms. H", price: 350 }
        ];
        for (const d of demo) {
          await query(
            `insert into courses(grade, subject, title, teacher_name, price_egp, is_active)
             values($1,$2,$3,$4,$5,true)`,
            [d.grade, d.subject, d.title, d.teacher, d.price]
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
