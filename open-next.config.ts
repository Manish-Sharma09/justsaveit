import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * Defaults only. The incremental-cache, tag-cache and queue overrides that
 * OpenNext offers all bind extra Cloudflare resources (KV, D1, Durable
 * Objects); this app renders its dynamic pages straight from MongoDB on every
 * request and has nothing worth caching between them, so none are wired up.
 */
export default defineCloudflareConfig();
