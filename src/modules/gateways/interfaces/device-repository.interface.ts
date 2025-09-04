import type {
  PeripheralDevice,
  NewPeripheralDevice,
  DeviceWithType,
} from '@/modules/gateways/types';

export interface IDeviceRepository {
  findById(id: string): Promise<DeviceWithType | undefined>;
  findByUid(uid: number): Promise<PeripheralDevice | undefined>;
  findByGatewayId(gatewayId: string): Promise<DeviceWithType[]>;
  create(deviceData: NewPeripheralDevice): Promise<PeripheralDevice>;
  update(
    id: string,
    updateData: Partial<NewPeripheralDevice>
  ): Promise<PeripheralDevice | undefined>;
  delete(id: string): Promise<boolean>;
  detachFromGateway(deviceId: string): Promise<PeripheralDevice | undefined>;
  attachToGateway(
    deviceId: string,
    gatewayId: string
  ): Promise<PeripheralDevice | undefined>;
}
