import type { Request, Response, NextFunction } from 'express';

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export function asyncHandler(controller: AsyncController) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}
