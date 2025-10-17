## Context

The Backbone Helm chart currently has minimal configuration support. Users cannot configure the broker through Helm values, making it difficult to deploy in production environments. The chart needs to support all configuration options from the README and follow Helm best practices for production deployments.

### Constraints

- Must maintain backward compatibility where possible
- Must align with environment variables documented in README
- Must follow Kubernetes and Helm best practices
- Storage backend (SQLite, PostgreSQL) may require persistent volumes

### Stakeholders

- Kubernetes operators deploying Backbone
- Users requiring production-grade deployments with HA, monitoring, and persistence

## Goals / Non-Goals

### Goals

- Expose all README environment variables through Helm values
- Support persistent storage for `/data` directory with configurable storage class
- Follow Helm best practices (resources, probes, security contexts, labels)
- Enable production-ready deployments with proper health checks
- Support ingress for HTTP API exposure

### Non-Goals

- StatefulSet conversion (deployment is sufficient for single-replica MQTT broker)
- Horizontal Pod Autoscaling (MQTT broker state management complexity)
- Built-in monitoring/metrics exporters (separate concern)
- Multi-replica support with Redis clustering (future enhancement)

## Decisions

### Decision: Use PVC for /data persistence

**Rationale**: The application may use SQLite or store session data in `/data`. A PVC ensures data survives pod restarts and enables backup/restore workflows.

**Alternatives considered**:

- emptyDir: Loses data on pod restart, unsuitable for production
- hostPath: Ties pod to specific node, reduces portability
- PVC (chosen): Standard Kubernetes pattern, supports storage classes, backup-friendly

**Implementation**:

- Optional PVC controlled by `persistence.enabled` flag
- Configurable storage class, size, and access mode
- Defaults to disabled for backward compatibility

### Decision: Environment variable structure in values.yaml

**Rationale**: Flatten environment variables under logical sections (config, k8s, oidc, redis) rather than deep nesting for better readability.

**Structure**:

```yaml
config:
  adminToken: ''
  jwtSecret: ''
  httpPort: 8883
  tcpPort: 1883

k8s:
  enabled: true # default true since chart runs in K8s

ws:
  enabled: false

api:
  enabled: false

tcp:
  enabled: false

oidc:
  enabled: false
  discovery: ''
  clientId: ''
  clientSecret: ''
  groupField: 'groups'
  adminGroup: ''
  writerGroup: ''
  readerGroup: ''

redis:
  enabled: false
  host: 'localhost'
  port: 6379
  password: ''
  db: 0
```

### Decision: ServiceAccount template instead of hardcoded name

**Rationale**: Current deployment references `{{ .Release.Name }}` for ServiceAccount but doesn't create it. Extract to proper template with configurable name and annotations.

**Migration**: Existing deployments referencing release name continue working.

### Decision: Default K8S_ENABLED to true in chart

**Rationale**: The Helm chart is deployed TO Kubernetes, so K8s integration should default to enabled. Users can disable if running in non-operator mode.

### Decision: Security context defaults

Apply restricted security context by default:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  readOnlyRootFilesystem: false # /data needs write access
```

**Rationale**: Follows Kubernetes security best practices. ReadOnlyRootFilesystem disabled because SQLite needs write access to `/data`.

### Decision: Probe configuration

Add both liveness and readiness probes with sensible defaults:

- Liveness: HTTP GET `/health` on port 8883 (requires API_ENABLED)
- Readiness: HTTP GET `/health` on port 8883
- Fallback: TCP socket check on ports if API disabled

**Rationale**: Enables Kubernetes to detect unhealthy pods and route traffic appropriately.

## Risks / Trade-offs

### Risk: Breaking changes for existing deployments

**Mitigation**:

- Set conservative defaults matching current behavior where possible
- Document migration path in CHANGELOG or upgrade notes
- Version bump signals breaking changes (0.1.0 → 0.2.0)

### Risk: Complex values.yaml overwhelming users

**Mitigation**:

- Provide comprehensive comments
- Include examples in comments
- Keep sensible defaults for 90% use case
- Create example values files for common scenarios

### Risk: Storage class availability varies by cluster

**Mitigation**:

- Make storage class configurable (default: `""` uses cluster default)
- Document common storage classes in values comments
- Support disabling persistence entirely

## Migration Plan

### For existing deployments:

1. Review `values.yaml` changes
2. Set `persistence.enabled: false` to maintain stateless behavior (if desired)
3. Configure environment variables previously set via manual env overrides
4. Update service types if non-default required
5. Helm upgrade with new chart version

### Rollback:

Standard Helm rollback: `helm rollback <release> <revision>`

### Validation:

```bash
# Dry-run
helm upgrade --install backbone ./charts --dry-run --debug

# Lint
helm lint ./charts

# Template verification
helm template backbone ./charts > manifests.yaml
kubectl apply --dry-run=client -f manifests.yaml
```

## Open Questions

1. **Should probes be enabled by default?**
   - Proposal: Yes, but only if `api.enabled=true`, otherwise use TCP checks
2. **Default persistence size?**
   - Proposal: 1Gi for SQLite database and session data
3. **Should we support initContainers for DB migrations?**
   - Proposal: No, out of scope for this change (future enhancement)

4. **Ingress class defaults?**
   - Proposal: Empty string, user must specify their ingress class
