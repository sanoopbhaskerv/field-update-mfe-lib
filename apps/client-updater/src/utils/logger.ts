/**
 * Lightweight structured logger.
 *
 * - Uses `console` under the hood (no runtime deps).
 * - Prefixes every message with `[tag]` for easy grep-ing.
 * - Silences `debug` in production builds.
 *
 * Usage:
 * ```ts
 * import { createLogger } from '../utils/logger';
 * const log = createLogger('MyService');
 * log.info('ready');        // → [MyService] ready
 * log.error('boom', err);   // → [MyService] boom  Error: …
 * ```
 */

export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export function createLogger(tag: string): Logger {
  const prefix = `[${tag}]`;
  const isDev = import.meta.env.DEV;

  return {
    debug: (...args) => {
      if (isDev) console.debug(prefix, ...args);
    },
    info: (...args) => {
      console.info(prefix, ...args);
    },
    warn: (...args) => {
      console.warn(prefix, ...args);
    },
    error: (...args) => {
      console.error(prefix, ...args);
    },
  };
}
