# Backbone

A Kubernetes-native MQTT broker with fine-grained access control and topic validation.

## Features

- **MQTT 3.1.1/5.0 Broker** - Full-featured MQTT broker powered by Aedes
- **Kubernetes Integration** - Custom Resource Definitions (Client, Topic) for declarative configuration
- **JWT-based Authentication** - Pluggable authentication providers with JWT token support
- **Statement-based Authorization** - AWS IAM-style policy statements for fine-grained access control
- **Multiple Transport Protocols** - WebSocket and TCP support for flexible client connections
- **HTTP API** - RESTful API for broker management and monitoring
- **Topic Validation** - Configurable rules for topic structure and content validation

## Quick Start

### Using Docker Compose

1. Clone the repository and start the broker:

```bash
git clone <repository-url>
cd backbone
docker-compose up -d
```

2. The broker will be available on:
   - **TCP MQTT**: `tcp://localhost:1883`
   - **WebSocket MQTT**: `ws://localhost:8883/ws`
   - **HTTP API**: `http://localhost:8883/api`

3. Connect with an MQTT client:

> [!IMPORTANT]
> Connecting requires credentials - documentation is still **TODO**

```bash
# Using mosquitto_pub
mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "Hello, Backbone!"

# Using mqtt.js (Node.js)
import mqtt from 'mqtt'
const client = mqtt.connect('ws://localhost:8883/ws')
```

## Configuration

Backbone can be configured using environment variables:

| Variable             | Description                              | Default     |
| -------------------- | ---------------------------------------- | ----------- |
| `ADMIN_TOKEN`        | Admin token for API requests             | `undefined` |
| `JWT_SECRET`         | JWT signing secret for authentication    | `undefined` |
| `K8S_ENABLED`        | Enable Kubernetes operator mode          | `false`     |
| `WS_ENABLED`         | Enable WebSocket MQTT server             | `false`     |
| `API_ENABLED`        | Enable HTTP API                          | `false`     |
| `HTTP_PORT`          | HTTP server port                         | `8883`      |
| `TCP_ENABLED`        | Enable TCP MQTT server                   | `false`     |
| `TCP_PORT`           | TCP server port                          | `1883`      |
| `OIDC_ENABLED`       | OIDC discovery URL                       | `false`     |
| `OIDC_DISCOVERY`     | OIDC discovery URL                       | `undefined` |
| `OIDC_CLIENT_ID`     | OIDC client ID                           | `undefined` |
| `OIDC_CLIENT_SECRET` | OIDC client secret                       | `undefined` |
| `OIDC_CLIENT_SECRET` | OIDC client secret                       | `undefined` |
| `OIDC_GROUP_FIELD`   | JWT field for reading groups             | `groups`    |
| `OIDC_ADMIN_GROUP`   | JWT group for admins                     | `undefined` |
| `OIDC_WRITER_GROUP`  | JWT group with publish access to queue   | `undefined` |
| `OIDC_READER_GROUP`  | JWT group with read-only access to queue | `undefined` |

### Example Configuration

```bash
# Basic configuration
export TOKEN_SECRET="your-secret-key"
export HTTP_ENABLED="true"
export TCP_ENABLED="true"

# Kubernetes mode
export K8S_ENABLED="true"
```

## Kubernetes Integration

Backbone provides Kubernetes Custom Resource Definitions for declarative configuration:

### Client Resource

Define MQTT client access policies using the `Client` CRD:

```yaml
apiVersion: 'backbone.mortenolsen.pro/v1'
kind: Client
metadata:
  name: sensor-client
  namespace: production
spec:
  statements:
    - effect: allow
      resources: ['sensors/**/data']
      actions: ['mqtt:publish']
    - effect: allow
      resources: ['sensors/**/commands']
      actions: ['mqtt:subscribe']
```

### Topic Resource

Configure topic validation rules:

```yaml
apiVersion: 'backbone.mortenolsen.pro/v1'
kind: Topic
metadata:
  name: sensor-topics
  namespace: production
spec:
  patterns:
    - pattern: 'sensors/**/data'
      maxMessageSize: 1024
      allowedQoS: [0, 1]
```

The Kubernetes operator automatically watches these resources and applies the access policies and validation rules to the MQTT broker.

## Authentication & Authorization

### Authorization Statements

Access control is defined using statement-based policies similar to AWS IAM:

```yaml
statements:
  - effect: allow # or "deny"
    resources: ['*'] # MQTT topic patterns
    actions: ['*'] # MQTT actions
```

#### MQTT Actions

- `mqtt:publish` - Permission to publish messages to topics
- `mqtt:subscribe` - Permission to subscribe to topics
- `mqtt:read` - Permission to receive messages from topics

#### Resource Patterns

- `*` - All topics
- `sensors/*` - All topics under sensors/
- `sensors/+/data` - Topics matching the pattern (single-level wildcard)
- `sensors/#` - All topics under sensors/ (multi-level wildcard)

## API

### Endpoints

- **WebSocket MQTT**: `ws://host:8883/ws`
- **TCP MQTT**: `tcp://host:1883`
- **HTTP API**: `http://host:8883/api/*`

### HTTP API

The HTTP API provides management endpoints for:

- Client management
- Topic configuration
- Broker statistics
- Health checks

## Development

### Prerequisites

- Node.js 23 or higher
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
src/
├── access/          # Authentication and authorization
├── api/             # HTTP API endpoints
├── config/          # Configuration management
├── k8s/             # Kubernetes operator and CRDs
├── server/          # MQTT broker implementation
├── topics/          # Topic validation rules
└── utils/           # Shared utilities and services
```

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

## Author

Created by [@morten-olsen](https://github.com/morten-olsen)
