/**
 * DEMO DATA ONLY. Creates demo@tagback.test with 4 tags and 2 conversations.
 * Idempotent: re-running replaces the demo user's tags with the same fixed set.
 * The password is random, saved to .env.local as DEMO_PASSWORD, and never printed.
 */
import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { ensureEnv, setEnvVar } from "./env";
import { closeDb, getDb } from "../lib/db";
import { createFinderToken } from "../lib/tokens";

export const DEMO_EMAIL = "demo@tagback.test";

const env = ensureEnv();
const password = env.DEMO_PASSWORD || randomBytes(18).toString("base64url");
if (!env.DEMO_PASSWORD) setEnvVar("DEMO_PASSWORD", password);

const db = getDb();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

type SeedMsg = { sender: "finder" | "owner"; body: string; at: number; lat?: number; lng?: number };
const TAGS: {
  code: string;
  itemName: string;
  note: string | null;
  design: { template: string; color: string; customText: string };
  status: "safe" | "lost" | "found";
  scans: number;
  age: number;
  conversation?: { messages: SeedMsg[]; readAt: number | null };
}[] = [
  {
    code: "DEMAB234",
    itemName: "Blue suitcase",
    note: "Reward offered for its safe return. Thank you!",
    design: { template: "luggage", color: "#2563eb", customText: "Please scan if found" },
    status: "lost",
    scans: 7,
    age: 600,
    conversation: {
      readAt: 100,
      messages: [
        { sender: "finder", body: "Hi! I found a blue suitcase with this tag near baggage belt 4 at the airport. It looks undamaged.", at: 180, lat: 13.1989, lng: 77.7068 },
        { sender: "owner", body: "Thank you so much! That's mine. Could you hand it to the airline help desk next to belt 4?", at: 120 },
        { sender: "finder", body: "Done, it's at the help desk now under the name on the tag.", at: 30 },
      ],
    },
  },
  {
    code: "DEMAC234",
    itemName: "Laptop",
    note: null,
    design: { template: "laptop", color: "#9333ea", customText: "Return to owner, no questions" },
    status: "safe",
    scans: 2,
    age: 500,
  },
  {
    code: "DEMAD234",
    itemName: "School backpack",
    note: "Has my notebooks inside, please return.",
    design: { template: "school", color: "#16a34a", customText: "Scan the code to message me" },
    status: "found",
    scans: 4,
    age: 400,
    conversation: {
      readAt: 1,
      messages: [
        { sender: "finder", body: "Found this backpack in the college library, 2nd floor. I left it at the front desk.", at: 300 },
        { sender: "owner", body: "Picked it up, thank you for your honesty!", at: 240 },
      ],
    },
  },
  {
    code: "DEMAE234",
    itemName: "House keys",
    note: null,
    design: { template: "keychain", color: "#ea580c", customText: "Scan me" },
    status: "safe",
    scans: 1,
    age: 300,
  },
];

db.transaction(() => {
  const hash = bcrypt.hashSync(password, 12);
  const existing = db.prepare("select id from users where email = ?").get(DEMO_EMAIL) as { id: string } | undefined;
  const userId = existing?.id ?? randomUUID();
  if (existing) db.prepare("update users set password_hash = ? where id = ?").run(hash, userId);
  else db.prepare("insert into users (id, email, password_hash, created_at) values (?, ?, ?, ?)").run(userId, DEMO_EMAIL, hash, minutesAgo(1000));

  // Remove previous demo tags (cascades to conversations and messages), including any with the fixed codes.
  db.prepare("delete from tags where owner_id = ? or code in (" + TAGS.map(() => "?").join(",") + ")").run(userId, ...TAGS.map((t) => t.code));

  for (const t of TAGS) {
    const tagId = randomUUID();
    db.prepare(
      "insert into tags (id, owner_id, code, item_name, note, design, status, scan_count, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(tagId, userId, t.code, t.itemName, t.note, JSON.stringify(t.design), t.status, t.scans, minutesAgo(t.age));
    if (!t.conversation) continue;

    const convId = randomUUID();
    const { hash: tokenHash } = createFinderToken(); // demo finder token is discarded; only the hash is stored
    const first = t.conversation.messages[0].at;
    db.prepare("insert into conversations (id, tag_id, finder_token_hash, owner_last_read_at, created_at) values (?, ?, ?, ?, ?)").run(
      convId,
      tagId,
      tokenHash,
      t.conversation.readAt == null ? null : minutesAgo(t.conversation.readAt),
      minutesAgo(first),
    );
    for (const m of t.conversation.messages) {
      db.prepare("insert into messages (id, conversation_id, sender, body, lat, lng, created_at) values (?, ?, ?, ?, ?, ?, ?)").run(
        randomUUID(),
        convId,
        m.sender,
        m.body,
        m.lat ?? null,
        m.lng ?? null,
        minutesAgo(m.at),
      );
    }
  }
})();

closeDb();
console.log(`Seeded demo data for ${DEMO_EMAIL} (4 tags, 2 conversations). Password is in .env.local as DEMO_PASSWORD.`);
