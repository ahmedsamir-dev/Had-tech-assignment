import { injectable, inject } from 'tsyringe';
import httpStatus from 'http-status';
import type { Request, Response } from 'express';
import type { IDeviceService } from '@/modules/gateways/interfaces/device-service.interface';
import type { IDeviceController } from '@/modules/gateways/interfaces/device-controller.interface';
import type { CreateDeviceRequest } from '@/modules/gateways/validation/schemas';
import type { NewPeripheralDevice } from '@/modules/gateways/types';

@injectable()
export class DeviceController implements IDeviceController {
  constructor(
    @inject('IDeviceService') private readonly deviceService: IDeviceService
  ) {}

  async getAllDevices(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const pagination =
      !isNaN(page) || !isNaN(limit)
        ? {
            page: !isNaN(page) ? page : 1,
            limit: !isNaN(limit) ? limit : 10,
          }
        : undefined;

    const result = await this.deviceService.getAllDevices(pagination);

    res.json({
      success: true,
      ...result,
    });
  }

  async getDeviceById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const device = await this.deviceService.getDeviceById(id);
    res.json({
      success: true,
      data: device,
    });
  }

  async createDevice(req: Request, res: Response): Promise<void> {
    const deviceData = req.body as CreateDeviceRequest;
    const device = await this.deviceService.createDevice(deviceData);
    res.status(httpStatus.CREATED).json({
      success: true,
      data: device,
      message: 'Device created successfully',
    });
  }

  async updateDevice(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body as Partial<NewPeripheralDevice>;
    const device = await this.deviceService.updateDevice(id, updateData);
    res.json({
      success: true,
      data: device,
      message: 'Device updated successfully',
    });
  }

  async deleteDevice(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.deviceService.deleteDevice(id);
    res.json({
      success: true,
      message: 'Device deleted successfully',
    });
  }
}
