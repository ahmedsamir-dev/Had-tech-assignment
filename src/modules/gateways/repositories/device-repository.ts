import { injectable } from 'tsyringe';
import { eq, count } from 'drizzle-orm';
import { db } from '@/database/connection';
import { peripheralDevices } from '@/database/schema';
import type { IPeripheralDeviceRepository } from '@/modules/gateways/interfaces/peripheral-device-repository.interface';
import type {
  PeripheralDevice,
  NewPeripheralDevice,
  DeviceWithType,
} from '@/modules/gateways/types';
import type { PaginationOptions } from '@/shared/types/pagination';

@injectable()
export class DeviceRepository implements IPeripheralDeviceRepository {
  async findAll(pagination?: PaginationOptions): Promise<DeviceWithType[]> {
    if (pagination) {
      return await db.query.peripheralDevices.findMany({
        with: {
          deviceType: true,
        },
        limit: pagination.limit,
        offset: pagination.offset,
      });
    }

    return await db.query.peripheralDevices.findMany({
      with: {
        deviceType: true,
      },
    });
  }

  async countAll(): Promise<number> {
    const result = await db.select({ count: count() }).from(peripheralDevices);
    return result[0]?.count ?? 0;
  }
  async findById(id: string): Promise<DeviceWithType | undefined> {
    return await db.query.peripheralDevices.findFirst({
      where: eq(peripheralDevices.id, id),
      with: {
        deviceType: true,
      },
    });
  }

  async findByUid(uid: number): Promise<PeripheralDevice | undefined> {
    return await db.query.peripheralDevices.findFirst({
      where: eq(peripheralDevices.uid, uid),
    });
  }

  async findByGatewayId(gatewayId: string): Promise<DeviceWithType[]> {
    return await db.query.peripheralDevices.findMany({
      where: eq(peripheralDevices.gatewayId, gatewayId),
      with: {
        deviceType: true,
      },
    });
  }

  async create(deviceData: NewPeripheralDevice): Promise<PeripheralDevice> {
    const [device] = await db
      .insert(peripheralDevices)
      .values(deviceData)
      .returning();
    return device;
  }

  async update(
    id: string,
    updateData: Partial<NewPeripheralDevice>
  ): Promise<PeripheralDevice | undefined> {
    const [device] = await db
      .update(peripheralDevices)
      .set(updateData)
      .where(eq(peripheralDevices.id, id))
      .returning();

    return device;
  }

  async delete(id: string): Promise<boolean> {
    const deletedDevices = await db
      .delete(peripheralDevices)
      .where(eq(peripheralDevices.id, id))
      .returning();
    return deletedDevices.length > 0;
  }

  async detachFromGateway(deviceId: string): Promise<boolean> {
    const [device] = await db
      .update(peripheralDevices)
      .set({ gatewayId: null })
      .where(eq(peripheralDevices.id, deviceId))
      .returning();

    return !!device;
  }

  async attachToGateway(deviceId: string, gatewayId: string): Promise<boolean> {
    const [device] = await db
      .update(peripheralDevices)
      .set({ gatewayId })
      .where(eq(peripheralDevices.id, deviceId))
      .returning();

    return !!device;
  }
}
