import { injectable } from 'tsyringe';
import { eq, count } from 'drizzle-orm';
import { db } from '@/database/connection';
import { gateways, peripheralDevices, gatewayLogs } from '@/database/schema';
import type { IGatewayRepository } from '@/modules/gateways/interfaces/gateway-repository.interface';
import type {
  Gateway,
  NewGateway,
  GatewayWithDevicesAndTypes,
  NewGatewayLog,
  GatewayAction,
} from '@/modules/gateways/types';
import type { PaginationOptions } from '@/shared/types/pagination';
import { env } from '@/config/environment';

@injectable()
export class GatewayRepository implements IGatewayRepository {
  async findAll(
    pagination?: PaginationOptions
  ): Promise<GatewayWithDevicesAndTypes[]> {
    if (pagination) {
      return await db.query.gateways.findMany({
        with: {
          devices: {
            with: {
              deviceType: true,
            },
          },
        },
        limit: pagination.limit,
        offset: pagination.offset,
      });
    }

    return await db.query.gateways.findMany({
      with: {
        devices: {
          with: {
            deviceType: true,
          },
        },
      },
    });
  }

  async countAll(): Promise<number> {
    const result = await db.select({ count: count() }).from(gateways);
    return result[0]?.count ?? 0;
  }

  async findById(id: string): Promise<GatewayWithDevicesAndTypes | undefined> {
    return await db.query.gateways.findFirst({
      where: eq(gateways.id, id),
      with: {
        devices: {
          with: {
            deviceType: true,
          },
        },
      },
    });
  }

  async findBySerialNumber(serialNumber: string): Promise<Gateway | undefined> {
    return await db.query.gateways.findFirst({
      where: eq(gateways.serialNumber, serialNumber),
    });
  }

  async findByIpAddress(ipv4Address: string): Promise<Gateway | undefined> {
    return await db.query.gateways.findFirst({
      where: eq(gateways.ipv4Address, ipv4Address),
    });
  }

  async create(gatewayData: NewGateway): Promise<Gateway> {
    const [gateway] = await db.insert(gateways).values(gatewayData).returning();

    await this.logAction(gateway.id, 'CREATED', {
      gatewayData: {
        serialNumber: gateway.serialNumber,
        name: gateway.name,
        ipv4Address: gateway.ipv4Address,
        status: gateway.status,
      },
    });

    return gateway;
  }

  async update(
    id: string,
    updateData: Partial<NewGateway>
  ): Promise<Gateway | undefined> {
    const [gateway] = await db
      .update(gateways)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(gateways.id, id))
      .returning();

    if (gateway) {
      await this.logAction(id, 'UPDATED', { updateData });
    }

    return gateway;
  }

  async delete(id: string): Promise<boolean> {
    const deletedGateways = await db
      .delete(gateways)
      .where(eq(gateways.id, id))
      .returning();

    if (deletedGateways.length > 0) {
      await this.logAction(id, 'DELETED', { deletedAt: new Date() });
      return true;
    }

    return false;
  }

  async getDeviceCount(gatewayId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(peripheralDevices)
      .where(eq(peripheralDevices.gatewayId, gatewayId));

    return result.count;
  }

  async canAttachDevice(gatewayId: string): Promise<boolean> {
    const deviceCount = await this.getDeviceCount(gatewayId);
    return deviceCount < env.MAX_DEVICES_PER_GATEWAY;
  }

  async logAction(
    gatewayId: string,
    action: GatewayAction,
    details: Record<string, any>
  ): Promise<void> {
    const logData: NewGatewayLog = {
      gatewayId,
      action,
      details,
    };

    await db.insert(gatewayLogs).values(logData);
  }
}
