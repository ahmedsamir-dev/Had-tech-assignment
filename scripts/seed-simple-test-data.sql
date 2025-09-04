-- Simple test data with integer UIDs to avoid BigInt serialization issues
-- This script creates a smaller set of realistic test data

BEGIN;

-- Clear existing test data (if any)
DELETE FROM gateway_logs;
DELETE FROM peripheral_devices;
DELETE FROM gateways;

-- Insert test gateways
INSERT INTO gateways (id, serial_number, name, ipv4_address, status, location, created_at, updated_at) VALUES
  (gen_random_uuid(), 'GW-001', 'Main Building Gateway', '192.168.1.10', 'active', 'Building A - Floor 1', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'GW-002', 'Warehouse Gateway', '192.168.1.11', 'active', 'Warehouse - Section B', NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 'GW-003', 'Parking Lot Gateway', '192.168.1.12', 'inactive', 'Parking Lot - North', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'GW-004', 'Laboratory Gateway', '192.168.1.13', 'active', 'Research Lab - Room 301', NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 hours');

-- Get gateway IDs for device assignment
DO $$
DECLARE
    gw1_id UUID;
    gw2_id UUID;
    gw3_id UUID;
    gw4_id UUID;
BEGIN
    -- Get gateway IDs
    SELECT id INTO gw1_id FROM gateways WHERE serial_number = 'GW-001';
    SELECT id INTO gw2_id FROM gateways WHERE serial_number = 'GW-002';
    SELECT id INTO gw3_id FROM gateways WHERE serial_number = 'GW-003';
    SELECT id INTO gw4_id FROM gateways WHERE serial_number = 'GW-004';

    -- Insert peripheral devices for Gateway 1 - 5 devices
    INSERT INTO peripheral_devices (id, uid, vendor, status, gateway_id, device_type_id, created_at, last_seen_at) VALUES
        (gen_random_uuid(), 1001, 'Honeywell', 'online', gw1_id, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 minutes'),
        (gen_random_uuid(), 1002, 'Siemens', 'online', gw1_id, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 minutes'),
        (gen_random_uuid(), 1003, 'Schneider Electric', 'online', gw1_id, 2, NOW() - INTERVAL '29 days', NOW() - INTERVAL '1 minute'),
        (gen_random_uuid(), 1004, 'ABB', 'offline', gw1_id, 2, NOW() - INTERVAL '28 days', NOW() - INTERVAL '2 hours'),
        (gen_random_uuid(), 1005, 'Johnson Controls', 'online', gw1_id, 3, NOW() - INTERVAL '27 days', NOW() - INTERVAL '10 minutes');

    -- Insert peripheral devices for Gateway 2 - 3 devices
    INSERT INTO peripheral_devices (id, uid, vendor, status, gateway_id, device_type_id, created_at, last_seen_at) VALUES
        (gen_random_uuid(), 2001, 'Omron', 'online', gw2_id, 1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '15 minutes'),
        (gen_random_uuid(), 2002, 'Keyence', 'online', gw2_id, 1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '8 minutes'),
        (gen_random_uuid(), 2003, 'Pepperl+Fuchs', 'maintenance', gw2_id, 2, NOW() - INTERVAL '24 days', NOW() - INTERVAL '12 hours');

    -- Insert peripheral devices for Gateway 3 (inactive gateway) - 2 devices
    INSERT INTO peripheral_devices (id, uid, vendor, status, gateway_id, device_type_id, created_at, last_seen_at) VALUES
        (gen_random_uuid(), 3001, 'Bosch', 'offline', gw3_id, 1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
        (gen_random_uuid(), 3002, 'Axis', 'offline', gw3_id, 4, NOW() - INTERVAL '19 days', NOW() - INTERVAL '5 days');

    -- Insert peripheral devices for Gateway 4 - 4 devices
    INSERT INTO peripheral_devices (id, uid, vendor, status, gateway_id, device_type_id, created_at, last_seen_at) VALUES
        (gen_random_uuid(), 4001, 'Agilent', 'online', gw4_id, 1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '30 seconds'),
        (gen_random_uuid(), 4002, 'Thermo Fisher', 'online', gw4_id, 1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '45 seconds'),
        (gen_random_uuid(), 4003, 'Waters', 'online', gw4_id, 2, NOW() - INTERVAL '14 days', NOW() - INTERVAL '1 minute'),
        (gen_random_uuid(), 4004, 'PerkinElmer', 'maintenance', gw4_id, 3, NOW() - INTERVAL '14 days', NOW() - INTERVAL '6 hours');

    -- Insert some orphaned devices (no gateway assigned)
    INSERT INTO peripheral_devices (id, uid, vendor, status, gateway_id, device_type_id, created_at, last_seen_at) VALUES
        (gen_random_uuid(), 9001, 'Generic Sensors Inc', 'offline', NULL, 1, NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days'),
        (gen_random_uuid(), 9002, 'Old Tech Corp', 'offline', NULL, 2, NOW() - INTERVAL '90 days', NOW() - INTERVAL '45 days');

END $$;

-- Insert gateway logs
DO $$
DECLARE
    gw_rec RECORD;
BEGIN
    -- Create gateway creation logs
    FOR gw_rec IN SELECT id, serial_number, created_at FROM gateways LOOP
        INSERT INTO gateway_logs (gateway_id, action, details, created_at) VALUES
            (gw_rec.id, 'CREATED', 
             jsonb_build_object(
                 'serial_number', gw_rec.serial_number,
                 'action', 'Gateway created and configured',
                 'user', 'system'
             ), 
             gw_rec.created_at);
    END LOOP;
END $$;

COMMIT;

-- Display summary
SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM gateways) as total_gateways,
    (SELECT COUNT(*) FROM peripheral_devices) as total_devices,
    (SELECT COUNT(*) FROM gateway_logs) as total_logs;
