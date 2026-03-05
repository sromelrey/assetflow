import cron from 'node-cron';

/**
 * Initializes a cron job that pings the application's own health endpoint
 * every 5 minutes to prevent Render free-tier cold starts.
 *
 * Only runs when NODE_ENV === 'production'.
 * Fails silently if the request fails.
 */
export function initKeepAlive(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const serviceUrl = process.env.SERVICE_URL;

  if (!serviceUrl) {
    console.warn('[KeepAlive] SERVICE_URL is not set. Skipping keep-alive cron.');
    return;
  }

  // Schedule: every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await fetch(`${serviceUrl}/health`);
    } catch {
      // Fail silently — the purpose is best-effort keep-alive
    }
  });

  console.log('[KeepAlive] Cron job initialized — pinging every 5 minutes.');
}
