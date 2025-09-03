import 'reflect-metadata';
import { container } from 'tsyringe';

// Import interfaces
import type { IGatewayRepository } from '@/modules/gateways/interfaces/gateway-repository.interface';
import type { IPeripheralDeviceRepository } from '@/modules/gateways/interfaces/peripheral-device-repository.interface';
import type { IGatewayService } from '@/modules/gateways/interfaces/gateway-service.interface';
import type { IDeviceService } from '@/modules/gateways/interfaces/device-service.interface';
import type { IGatewayController } from '@/modules/gateways/interfaces/gateway-controller.interface';
import type { IDeviceController } from '@/modules/gateways/interfaces/device-controller.interface';

// Import concrete implementations
import { GatewayRepository } from '@/modules/gateways/repositories/gateway-repository';
import { DeviceRepository } from '@/modules/gateways/repositories/device-repository';
import { GatewayService } from '@/modules/gateways/services/gateway-service';
import { DeviceService } from '@/modules/gateways/services/device-service';
import { GatewayController } from '@/modules/gateways/controllers/gateway-controller';
import { DeviceController } from '@/modules/gateways/controllers/device-controller';

export function registerDependencies(): void {
  // Register repositories
  container.registerSingleton<IGatewayRepository>(
    'IGatewayRepository',
    GatewayRepository
  );
  container.registerSingleton<IPeripheralDeviceRepository>(
    'IPeripheralDeviceRepository',
    DeviceRepository
  );

  // Register services
  container.registerSingleton<IGatewayService>(
    'IGatewayService',
    GatewayService
  );
  container.registerSingleton<IDeviceService>('IDeviceService', DeviceService);

  // Register controllers
  container.registerSingleton<IGatewayController>(
    'IGatewayController',
    GatewayController
  );
  container.registerSingleton<IDeviceController>(
    'IDeviceController',
    DeviceController
  );
}

export { container };
