import { Router, Request, Response } from 'express';
import {
  processRequestBody,
  processRequestParams,
} from '@/shared/middleware/validation';
import { container } from '@/config/container';
import type { IDeviceController } from '@/modules/gateways/interfaces/device-controller.interface';
import { asyncHandler } from '@/shared/middleware/async-handler';
import {
  createDeviceSchema,
  deviceIdParamsSchema,
} from '@/modules/gateways/validation/schemas';

export const deviceRoutes: Router = Router();

// Helper function to get controller (lazy loading)
const getController = (): IDeviceController =>
  container.resolve<IDeviceController>('IDeviceController');

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Create a new orphaned device
 *     description: Creates a new peripheral device without attaching it to any gateway (orphaned device).
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeviceRequest'
 *           example:
 *             uid: 98765432109
 *             vendor: "Tech Industries"
 *             status: "offline"
 *             deviceTypeId: 2
 *     responses:
 *       201:
 *         description: Device created successfully
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
 *               message: "Device created successfully"
 *               data:
 *                 id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b14"
 *                 uid: 98765432109
 *                 vendor: "Tech Industries"
 *                 status: "offline"
 *                 deviceTypeId: 2
 *                 gatewayId: null
 *                 createdAt: "2024-01-01T10:00:00.000Z"
 *                 updatedAt: "2024-01-01T10:00:00.000Z"
 *       400:
 *         description: Validation error
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
deviceRoutes.post(
  '/',
  processRequestBody(createDeviceSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().createDevice(req, res)
  )
);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get all devices
 *     description: Retrieves a paginated list of all peripheral devices, including both attached and orphaned devices.
 *     tags: [Devices]
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
 *         description: List of devices retrieved successfully
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
 *                         $ref: '#/components/schemas/Device'
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
 *                           description: Total number of devices
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
 *                 - id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *                   uid: 12345678901
 *                   vendor: "Acme Corp"
 *                   status: "online"
 *                   deviceTypeId: 1
 *                   gatewayId: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *                   createdAt: "2024-01-01T10:00:00.000Z"
 *                   updatedAt: "2024-01-01T10:00:00.000Z"
 *                 - id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b14"
 *                   uid: 98765432109
 *                   vendor: "Tech Industries"
 *                   status: "offline"
 *                   deviceTypeId: 2
 *                   gatewayId: null
 *                   createdAt: "2024-01-01T11:00:00.000Z"
 *                   updatedAt: "2024-01-01T11:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 2
 *                 totalPages: 1
 *                 hasNext: false
 *                 hasPrevious: false
 *               count: 2
 */
deviceRoutes.get(
  '/',
  asyncHandler((req: Request, res: Response) =>
    getController().getAllDevices(req, res)
  )
);

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Get device by ID
 *     description: Retrieves a specific peripheral device by its UUID.
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *     responses:
 *       200:
 *         description: Device retrieved successfully
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
 *               data:
 *                 id: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *                 uid: 12345678901
 *                 vendor: "Acme Corp"
 *                 status: "online"
 *                 deviceTypeId: 1
 *                 gatewayId: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b12"
 *                 createdAt: "2024-01-01T10:00:00.000Z"
 *                 updatedAt: "2024-01-01T10:00:00.000Z"
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid device ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
deviceRoutes.get(
  '/:id',
  processRequestParams(deviceIdParamsSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().getDeviceById(req, res)
  )
);

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Update device
 *     description: Updates an existing peripheral device. All fields are optional.
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: integer
 *                 format: int64
 *                 minimum: 1
 *                 description: New globally unique device identifier
 *               vendor:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: New device manufacturer/vendor name
 *               status:
 *                 type: string
 *                 enum: [online, offline, maintenance]
 *                 description: New operational status
 *               deviceTypeId:
 *                 type: integer
 *                 minimum: 1
 *                 description: New device type identifier
 *           example:
 *             vendor: "Updated Vendor Name"
 *             status: "maintenance"
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Device UID already exists (if UID is being updated)
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
deviceRoutes.put(
  '/:id',
  processRequestParams(deviceIdParamsSchema),
  processRequestBody(createDeviceSchema.partial()),
  asyncHandler((req: Request, res: Response) =>
    getController().updateDevice(req, res)
  )
);

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Delete device
 *     description: Permanently deletes a peripheral device. If the device is attached to a gateway, it will be detached first.
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device UUID
 *         example: "01932ad7-94a8-7d2e-8fdb-ca9b7e9c4b13"
 *     responses:
 *       204:
 *         description: Device deleted successfully
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid device ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
deviceRoutes.delete(
  '/:id',
  processRequestParams(deviceIdParamsSchema),
  asyncHandler((req: Request, res: Response) =>
    getController().deleteDevice(req, res)
  )
);
