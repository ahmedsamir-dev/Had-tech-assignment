import { Router, Request, Response } from 'express';
import {
  processRequestBody,
  processRequestParams,
} from '@/shared/middleware/validation';
import { container } from '@/config/container';
import type { IGatewayController } from '@/modules/gateways/interfaces/gateway-controller.interface';
import { asyncHandler } from '@/shared/middleware/async-handler';
import {
  createGatewaySchema,
  updateGatewaySchema,
  gatewayParamsSchema,
  createDeviceSchema,
  detachDeviceSchema,
} from '@/modules/gateways/validation/schemas';

export const gatewayRoutes: Router = Router();

// Helper function to get controller (lazy loading)
const getController = (): IGatewayController =>
  container.resolve<IGatewayController>('IGatewayController');

/**
 * @swagger
 * /gateways:
 *   post:
 *     summary: Create a new gateway
 *     description: Creates a new gateway with the provided details. Serial number and IPv4 address must be unique.
 *     tags: [Gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGatewayRequest'
 *           example:
 *             serialNumber: "GW-2024-001"
 *             name: "Main Building Gateway"
 *             ipv4Address: "192.168.1.100"
 *             status: "active"
 *             location: "Building A, Floor 1"
 *     responses:
 *       201:
 *         description: Gateway created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gateway'
 *             example:
 *               success: true
 *               message: "Gateway created successfully"
 *               data:
 *                 id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *                 serialNumber: "GW-2024-001"
 *                 name: "Main Building Gateway"
 *                 ipv4Address: "192.168.1.100"
 *                 status: "active"
 *                 location: "Building A, Floor 1"
 *                 devices: []
 *                 createdAt: "2024-01-01T10:00:00.000Z"
 *                 updatedAt: "2024-01-01T10:00:00.000Z"
 *       400:
 *         description: Validation error or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Serial number or IPv4 address already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
gatewayRoutes.post(
  '/',
  processRequestBody(createGatewaySchema),
  asyncHandler((req: Request, res: Response) =>
    getController().createGateway(req, res)
  )
);

/**
 * @swagger
 * /gateways:
 *   get:
 *     summary: Get all gateways
 *     description: Retrieves a paginated list of all gateways with their associated peripheral devices.
 *     tags: [Gateways]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of gateways retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Gateway'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                         limit:
 *                           type: integer
 *                           description: Number of items per page
 *                         total:
 *                           type: integer
 *                           description: Total number of gateways
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                         hasNext:
 *                           type: boolean
 *                           description: Whether there is a next page
 *                         hasPrevious:
 *                           type: boolean
 *                           description: Whether there is a previous page
 *             example:
 *               success: true
 *               data:
 *                 - id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *                   serialNumber: "GW-2024-001"
 *                   name: "Main Building Gateway"
 *                   ipv4Address: "192.168.1.100"
 *                   status: "active"
 *                   location: "Building A, Floor 1"
 *                   devices: []
 *                   createdAt: "2024-01-01T10:00:00.000Z"
 *                   updatedAt: "2024-01-01T10:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 totalPages: 1
 *                 hasNext: false
 *                 hasPrevious: false
 */
gatewayRoutes.get(
  '/',
  asyncHandler((req: Request, res: Response) =>
    getController().getAllGateways(req, res)
  )
);

/**
 * @swagger
 * /gateways/{id}:
 *   get:
 *     summary: Get gateway by ID
 *     description: Retrieves a specific gateway by its UUID, including all associated devices.
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gateway UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *     responses:
 *       200:
 *         description: Gateway retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gateway'
 *       404:
 *         description: Gateway not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid gateway ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
gatewayRoutes.get(
  '/:id',
  processRequestParams(gatewayParamsSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().getGatewayById(req, res)
  )
);

/**
 * @swagger
 * /gateways/{id}:
 *   put:
 *     summary: Update gateway
 *     description: Updates an existing gateway. Serial number cannot be modified after creation.
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gateway UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGatewayRequest'
 *           example:
 *             name: "Updated Gateway Name"
 *             ipv4Address: "192.168.1.101"
 *             status: "inactive"
 *             location: "Building B, Floor 2"
 *     responses:
 *       200:
 *         description: Gateway updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gateway'
 *       404:
 *         description: Gateway not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: IPv4 address already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
gatewayRoutes.put(
  '/:id',
  processRequestParams(gatewayParamsSchema),
  processRequestBody(updateGatewaySchema),
  asyncHandler((req: Request, res: Response) =>
    getController().updateGateway(req, res)
  )
);

/**
 * @swagger
 * /gateways/{id}:
 *   delete:
 *     summary: Delete gateway
 *     description: Deletes a gateway and handles orphaned devices (devices become unattached).
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gateway UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *     responses:
 *       204:
 *         description: Gateway deleted successfully
 *       404:
 *         description: Gateway not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid gateway ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
gatewayRoutes.delete(
  '/:id',
  processRequestParams(gatewayParamsSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().deleteGateway(req, res)
  )
);

/**
 * @swagger
 * /gateways/{id}/devices:
 *   post:
 *     summary: Create and attach device to gateway
 *     description: Creates a new peripheral device and attaches it to the specified gateway. Gateway can have maximum 10 devices.
 *     tags: [Gateways, Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gateway UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeviceRequest'
 *           example:
 *             uid: 12345678901
 *             vendor: "Acme Corp"
 *             status: "online"
 *             deviceTypeId: 1
 *     responses:
 *       201:
 *         description: Device created and attached successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Device'
 *             example:
 *               success: true
 *               message: "Device created and attached to gateway successfully"
 *               data:
 *                 id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *                 uid: 12345678901
 *                 vendor: "Acme Corp"
 *                 status: "online"
 *                 deviceTypeId: 1
 *                 gatewayId: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *                 createdAt: "2024-01-01T10:00:00.000Z"
 *                 updatedAt: "2024-01-01T10:00:00.000Z"
 *       400:
 *         description: Validation error or gateway at device limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               deviceLimit:
 *                 summary: Gateway device limit reached
 *                 value:
 *                   error: "Bad Request"
 *                   message: "Gateway has reached maximum device limit (10)"
 *               validation:
 *                 summary: Validation error
 *                 value:
 *                   error: "Validation Error"
 *                   message: "Device UID must be a positive number"
 *       404:
 *         description: Gateway not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Device UID already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
gatewayRoutes.post(
  '/:id/devices',
  processRequestParams(gatewayParamsSchema),
  processRequestBody(createDeviceSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().attachDevice(req, res)
  )
);

/**
 * @swagger
 * /gateways/{id}/devices:
 *   delete:
 *     summary: Detach device from gateway
 *     description: Removes a device from the gateway, making it an orphaned device.
 *     tags: [Gateways, Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gateway UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetachDeviceRequest'
 *           example:
 *             deviceId: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *     responses:
 *       204:
 *         description: Device detached successfully
 *       404:
 *         description: Gateway or device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Validation error or device not attached to gateway
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
gatewayRoutes.delete(
  '/:id/devices',
  processRequestParams(gatewayParamsSchema),
  processRequestBody(detachDeviceSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().detachDevice(req, res)
  )
);
