import { ExpressAppFactory } from '@/shared/factories/express-app-factory';
import { logger } from '@/shared/logger';
import { env } from '@/config/environment';
import { registerDependencies } from '@/config/container';
import { gatewayRoutes, deviceRoutes } from '@/modules/gateways';

class App {
  private readonly expressAppFactory: ExpressAppFactory;
  private server: any;

  constructor() {
    // Register dependency injection container
    registerDependencies();

    this.expressAppFactory = new ExpressAppFactory();
    this.setupModuleRoutes();
  }

  private setupModuleRoutes(): void {
    logger.info('Registering gateway routes at /api/v1/gateways');
    this.expressAppFactory.addRoutes('/api/v1/gateways', gatewayRoutes);

    logger.info('Registering device routes at /api/v1/devices');
    this.expressAppFactory.addRoutes('/api/v1/devices', deviceRoutes);
  }

  public start(): void {
    this.expressAppFactory.finalizeApp();
    const app = this.expressAppFactory.getApp();

    this.server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });

    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      this.server.close(() => {
        logger.info('✅ Process terminated gracefully');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error(
          'Could not close connections in time, forcefully shutting down'
        );
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  public getExpressApp() {
    return this.expressAppFactory.getApp();
  }
}

export default App;
