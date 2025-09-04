import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  gateways,
  peripheralDevices,
  gatewayLogs,
  deviceTypes,
} from '@/database/schema';

export type Gateway = InferSelectModel<typeof gateways>;
export type NewGateway = InferInsertModel<typeof gateways>;

export type PeripheralDevice = InferSelectModel<typeof peripheralDevices>;
export type NewPeripheralDevice = InferInsertModel<typeof peripheralDevices>;

export type DeviceType = InferSelectModel<typeof deviceTypes>;
export type NewDeviceType = InferInsertModel<typeof deviceTypes>;

export type GatewayLog = InferSelectModel<typeof gatewayLogs>;
export type NewGatewayLog = InferInsertModel<typeof gatewayLogs>;

export type GatewayStatus = 'active' | 'inactive' | 'decommissioned';
export type DeviceStatus = 'online' | 'offline' | 'maintenance';
export type GatewayAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DEVICE_ATTACHED'
  | 'DEVICE_DETACHED'
  | 'DELETED';

export interface GatewayWithDevices extends Gateway {
  devices: PeripheralDevice[];
}

export interface DeviceWithType extends PeripheralDevice {
  deviceType: DeviceType;
}

export interface GatewayWithDevicesAndTypes extends Gateway {
  devices: DeviceWithType[];
}
