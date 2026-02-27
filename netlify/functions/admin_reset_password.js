const bcrypt = require("bcryptjs");
const { z } = require("zod");
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

const schema = z.object({ userId: z.number().int().positive() });

function genTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

exports.handler = async (event) => {
  try {
    const { uid } = requireJWT(event);
    const myRoles = await rolesOf(uid);
    if (!isStaff(myRoles)) return json(403, { error: "Forbidden" });
    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

    const body = JSON.parse(event.body || "{}");
    const { userId } = schema.parse(body);

    const tempPassword = genTempPassword();
    const tempHash = await bcrypt.hash(tempPassword, 10);

    // update user password directly + store reset record (audit)
    await query("update users set password_hash=$1 where id=$2", [tempHash, userId]);
    await query(
      `insert into password_resets(user_id, temp_password_hash, expires_at)
       values($1,$2, now() + interval '15 minutes')`,
      [userId, tempHash]
    );

    return json(200, { ok: true, tempPassword });
  } catch (e) {
    return json(400, { error: e.message });
  }
};
