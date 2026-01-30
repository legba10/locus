import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SystemStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    backend: 'ok' | 'error';
    database: 'ok' | 'error';
    ai: 'ok' | 'error';
    storage: 'ok' | 'unknown';
  };
  stats?: {
    users: number;
    listings: number;
    bookings: number;
  };
}

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private readonly startTime = Date.now();
  private readonly version = process.env.npm_package_version || '1.0.0';

  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<SystemStatus> {
    const services = {
      backend: 'ok' as const,
      database: await this.checkDatabase(),
      ai: await this.checkAi(),
      storage: 'unknown' as const, // TODO: implement Supabase check
    };

    // Determine overall status
    const hasError = Object.values(services).some(s => s === 'error');
    const hasDegraded = Object.values(services).some(s => s === 'unknown');
    
    let status: 'ok' | 'degraded' | 'error';
    if (hasError) {
      status = 'error';
    } else if (hasDegraded) {
      status = 'degraded';
    } else {
      status = 'ok';
    }

    // Get basic stats
    let stats;
    try {
      const [users, listings, bookings] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.listing.count(),
        this.prisma.booking.count(),
      ]);
      stats = { users, listings, bookings };
    } catch (e) {
      this.logger.warn('Failed to get stats:', e);
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      version: this.version,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
      stats,
    };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (e) {
      this.logger.error('Database check failed:', e);
      return 'error';
    }
  }

  private async checkAi(): Promise<'ok' | 'error'> {
    // AI is deterministic in MVP, so always ok if backend is running
    // In future: check OpenAI connection, model availability, etc.
    return 'ok';
  }
}
