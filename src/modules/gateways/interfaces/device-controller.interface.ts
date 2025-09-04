import type { Request, Response } from 'express';

export interface IDeviceController {
  getAllDevices(req: Request, res: Response): Promise<void>;
  getDeviceById(req: Request, res: Response): Promise<void>;
  createDevice(req: Request, res: Response): Promise<void>;
  updateDevice(req: Request, res: Response): Promise<void>;
  deleteDevice(req: Request, res: Response): Promise<void>;
}
