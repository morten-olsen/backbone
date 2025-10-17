# helm-deployment Specification

## Purpose
TBD - created by archiving change update-helm-chart-best-practices. Update Purpose after archive.
## Requirements
### Requirement: Configuration Values Structure

The Helm chart SHALL provide a comprehensive values.yaml structure that exposes all configuration options documented in the README.

#### Scenario: All environment variables configurable

- **WHEN** a user deploys the chart
- **THEN** values.yaml MUST include sections for: config (adminToken, jwtSecret, ports), k8s (enabled), ws (enabled), api (enabled), tcp (enabled), oidc (all 8 variables), and redis (all 5 variables)

#### Scenario: Default values match README defaults

- **WHEN** a user deploys without custom values
- **THEN** environment variables MUST default to values documented in README (e.g., K8S_ENABLED=true in K8s context, HTTP_PORT=8883, TCP_PORT=1883)

### Requirement: Persistent Volume Support

The chart SHALL support optional persistent storage for the `/data` directory with configurable storage class.

#### Scenario: Enable persistence with default storage class

- **WHEN** `persistence.enabled=true` is set
- **THEN** a PersistentVolumeClaim MUST be created and mounted to `/data` in the container

#### Scenario: Custom storage class

- **WHEN** `persistence.storageClass` is specified
- **THEN** the PVC MUST request that storage class

#### Scenario: Configurable volume size

- **WHEN** `persistence.size` is specified
- **THEN** the PVC MUST request that storage size (default: 1Gi)

#### Scenario: Persistence disabled by default

- **WHEN** no persistence configuration is provided
- **THEN** no PVC MUST be created and deployment uses emptyDir or no volume

### Requirement: Resource Management

The chart SHALL support Kubernetes resource limits and requests configuration.

#### Scenario: Resource limits configurable

- **WHEN** `resources.limits.cpu` or `resources.limits.memory` are set
- **THEN** the deployment MUST include these resource limits

#### Scenario: Resource requests configurable

- **WHEN** `resources.requests.cpu` or `resources.requests.memory` are set
- **THEN** the deployment MUST include these resource requests

#### Scenario: Default resources

- **WHEN** no resources are specified
- **THEN** the deployment MUST NOT set resource constraints (Kubernetes default behavior)

### Requirement: Pod Scheduling

The chart SHALL support standard Kubernetes pod scheduling options.

#### Scenario: Node selector support

- **WHEN** `nodeSelector` values are provided
- **THEN** the deployment MUST include the node selector configuration

#### Scenario: Tolerations support

- **WHEN** `tolerations` array is provided
- **THEN** the deployment MUST include the tolerations

#### Scenario: Affinity support

- **WHEN** `affinity` configuration is provided
- **THEN** the deployment MUST include the affinity rules

### Requirement: Health Probes

The chart SHALL support configurable liveness and readiness probes.

#### Scenario: HTTP probes when API enabled

- **WHEN** `api.enabled=true` and probes are enabled
- **THEN** liveness and readiness probes MUST use HTTP GET on `/health` endpoint

#### Scenario: TCP probes as fallback

- **WHEN** `api.enabled=false` and probes are enabled
- **THEN** liveness and readiness probes MUST use TCP socket checks on configured ports

#### Scenario: Configurable probe parameters

- **WHEN** probe values (`initialDelaySeconds`, `periodSeconds`, `timeoutSeconds`) are set
- **THEN** the deployment MUST use these probe configurations

#### Scenario: Probes can be disabled

- **WHEN** `livenessProbe.enabled=false` or `readinessProbe.enabled=false`
- **THEN** the respective probe MUST be omitted from the deployment

### Requirement: Security Context

The chart SHALL support security context configuration following Kubernetes security best practices.

#### Scenario: Pod security context

- **WHEN** `podSecurityContext` values are provided
- **THEN** the deployment MUST apply these security settings at pod level

#### Scenario: Container security context

- **WHEN** `securityContext` values are provided
- **THEN** the deployment MUST apply these security settings at container level

#### Scenario: Default security settings

- **WHEN** no security context is specified
- **THEN** the deployment SHOULD use secure defaults (runAsNonRoot, non-root UID)

### Requirement: Service Configuration

The chart SHALL support configurable service types and settings for both HTTP and TCP services.

#### Scenario: HTTP service type configurable

- **WHEN** `service.http.type` is set to LoadBalancer, ClusterIP, or NodePort
- **THEN** the HTTP service MUST use that service type

#### Scenario: TCP service type configurable

- **WHEN** `service.tcp.type` is set to LoadBalancer, ClusterIP, or NodePort
- **THEN** the TCP service MUST use that service type

#### Scenario: Service annotations

- **WHEN** `service.http.annotations` or `service.tcp.annotations` are provided
- **THEN** the respective services MUST include those annotations

#### Scenario: Service ports configurable

- **WHEN** `service.http.port` or `service.tcp.port` are specified
- **THEN** the services MUST expose those external ports (targeting container ports from config)

### Requirement: ServiceAccount Management

The chart SHALL create and manage a ServiceAccount for the deployment with configurable name and annotations.

#### Scenario: ServiceAccount creation

- **WHEN** the chart is deployed
- **THEN** a ServiceAccount resource MUST be created

#### Scenario: ServiceAccount name configurable

- **WHEN** `serviceAccount.name` is specified
- **THEN** the ServiceAccount and deployment MUST use that name

#### Scenario: ServiceAccount annotations

- **WHEN** `serviceAccount.annotations` are provided
- **THEN** the ServiceAccount MUST include those annotations (useful for IRSA, Workload Identity)

### Requirement: Ingress Support

The chart SHALL support optional Ingress configuration for exposing the HTTP API.

#### Scenario: Ingress creation

- **WHEN** `ingress.enabled=true`
- **THEN** an Ingress resource MUST be created

#### Scenario: Ingress host configuration

- **WHEN** `ingress.hosts` array is provided
- **THEN** the Ingress MUST include rules for those hosts

#### Scenario: Ingress TLS

- **WHEN** `ingress.tls` configuration is provided
- **THEN** the Ingress MUST include TLS settings with specified secret names

#### Scenario: Ingress class

- **WHEN** `ingress.className` is specified
- **THEN** the Ingress MUST use that ingress class

#### Scenario: Ingress annotations

- **WHEN** `ingress.annotations` are provided
- **THEN** the Ingress MUST include those annotations (e.g., for cert-manager, nginx settings)

### Requirement: Labels and Annotations

The chart SHALL apply standard Helm and Kubernetes labels following best practices.

#### Scenario: Standard labels applied

- **WHEN** resources are created
- **THEN** they MUST include labels: `app.kubernetes.io/name`, `app.kubernetes.io/instance`, `app.kubernetes.io/version`, `app.kubernetes.io/managed-by`

#### Scenario: Custom labels support

- **WHEN** `commonLabels` are defined in values
- **THEN** all resources MUST include these additional labels

#### Scenario: Custom annotations support

- **WHEN** `commonAnnotations` are defined in values
- **THEN** all resources MUST include these additional annotations

### Requirement: Environment Variable Mapping

The chart SHALL correctly map all values.yaml configuration to container environment variables matching README documentation.

#### Scenario: Admin and JWT configuration

- **WHEN** `config.adminToken` or `config.jwtSecret` are set
- **THEN** environment variables `ADMIN_TOKEN` and `JWT_SECRET` MUST be set in the container

#### Scenario: Feature toggles

- **WHEN** `k8s.enabled`, `ws.enabled`, `api.enabled`, or `tcp.enabled` are set
- **THEN** corresponding environment variables `K8S_ENABLED`, `WS_ENABLED`, `API_ENABLED`, `TCP_ENABLED` MUST be set as string "true" or "false"

#### Scenario: Port configuration

- **WHEN** `config.httpPort` or `config.tcpPort` are set
- **THEN** environment variables `HTTP_PORT` and `TCP_PORT` MUST be set

#### Scenario: OIDC configuration

- **WHEN** OIDC values (`oidc.enabled`, `oidc.discovery`, etc.) are provided
- **THEN** all 8 OIDC environment variables MUST be set correctly

#### Scenario: Redis configuration

- **WHEN** Redis values (`redis.enabled`, `redis.host`, etc.) are provided
- **THEN** all 5 Redis environment variables MUST be set correctly

#### Scenario: Sensitive values from secrets

- **WHEN** `config.jwtSecret`, `config.adminToken`, `oidc.clientSecret`, or `redis.password` reference existing secrets
- **THEN** the deployment MUST use valueFrom/secretKeyRef to inject these values

### Requirement: Template Syntax Correctness

The chart templates SHALL use correct Helm template syntax without errors.

#### Scenario: Valid Go template syntax

- **WHEN** templates are rendered with `helm template`
- **THEN** no syntax errors MUST occur

#### Scenario: No spacing in template delimiters

- **WHEN** examining template files
- **THEN** template expressions MUST use `{{` and `}}` without internal spaces (e.g., `{{ .Value }}` not `{ { .Value } }`)

### Requirement: Chart Validation

The chart SHALL pass Helm linting and validation checks.

#### Scenario: Helm lint passes

- **WHEN** `helm lint` is run on the chart
- **THEN** no errors MUST be reported

#### Scenario: Chart renders successfully

- **WHEN** `helm template` is run with default values
- **THEN** valid Kubernetes manifests MUST be produced

#### Scenario: Chart renders with custom values

- **WHEN** `helm template` is run with various custom values combinations
- **THEN** valid Kubernetes manifests MUST be produced without errors

