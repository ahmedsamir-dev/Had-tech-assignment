import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from '@/config/environment';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gateway Management API',
      version: '1.0.0',
      description: `
        REST API for managing gateways and peripheral devices.
        
        ## Features
        - **Gateway Management**: Create, read, update, and delete gateways
        - **Device Management**: Manage peripheral devices (attached or orphaned)
        - **Device Limits**: Maximum 10 devices per gateway
        - **Unique Constraints**: Serial numbers, IPv4 addresses, and device UIDs must be unique
        - **Audit Logging**: Gateway actions are logged for audit trail
        
        ## Business Rules
        - Gateway serial numbers are immutable after creation
        - IPv4 addresses must be valid and unique across all gateways
        - Device UIDs must be globally unique (bigint values)
        - Deleting a gateway creates orphaned devices (not deleted)
        - Maximum 10 devices can be attached to a single gateway
      `,
      contact: {
        name: 'HAD Technical Assignment',
        email: 'developer@example.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Gateways',
        description: 'Gateway management operations',
      },
      {
        name: 'Devices',
        description: 'Peripheral device management operations',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                stack: { type: 'string' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/*/routes/*.ts', './src/modules/*/validation/*.ts'],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Gateway Management API Docs',
    })
  );

  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
