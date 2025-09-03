import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import httpStatus from 'http-status';

import { env } from '@/config/environment';
import { logger } from '@/shared/logger';
import { errorHandler } from '@/shared/middleware/error-handler';
import { setupSwagger } from '@/config/swagger';

export class ExpressAppFactory {
  private readonly app: Express;
  private routesConfigured = false;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
      })
    );

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(compression());

    this.app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      })
    );
  }

  private setupRoutes(): void {
    setupSwagger(this.app);

    this.app.get('/health', (req: Request, res: Response) => {
      res.status(httpStatus.OK).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(httpStatus.OK).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'HAD Gateway Management API',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    this.app.use('*', (req: Request, res: Response) => {
      res.status(httpStatus.NOT_FOUND).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
      });
    });
  }

  public getApp(): Express {
    return this.app;
  }

  public addRoutes(path: string, router: express.Router): void {
    logger.info(`Adding routes at path: ${path}`);
    this.app.use(path, router);
  }

  public finalizeApp(): Express {
    if (!this.routesConfigured) {
      this.setupErrorHandling();
      this.routesConfigured = true;
    }
    return this.app;
  }
}
