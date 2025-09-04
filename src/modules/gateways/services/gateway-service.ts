import { injectable, inject } from 'tsyringe';
import httpStatus from 'http-status';
import type { IGatewayRepository } from '@/modules/gateways/interfaces/gateway-repository.interface';
import type { IPeripheralDeviceRepository } from '@/modules/gateways/interfaces/peripheral-device-repository.interface';
import type { IGatewayService } from '@/modules/gateways/interfaces/gateway-service.interface';
import { ApiError } from '@/shared/middleware/error-handler';
import type {
  Gateway,
  NewGateway,
  GatewayWithDevicesAndTypes,
  PeripheralDevice,
} from '@/modules/gateways/types';
import type {
  CreateGatewayRequest,
  CreateDeviceRequest,
} from '@/modules/gateways/validation/schemas';
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
export class GatewayService implements IGatewayService {
  constructor(
    @inject('IGatewayRepository')
    private readonly gatewayRepository: IGatewayRepository,
    @inject('IPeripheralDeviceRepository')
    private readonly deviceRepository: IPeripheralDeviceRepository
  ) {}

  async getAllGateways(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<GatewayWithDevicesAndTypes>> {
    const page = pagination?.page ?? DEFAULT_PAGE;
    const limit = pagination?.limit ?? DEFAULT_LIMIT;

    const paginationOptions = calculatePagination(page, limit);
    const [gateways, total] = await Promise.all([
      this.gatewayRepository.findAll(paginationOptions),
      this.gatewayRepository.countAll(),
    ]);

    return createPaginatedResponse(gateways, total, page, limit);
  }

  async getGatewayById(id: string): Promise<GatewayWithDevicesAndTypes> {
    const gateway = await this.gatewayRepository.findById(id);
    if (!gateway) {
      throw new ApiError('Gateway not found', httpStatus.NOT_FOUND);
    }
    return gateway;
  }

  async createGateway(gatewayData: CreateGatewayRequest): Promise<Gateway> {
    await this.validateUniqueSerialNumber(gatewayData.serialNumber);
    await this.validateUniqueIpAddress(gatewayData.ipv4Address);

    const newGateway: NewGateway = {
      ...gatewayData,
    };

    return await this.gatewayRepository.create(newGateway);
  }

  async updateGateway(
    id: string,
    updateData: Partial<NewGateway>
  ): Promise<Gateway> {
    const existingGateway = await this.gatewayRepository.findById(id);
    if (!existingGateway) {
      throw new ApiError('Gateway not found', httpStatus.NOT_FOUND);
    }

    if (updateData.ipv4Address) {
      await this.validateUniqueIpAddress(updateData.ipv4Address, id);
    }

    const updatedGateway = await this.gatewayRepository.update(id, updateData);
    if (!updatedGateway) {
      throw new ApiError(
        'Failed to update gateway',
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return updatedGateway;
  }

  async deleteGateway(id: string): Promise<void> {
    const gateway = await this.gatewayRepository.findById(id);
    if (!gateway) {
      throw new ApiError('Gateway not found', httpStatus.NOT_FOUND);
    }

    const deleted = await this.gatewayRepository.delete(id);
    if (!deleted) {
      throw new ApiError(
        'Failed to delete gateway',
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async attachDevice(
    gatewayId: string,
    deviceData: CreateDeviceRequest
  ): Promise<PeripheralDevice> {
    const gateway = await this.gatewayRepository.findById(gatewayId);
    if (!gateway) {
      throw new ApiError('Gateway not found', httpStatus.NOT_FOUND);
    }

    const canAttach = await this.gatewayRepository.canAttachDevice(gatewayId);
    if (!canAttach) {
      throw new ApiError(
        'Gateway has reached maximum device limit (10)',
        httpStatus.BAD_REQUEST
      );
    }

    await this.validateUniqueDeviceUid(deviceData.uid);

    const newDevice = await this.deviceRepository.create({
      ...deviceData,
      gatewayId,
    });

    await this.gatewayRepository.logAction(gatewayId, 'DEVICE_ATTACHED', {
      deviceId: newDevice.id,
      deviceUid: deviceData.uid,
      vendor: deviceData.vendor,
    });

    return newDevice;
  }

  async detachDevice(gatewayId: string, deviceId: string): Promise<void> {
    const gateway = await this.gatewayRepository.findById(gatewayId);
    if (!gateway) {
      throw new ApiError('Gateway not found', httpStatus.NOT_FOUND);
    }

    const device = await this.deviceRepository.findById(deviceId);
    if (!device) {
      throw new ApiError('Device not found', httpStatus.NOT_FOUND);
    }

    if (device.gatewayId !== gatewayId) {
      throw new ApiError(
        'Device is not attached to this gateway',
        httpStatus.BAD_REQUEST
      );
    }

    await this.deviceRepository.detachFromGateway(deviceId);

    await this.gatewayRepository.logAction(gatewayId, 'DEVICE_DETACHED', {
      deviceId,
      deviceUid: device.uid.toString(),
    });
  }

  private async validateUniqueSerialNumber(
    serialNumber: string,
    excludeId?: string
  ): Promise<void> {
    const existingGateway =
      await this.gatewayRepository.findBySerialNumber(serialNumber);
    if (existingGateway && existingGateway.id !== excludeId) {
      throw new ApiError('Serial number already exists', httpStatus.CONFLICT);
    }
  }

  private async validateUniqueIpAddress(
    ipv4Address: string,
    excludeId?: string
  ): Promise<void> {
    const existingGateway =
      await this.gatewayRepository.findByIpAddress(ipv4Address);
    if (existingGateway && existingGateway.id !== excludeId) {
      throw new ApiError('IP address already exists', httpStatus.CONFLICT);
    }
  }

  private async validateUniqueDeviceUid(uid: number): Promise<void> {
    const existingDevice = await this.deviceRepository.findByUid(uid);
    if (existingDevice) {
      throw new ApiError('Device UID already exists', httpStatus.CONFLICT);
    }
  }
}
