import { neon } from "@neondatabase/serverless";

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

/**
 * Initialize the database tables for domain voting.
 * Safe to call multiple times (uses IF NOT EXISTS).
 */
export async function initDb() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS listed_domains (
      id SERIAL PRIMARY KEY,
      domain_name TEXT NOT NULL UNIQUE,
      token_id TEXT,
      owner_address TEXT NOT NULL,
      listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      domain_id INTEGER NOT NULL REFERENCES listed_domains(id) ON DELETE CASCADE,
      voter_address TEXT NOT NULL,
      vote_type TEXT NOT NULL CHECK (vote_type IN ('moon', 'dead')),
      voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(domain_id, voter_address)
    )
  `;
}
