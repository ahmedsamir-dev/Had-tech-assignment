import type {
  PeripheralDevice,
  NewPeripheralDevice,
  DeviceWithType,
} from '@/modules/gateways/types';
import type { PaginationOptions } from '@/shared/types/pagination';

export interface IPeripheralDeviceRepository {
  findAll(pagination?: PaginationOptions): Promise<DeviceWithType[]>;
  countAll(): Promise<number>;
  findById(id: string): Promise<DeviceWithType | undefined>;
  findByUid(uid: number): Promise<PeripheralDevice | undefined>;
  findByGatewayId(gatewayId: string): Promise<DeviceWithType[]>;
  create(deviceData: NewPeripheralDevice): Promise<PeripheralDevice>;
  update(
    id: string,
    updateData: Partial<NewPeripheralDevice>
  ): Promise<PeripheralDevice | undefined>;
  delete(id: string): Promise<boolean>;
  attachToGateway(deviceId: string, gatewayId: string): Promise<boolean>;
  detachFromGateway(deviceId: string): Promise<boolean>;
}
