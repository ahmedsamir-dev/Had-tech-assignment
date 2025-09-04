import type {
  Gateway,
  GatewayWithDevicesAndTypes,
  PeripheralDevice,
} from '@/modules/gateways/types';
import type {
  CreateGatewayRequest,
  UpdateGatewayRequest,
  CreateDeviceRequest,
} from '@/modules/gateways/validation/schemas';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/shared/types/pagination';

export interface IGatewayService {
  getAllGateways(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<GatewayWithDevicesAndTypes>>;
  getGatewayById(id: string): Promise<GatewayWithDevicesAndTypes>;
  createGateway(gatewayData: CreateGatewayRequest): Promise<Gateway>;
  updateGateway(id: string, updateData: UpdateGatewayRequest): Promise<Gateway>;
  deleteGateway(id: string): Promise<void>;
  attachDevice(
    gatewayId: string,
    deviceData: CreateDeviceRequest
  ): Promise<PeripheralDevice>;
  detachDevice(gatewayId: string, deviceId: string): Promise<void>;
}
