import type {
  PeripheralDevice,
  NewPeripheralDevice,
  DeviceWithType,
} from '@/modules/gateways/types';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/shared/types/pagination';

export interface IDeviceService {
  getAllDevices(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DeviceWithType>>;
  getDeviceById(id: string): Promise<DeviceWithType>;
  createDevice(deviceData: NewPeripheralDevice): Promise<PeripheralDevice>;
  updateDevice(
    id: string,
    updateData: Partial<NewPeripheralDevice>
  ): Promise<PeripheralDevice>;
  deleteDevice(id: string): Promise<void>;
}
