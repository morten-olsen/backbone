import {
  KubeConfig,
  KubernetesObjectApi,
  makeInformer,
  type Informer,
  type KubernetesObject,
} from '@kubernetes/client-node';

import { EventEmitter } from '#root/utils/event-emitter.ts';

type K8sWatcherOptions = {
  config: KubeConfig;
  apiVersion: string;
  plural?: string;
  kind: string;
  selector?: string;
};

type K8sWatcherEvents<TType extends KubernetesObject> = {
  updated: (manifest: TType) => void;
  removed: (manifest: TType) => void;
};

class K8sWatcher<TType extends KubernetesObject> extends EventEmitter<K8sWatcherEvents<TType>> {
  #options: K8sWatcherOptions;
  #informer: Informer<TType>;
  #manifests: Map<string, TType>;

  constructor(options: K8sWatcherOptions) {
    super();
    this.#options = options;
    this.#manifests = new Map();
    this.#informer = this.#setupInformer();
  }

  public get manifests() {
    return Array.from(this.#manifests.values());
  }

  #setupInformer = () => {
    const { config, apiVersion, kind, plural, selector } = this.#options;
    const objectApi = config.makeApiClient(KubernetesObjectApi);
    const derivedPlural = plural ?? kind.toLowerCase() + 's';
    const [version, group] = apiVersion.split('/').toReversed();
    const path = group ? `/apis/${group}/${version}/${derivedPlural}` : `/api/${version}/${derivedPlural}`;

    const informer = makeInformer<TType>(
      config,
      path,
      async () => {
        return objectApi.list(apiVersion, kind);
      },
      selector,
    );
    informer.on('add', this.#handleResource.bind(this, 'add'));
    informer.on('update', this.#handleResource.bind(this, 'update'));
    informer.on('delete', this.#handleResource.bind(this, 'delete'));
    informer.on('error', (err) => {
      console.log('Watcher failed, will retry in 3 seconds', path, err);
      setTimeout(this.start, 3000);
    });
    return informer;
  };

  #handleResource = (action: string, manifest: TType) => {
    const uid = manifest.metadata?.uid;
    if (!uid) {
      return;
    }
    if (action === 'delete') {
      this.#manifests.delete(uid);
      return this.emit('removed', manifest);
    }
    this.#manifests.set(uid, manifest);
    this.emit('updated', manifest);
  };

  public start = () => {
    return this.#informer.start();
  };

  public stop = () => {
    return this.#informer.stop();
  };
}

export { K8sWatcher };
