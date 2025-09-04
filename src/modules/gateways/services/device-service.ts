import { injectable, inject } from 'tsyringe';
import httpStatus from 'http-status';
import type { IPeripheralDeviceRepository } from '@/modules/gateways/interfaces/peripheral-device-repository.interface';
import type { IDeviceService } from '@/modules/gateways/interfaces/device-service.interface';
import { ApiError } from '@/shared/middleware/error-handler';
import type {
  PeripheralDevice,
  NewPeripheralDevice,
  DeviceWithType,
} from '@/modules/gateways/types';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/shared/types/pagination';
import {
  calculatePagination,
  createPaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from '@/shared/types/pagination';

@injectable()
export class DeviceService implements IDeviceService {
  constructor(
    @inject('IPeripheralDeviceRepository')
    private readonly deviceRepository: IPeripheralDeviceRepository
  ) {}

  async getAllDevices(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DeviceWithType>> {
    const page = pagination?.page ?? DEFAULT_PAGE;
    const limit = pagination?.limit ?? DEFAULT_LIMIT;

    const paginationOptions = calculatePagination(page, limit);
    const [devices, total] = await Promise.all([
      this.deviceRepository.findAll(paginationOptions),
      this.deviceRepository.countAll(),
    ]);

    return createPaginatedResponse(devices, total, page, limit);
  }

  async getDeviceById(id: string): Promise<DeviceWithType> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new ApiError('Device not found', httpStatus.NOT_FOUND);
    }
    return device;
  }

  async createDevice(
    deviceData: NewPeripheralDevice
  ): Promise<PeripheralDevice> {
    // Check if UID is already in use
    const existingDevice = await this.deviceRepository.findByUid(
      deviceData.uid
    );
    if (existingDevice) {
      throw new ApiError('Device UID already exists', httpStatus.CONFLICT);
    }

    return await this.deviceRepository.create(deviceData);
  }

  async updateDevice(
    id: string,
    updateData: Partial<NewPeripheralDevice>
  ): Promise<PeripheralDevice> {
    const existingDevice = await this.deviceRepository.findById(id);
    if (!existingDevice) {
      throw new ApiError('Device not found', httpStatus.NOT_FOUND);
    }

    // If updating UID, check for conflicts
    if (updateData.uid) {
      const deviceWithUid = await this.deviceRepository.findByUid(
        updateData.uid
      );
      if (deviceWithUid && deviceWithUid.id !== id) {
        throw new ApiError('Device UID already exists', httpStatus.CONFLICT);
      }
    }

    const updatedDevice = await this.deviceRepository.update(id, updateData);
    if (!updatedDevice) {
      throw new ApiError(
        'Failed to update device',
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<void> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new ApiError('Device not found', httpStatus.NOT_FOUND);
    }

    const deleted = await this.deviceRepository.delete(id);
    if (!deleted) {
      throw new ApiError(
        'Failed to delete device',
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
