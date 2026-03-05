import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the current health status. Used for uptime monitoring and keep-alive pings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-03-05T02:43:00.000Z' },
      },
    },
  })
  getStatus() {
    return this.healthService.getStatus();
  }
}
