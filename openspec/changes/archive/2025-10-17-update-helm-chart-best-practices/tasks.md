## 1. Update Values Schema

- [x] 1.1 Restructure `values.yaml` with comprehensive configuration sections
- [x] 1.2 Add all environment variable mappings from README
- [x] 1.3 Add persistence configuration with storage class options
- [x] 1.4 Add standard Helm values (resources, nodeSelector, tolerations, affinity)
- [x] 1.5 Add probe configurations (liveness, readiness)
- [x] 1.6 Add service configuration options
- [x] 1.7 Add ingress configuration

## 2. Update Deployment Template

- [x] 2.1 Add all environment variables from values
- [x] 2.2 Add PVC volume mount to `/data`
- [x] 2.3 Add resource limits and requests
- [x] 2.4 Add node selector, tolerations, and affinity
- [x] 2.5 Add security context configurations
- [x] 2.6 Add liveness and readiness probes
- [x] 2.7 Add proper labels and annotations
- [x] 2.8 Fix template syntax issues (remove spaces in braces)

## 3. Create Missing Templates

- [x] 3.1 Create `serviceaccount.yaml` template
- [x] 3.2 Create `persistentvolumeclaim.yaml` template
- [x] 3.3 Create `ingress.yaml` template (optional, controlled by values)
- [x] 3.4 Update `clusterrolebinding.yaml` to reference ServiceAccount template

## 4. Update Service Templates

- [x] 4.1 Make HTTP service type configurable (ClusterIP/LoadBalancer/NodePort)
- [x] 4.2 Make TCP service type configurable
- [x] 4.3 Add service annotations support
- [x] 4.4 Add proper labels following Helm conventions

## 5. Documentation and Validation

- [x] 5.1 Update `Chart.yaml` version (bump to 0.2.0)
- [x] 5.2 Add comments to `values.yaml` explaining options
- [x] 5.3 Test chart rendering with `helm template`
- [x] 5.4 Validate against Helm best practices using `helm lint`
