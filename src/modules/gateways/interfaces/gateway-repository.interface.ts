import type {
  Gateway,
  NewGateway,
  GatewayWithDevicesAndTypes,
  GatewayAction,
} from '@/modules/gateways/types';
import type { PaginationOptions } from '@/shared/types/pagination';

export interface IGatewayRepository {
  findAll(
    pagination?: PaginationOptions
  ): Promise<GatewayWithDevicesAndTypes[]>;
  countAll(): Promise<number>;
  findById(id: string): Promise<GatewayWithDevicesAndTypes | undefined>;
  findBySerialNumber(serialNumber: string): Promise<Gateway | undefined>;
  findByIpAddress(ipv4Address: string): Promise<Gateway | undefined>;
  create(gatewayData: NewGateway): Promise<Gateway>;
  update(
    id: string,
    updateData: Partial<NewGateway>
  ): Promise<Gateway | undefined>;
  delete(id: string): Promise<boolean>;
  getDeviceCount(gatewayId: string): Promise<number>;
  canAttachDevice(gatewayId: string): Promise<boolean>;
  logAction(
    gatewayId: string,
    action: GatewayAction,
    details: Record<string, any>
  ): Promise<void>;
}
