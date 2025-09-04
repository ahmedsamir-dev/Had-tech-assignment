import { injectable, inject } from 'tsyringe';
import httpStatus from 'http-status';
import type { Request, Response } from 'express';
import type { IGatewayService } from '@/modules/gateways/interfaces/gateway-service.interface';
import type { IGatewayController } from '@/modules/gateways/interfaces/gateway-controller.interface';
import type {
  CreateGatewayRequest,
  UpdateGatewayRequest,
  CreateDeviceRequest,
  DetachDeviceRequest,
} from '@/modules/gateways/validation/schemas';

@injectable()
export class GatewayController implements IGatewayController {
  constructor(
    @inject('IGatewayService') private readonly gatewayService: IGatewayService
  ) {}

  async getAllGateways(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const pagination =
      !isNaN(page) || !isNaN(limit)
        ? {
            page: !isNaN(page) ? page : 1,
            limit: !isNaN(limit) ? limit : 10,
          }
        : undefined;

    const result = await this.gatewayService.getAllGateways(pagination);

    res.json({
      success: true,
      ...result,
    });
  }

  async getGatewayById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const gateway = await this.gatewayService.getGatewayById(id);
    res.json({
      success: true,
      data: gateway,
    });
  }

  async createGateway(req: Request, res: Response): Promise<void> {
    const gatewayData = req.body as CreateGatewayRequest;
    const gateway = await this.gatewayService.createGateway(gatewayData);
    res.status(httpStatus.CREATED).json({
      success: true,
      data: gateway,
      message: 'Gateway created successfully',
    });
  }

  async updateGateway(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body as UpdateGatewayRequest;
    const gateway = await this.gatewayService.updateGateway(id, updateData);
    res.json({
      success: true,
      data: gateway,
      message: 'Gateway updated successfully',
    });
  }

  async deleteGateway(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.gatewayService.deleteGateway(id);
    res.json({
      success: true,
      message: 'Gateway deleted successfully',
    });
  }

  async attachDevice(req: Request, res: Response): Promise<void> {
    const { id: gatewayId } = req.params;
    const deviceData = req.body as CreateDeviceRequest;
    const device = await this.gatewayService.attachDevice(
      gatewayId,
      deviceData
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Device created and attached to gateway successfully',
      data: device,
    });
  }

  async detachDevice(req: Request, res: Response): Promise<void> {
    const { id: gatewayId } = req.params;
    const { deviceId } = req.body as DetachDeviceRequest;
    await this.gatewayService.detachDevice(gatewayId, deviceId);
    res.json({
      success: true,
      message: 'Device detached from gateway successfully',
    });
  }
}
