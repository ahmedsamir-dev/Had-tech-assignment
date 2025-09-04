import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Gateway:
 *       type: object
 *       required:
 *         - id
 *         - serialNumber
 *         - name
 *         - ipv4Address
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the gateway
 *         serialNumber:
 *           type: string
 *           maxLength: 100
 *           description: Unique serial number of the gateway (immutable)
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Display name of the gateway
 *         ipv4Address:
 *           type: string
 *           pattern: '^(\d{1,3}\.){3}\d{1,3}$'
 *           description: IPv4 address of the gateway (must be unique)
 *         status:
 *           type: string
 *           enum: [active, inactive, decommissioned]
 *           description: Current status of the gateway
 *         location:
 *           type: string
 *           maxLength: 255
 *           description: Physical location of the gateway
 *         devices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Device'
 *           description: List of peripheral devices connected to this gateway (max 10)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Gateway creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     Device:
 *       type: object
 *       required:
 *         - id
 *         - uid
 *         - vendor
 *         - status
 *         - deviceTypeId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the device
 *         uid:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *           description: Globally unique device identifier (bigint)
 *         vendor:
 *           type: string
 *           maxLength: 100
 *           description: Device manufacturer/vendor name
 *         status:
 *           type: string
 *           enum: [online, offline, maintenance]
 *           description: Current operational status of the device
 *         deviceTypeId:
 *           type: integer
 *           minimum: 1
 *           description: Reference to device type
 *         gatewayId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Gateway this device is attached to (nullable for orphan devices)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Device creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     CreateGatewayRequest:
 *       type: object
 *       required:
 *         - serialNumber
 *         - name
 *         - ipv4Address
 *       properties:
 *         serialNumber:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Unique serial number for the gateway
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Display name for the gateway
 *         ipv4Address:
 *           type: string
 *           pattern: '^(\d{1,3}\.){3}\d{1,3}$'
 *           description: IPv4 address for the gateway
 *         status:
 *           type: string
 *           enum: [active, inactive, decommissioned]
 *           default: active
 *           description: Initial status of the gateway
 *         location:
 *           type: string
 *           maxLength: 255
 *           description: Physical location of the gateway
 *
 *     UpdateGatewayRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: New display name for the gateway
 *         ipv4Address:
 *           type: string
 *           pattern: '^(\d{1,3}\.){3}\d{1,3}$'
 *           description: New IPv4 address for the gateway
 *         status:
 *           type: string
 *           enum: [active, inactive, decommissioned]
 *           description: New status for the gateway
 *         location:
 *           type: string
 *           maxLength: 255
 *           description: New physical location of the gateway
 *
 *     CreateDeviceRequest:
 *       type: object
 *       required:
 *         - uid
 *         - vendor
 *         - deviceTypeId
 *       properties:
 *         uid:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *           description: Globally unique device identifier
 *         vendor:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Device manufacturer/vendor name
 *         status:
 *           type: string
 *           enum: [online, offline, maintenance]
 *           default: offline
 *           description: Initial operational status
 *         deviceTypeId:
 *           type: integer
 *           minimum: 1
 *           description: Device type identifier
 *
 *     DetachDeviceRequest:
 *       type: object
 *       required:
 *         - deviceId
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID of device to detach from gateway
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           description: Response data (varies by endpoint)
 *         count:
 *           type: integer
 *           description: Number of items returned (for list endpoints)
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error type or name
 *         message:
 *           type: string
 *           description: Human-readable error message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the error occurred
 *         path:
 *           type: string
 *           description: Request path that caused the error
 */

const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

export const createGatewaySchema = z.object({
  serialNumber: z
    .string()
    .min(1, 'Serial number is required')
    .max(100, 'Serial number must be less than 100 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  ipv4Address: z.string().regex(ipv4Regex, 'Must be a valid IPv4 address'),
  status: z.enum(['active', 'inactive', 'decommissioned']).default('active'),
  location: z
    .string()
    .max(255, 'Location must be less than 255 characters')
    .optional(),
});

export const updateGatewaySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .optional(),
  ipv4Address: z
    .string()
    .regex(ipv4Regex, 'Must be a valid IPv4 address')
    .optional(),
  status: z.enum(['active', 'inactive', 'decommissioned']).optional(),
  location: z
    .string()
    .max(255, 'Location must be less than 255 characters')
    .optional(),
});

export const gatewayParamsSchema = z.object({
  id: z.string().uuid('Invalid gateway ID format'),
});

export const createDeviceSchema = z.object({
  uid: z.number().positive('Device UID must be a positive number'),
  vendor: z
    .string()
    .min(1, 'Vendor is required')
    .max(100, 'Vendor must be less than 100 characters'),
  status: z.enum(['online', 'offline', 'maintenance']).default('offline'),
  deviceTypeId: z.number().int().positive('Device type ID is required'),
});

export const deviceParamsSchema = z.object({
  id: z.string().uuid('Invalid gateway ID format'),
  deviceId: z.string().uuid('Invalid device ID format'),
});

export const deviceIdParamsSchema = z.object({
  id: z.string().uuid('Invalid device ID format'),
});

export const attachDeviceSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
});

export const detachDeviceSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID format'),
});

export type CreateGatewayRequest = z.infer<typeof createGatewaySchema>;
export type UpdateGatewayRequest = z.infer<typeof updateGatewaySchema>;
export type GatewayParams = z.infer<typeof gatewayParamsSchema>;
export type CreateDeviceRequest = z.infer<typeof createDeviceSchema>;
export type DeviceParams = z.infer<typeof deviceParamsSchema>;
export type DeviceIdParams = z.infer<typeof deviceIdParamsSchema>;
export type AttachDeviceRequest = z.infer<typeof attachDeviceSchema>;
export type DetachDeviceRequest = z.infer<typeof detachDeviceSchema>;
