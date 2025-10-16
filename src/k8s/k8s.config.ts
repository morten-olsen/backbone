import { KubeConfig } from '@kubernetes/client-node';

class K8sConfig {
  #config?: KubeConfig;

  public get config() {
    if (!this.#config) {
      this.#config = new KubeConfig();
      this.#config.loadFromDefault();
    }
    return this.#config;
  }
}

export { K8sConfig };
