import { createClient, type TrevoClient } from "@trevosdk/node";

// Server-side Trevo client (singleton per server process). Used by API routes
// to record conversions authoritatively and to resolve server-side experiment
// variants. Disabled when TREVO_SECRET_KEY is not configured.
let client: TrevoClient | null | undefined;

export function trevoServer(): TrevoClient | null {
  if (client !== undefined) return client;
  const secretKey = process.env.TREVO_SECRET_KEY;
  client = secretKey ? createClient({ secretKey }) : null;
  return client;
}
