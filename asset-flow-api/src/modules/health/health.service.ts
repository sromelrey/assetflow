import { Injectable } from '@nestjs/common';

/**
 * Service responsible for providing application health status.
 * Used for uptime monitoring and keep-alive pings.
 */
@Injectable()
export class HealthService {
  /**
   * Returns the current health status of the application.
   *
   * @returns An object containing the status and current ISO timestamp
   */
  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
