import { MongoClient, type Db } from "mongodb";
import { env } from "./env";

/**
 * Database handle, with two lifetimes depending on where this runs.
 *
 * On a Node server one MongoClient is pooled for the life of the process,
 * which is what the driver is designed for.
 *
 * On Cloudflare Workers that is not allowed: a socket opened while serving one
 * request may not be touched while serving another, so a module-scope client
 * fails intermittently — the symptom is identical requests alternating between
 * 200 and 500. There the client is created per request instead, memoised on
 * the request's own ExecutionContext so that the several `getDb()` calls in a
 * single request still share one connection.
 */

const onWorkers =
  typeof navigator !== "undefined" &&
  navigator.userAgent === "Cloudflare-Workers";

function newClient(): MongoClient {
  return new MongoClient(env.mongodbUri, {
    // One connection per request on Workers; a pool there would be per-isolate
    // and mostly idle, and Atlas shared tiers cap total connections hard.
    maxPoolSize: onWorkers ? 1 : 10,
    retryWrites: true,
    ...(onWorkers
      ? {
          // A Worker request has a wall-clock budget. Failing fast beats
          // spending all of it inside the driver's default 30s server
          // selection before returning an error nobody can act on.
          serverSelectionTimeoutMS: 5_000,
          connectTimeoutMS: 5_000,
        }
      : {}),
  });
}

/* ------------------------------------------------------------------ node -- */

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function nodeClient(): Promise<MongoClient> {
  // Survives hot-module reloads in development via the global.
  global._mongoClientPromise ??= newClient().connect();
  return global._mongoClientPromise;
}

/* --------------------------------------------------------------- workers -- */

/**
 * Keyed on the per-request ExecutionContext, so an entry becomes collectable
 * as soon as the request it belongs to is gone. The connection itself is torn
 * down by the runtime when the request's I/O context ends — closing it here
 * would race the handlers still using it.
 */
const perRequest = new WeakMap<object, Promise<MongoClient>>();

async function workersClient(): Promise<MongoClient> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");

  let key: object | undefined;
  try {
    key = getCloudflareContext().ctx;
  } catch {
    // No request context — a prerender during build, say. Fall through to an
    // unmemoised client rather than failing the render.
    key = undefined;
  }

  if (!key) return newClient().connect();

  const existing = perRequest.get(key);
  if (existing) return existing;

  const promise = newClient().connect();
  perRequest.set(key, promise);
  return promise;
}

/* ------------------------------------------------------------------------- */

function clientPromise(): Promise<MongoClient> {
  return onWorkers ? workersClient() : nodeClient();
}

/**
 * Resolves the application database. The name comes from the connection
 * string's path segment when present, and otherwise falls back to `q2w` —
 * the database this project has always used.
 */
function databaseName(): string {
  try {
    const path = new URL(env.mongodbUri).pathname.replace(/^\//, "");
    return path || "q2w";
  } catch {
    return "q2w";
  }
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(databaseName());
}

export default clientPromise;
