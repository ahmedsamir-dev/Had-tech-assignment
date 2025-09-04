-- Device Types seed data
INSERT INTO device_types (name, description) VALUES
('sensor', 'Environmental and monitoring sensors'),
('actuator', 'Control and automation actuators'),
('controller', 'Logic and processing controllers'),
('display', 'Information display devices'),
('communication', 'Network and communication modules')
ON CONFLICT (name) DO NOTHING;
