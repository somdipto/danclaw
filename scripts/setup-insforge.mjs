const BASE = "https://tq33kiup.ap-southeast.insforge.app";
const KEY = "ik_ac021317adcb7995b6f8e53075757fc1";
const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${KEY}`, "Prefer": "return=representation" };

async function api(path, method = "GET", body = null) {
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}${path}`, opts);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: r.status, data };
}

async function main() {
  console.log("🔍 Checking InsForge backend...\n");
  const { data: users } = await api("/api/database/records/users");
  console.log("Users:", users.length, users[0]?.email || "none");
  const { data: deps } = await api("/api/database/records/deployments");
  console.log("Deployments:", deps.length);
  deps.forEach(d => console.log(`  → ${d.service_name} (${d.status})`));
  const { data: msgs } = await api("/api/database/records/messages");
  console.log("Messages:", msgs.length);
  const { data: activity } = await api("/api/database/records/activity");
  console.log("Activity:", activity.length);
  console.log("\n✅ InsForge backend LIVE!");
}
main().catch(console.error);
