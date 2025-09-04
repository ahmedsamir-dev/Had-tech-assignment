# Gateway Management API - HTTP Tests

This directory contains HTTP files for testing the Gateway Management API directly in VS Code using the **REST Client** extension.

## 🚀 Quick Start

### Prerequisites

1. **REST Client Extension**: Already installed ✅
2. **API Server Running**: Make sure your server is running on `localhost:3000`

### Running Tests

1. **Open any `.http` file** in VS Code
2. **Click "Send Request"** above any HTTP request
3. **View responses** in the right panel
4. **Use variables** from previous responses in subsequent requests

## 📁 Test Files

### 1. `01-health-check.http`

- **Purpose**: Basic API connectivity test
- **Endpoints**: `GET /api/health`
- **Use**: Start here to verify your API is running

### 2. `02-gateways.http`

- **Purpose**: Complete gateway CRUD operations
- **Endpoints**:
  - `POST /api/v1/gateways` - Create gateway
  - `GET /api/v1/gateways` - List all gateways
  - `GET /api/v1/gateways/:id` - Get specific gateway
  - `PUT /api/v1/gateways/:id` - Update gateway
  - `DELETE /api/v1/gateways/:id` - Delete gateway
- **Includes**: Error scenarios (duplicate serial, invalid IP, not found)

### 3. `03-devices.http`

- **Purpose**: Device management and gateway attachment
- **Endpoints**:
  - `POST /api/v1/devices` - Create orphaned device
  - `POST /api/v1/gateways/:id/devices` - Create and attach device
  - `GET /api/v1/devices` - List all devices
  - `GET /api/v1/devices/:id` - Get specific device
  - `PUT /api/v1/devices/:id` - Update device
  - `DELETE /api/v1/gateways/:id/devices` - Detach device
  - `DELETE /api/v1/devices/:id` - Delete device
- **Includes**: Error scenarios (duplicate UID, device limits)

### 4. `04-complete-workflow.http`

- **Purpose**: End-to-end testing with variable chaining
- **Features**:
  - Automatic variable extraction from responses
  - Complete gateway and device lifecycle
  - Demonstrates orphaned device handling
- **Advanced**: Uses `@name` and response variables

### 5. `05-pagination-tests.http`

- **Purpose**: Comprehensive pagination testing for all findAll endpoints
- **Features**:
  - Default pagination behavior (page=1, limit=10)
  - Custom page and limit parameters
  - Boundary testing (max/min values, invalid params)
  - Pagination metadata validation
  - Performance testing with large datasets
- **Tests**: Gateway and device pagination scenarios

## 🎯 How to Use

### Basic Usage

1. **Start your API server**:

   ```bash
   pnpm dev
   ```

2. **Open `01-health-check.http`**

3. **Click "Send Request"** above the GET request

4. **Verify** you get a 200 OK response

### Working with Variables

**Method 1: Manual ID Replacement**

1. Run a CREATE request
2. Copy the ID from the response
3. Replace `REPLACE-WITH-GATEWAY-ID` in subsequent requests

**Method 2: Automatic Variables (Workflow File)**

- Use `04-complete-workflow.http` for automatic variable chaining
- Named requests like `# @name createGateway` create variables
- Reference with `{{createGateway.response.body.data.id}}`

### Environment Variables

All files use these variables:

```http
@baseUrl = http://localhost:3000
@apiVersion = v1
@contentType = application/json
```

**To change environment**:

- Update `@baseUrl` for different servers
- Modify `@apiVersion` if API version changes

## 🧪 Test Scenarios

### Happy Path Testing

1. **Health Check** → Verify API is running
2. **Create Gateway** → POST with valid data
3. **Create Devices** → Attach to gateway
4. **Read Operations** → GET gateways and devices
5. **Update Operations** → PATCH gateway and device properties
6. **Cleanup** → DELETE test data

### Error Testing

1. **Validation Errors**:
   - Invalid IPv4 address format
   - Missing required fields
   - Invalid data types

2. **Business Rule Violations**:
   - Duplicate serial numbers
   - Duplicate device UIDs
   - Device limit exceeded (>10 per gateway)

3. **Not Found Scenarios**:
   - Non-existent gateway IDs
   - Non-existent device IDs

### Edge Cases

1. **Orphaned Device Management**:
   - Create devices without gateways
   - Detach devices from gateways
   - Delete gateways with attached devices

2. **Device Limits**:
   - Test exactly 10 devices per gateway
   - Verify 11th device is rejected

## 🔧 REST Client Features

### Request Execution

- **Send Request**: Click above any HTTP request
- **Send All Requests**: Execute multiple requests in sequence
- **Cancel Request**: Stop long-running requests

### Response Viewing

- **Formatted JSON**: Automatic JSON formatting
- **Headers**: View response headers
- **Timing**: Request duration
- **Status**: HTTP status codes with colors

### Variable Support

- **Environment Variables**: `@variable = value`
- **Dynamic Variables**: `{{$randomInt}}`, `{{$randomUUID}}`
- **Response Variables**: `{{requestName.response.body.field}}`
- **System Variables**: `{{$timestamp}}`, `{{$datetime}}`

### Advanced Features

- **Code Generation**: Generate code snippets for different languages
- **History**: View previous requests and responses
- **Environments**: Switch between dev/staging/prod
- **Authentication**: Support for various auth methods

## 🎨 VS Code Integration

### Syntax Highlighting

- HTTP syntax highlighting
- JSON response formatting
- Variable highlighting

### IntelliSense

- Auto-completion for headers
- Method suggestions
- Variable suggestions

### Extensions Integration

- Works with Thunder Client
- Compatible with other HTTP extensions
- Integrated with VS Code settings

## 🚀 Advanced Usage

### Custom Variables

```http
@gatewayId = 12345678-1234-1234-1234-123456789012
@deviceUid = 1001
```

### Pre-request Scripts (Comments)

```http
### Setup: Create test data
POST {{baseUrl}}/api/v1/gateways
# This creates a gateway for subsequent tests
```

### Conditional Requests

```http
### Only run if gateway exists
GET {{baseUrl}}/api/v1/gateways/{{gatewayId}}
```

### File Organization

- One HTTP verb per section (`###`)
- Logical grouping by resource
- Clear comments and expected responses

## 🔍 Debugging Tips

### Common Issues

1. **Server not running**: Check `pnpm dev` is active
2. **Wrong port**: Verify `@baseUrl` matches your server
3. **CORS errors**: Check server CORS configuration
4. **Authentication**: Add auth headers if required

### Response Debugging

- Check HTTP status codes
- Verify response structure
- Look for error messages in response body
- Check response headers

### Variable Debugging

- Use simple requests to test variables
- Check variable scope and naming
- Verify JSON path in response variables

## 📊 Business Rules Testing

The HTTP files test all business rules:

### Gateway Rules

- ✅ Unique serial numbers
- ✅ Immutable serial numbers after creation
- ✅ Valid IPv4 format and uniqueness
- ✅ Status transitions (active/inactive/decommissioned)

### Device Rules

- ✅ Globally unique device UIDs
- ✅ Maximum 10 devices per gateway
- ✅ Orphaned device support
- ✅ Device type associations

### API Rules

- ✅ Proper HTTP status codes
- ✅ Consistent response format
- ✅ Error message standards
- ✅ Resource relationships

---

**Happy Testing!** 🎉

This REST Client setup provides a powerful, integrated testing experience directly in VS Code without needing external tools like Postman.
