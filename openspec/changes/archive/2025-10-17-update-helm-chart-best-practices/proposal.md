## Why

The current Helm chart lacks configuration flexibility and best practices support. It does not expose the environment variables documented in the README, missing PersistentVolume support for data persistence, and lacks standard Helm values patterns (resources, nodeSelector, tolerations, etc.).

## What Changes

- Add comprehensive values structure for all configuration options documented in README
- Add PersistentVolumeClaim configuration with configurable storage class for `/data` mount
- Add standard Helm best practices: resource limits/requests, node selectors, tolerations, affinity, security contexts
- Add proper labels and annotations following Helm conventions
- Add liveness and readiness probes for container health checks
- Add ServiceAccount template (currently hardcoded in deployment)
- Make service types and configurations customizable
- Add ingress support for HTTP API endpoint

## Impact

- Affected specs: `helm-deployment` (new capability)
- Affected code:
  - `charts/values.yaml` - Complete restructure with backward compatibility
  - `charts/templates/deployment.yaml` - Add volume mounts, env vars, probes, security
  - `charts/templates/services.yaml` - Make service types configurable
  - `charts/templates/*.yaml` - Add missing templates (serviceaccount, pvc, ingress)
  - `charts/Chart.yaml` - Version bump to reflect changes
