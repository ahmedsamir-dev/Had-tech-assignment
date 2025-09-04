import type { Request, Response } from 'express';

export interface IGatewayController {
  getAllGateways(req: Request, res: Response): Promise<void>;
  getGatewayById(req: Request, res: Response): Promise<void>;
  createGateway(req: Request, res: Response): Promise<void>;
  updateGateway(req: Request, res: Response): Promise<void>;
  deleteGateway(req: Request, res: Response): Promise<void>;
  attachDevice(req: Request, res: Response): Promise<void>;
  detachDevice(req: Request, res: Response): Promise<void>;
}
