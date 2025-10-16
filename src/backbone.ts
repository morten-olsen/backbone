import { AccessHandler } from './access/access.handler.ts';
import { Config } from './config/config.ts';
import { K8sService } from './k8s/k8s.ts';
import { MqttServer } from './server/server.ts';
import { TopicsHandler } from './topics/topics.handler.ts';
import { Services } from './utils/services.ts';

class Backbone {
  #services: Services;

  constructor(services = new Services()) {
    this.#services = services;
  }

  public get services() {
    return this.#services;
  }

  public get config() {
    return this.services.get(Config);
  }

  public get server() {
    return this.#services.get(MqttServer);
  }

  public get accessHandler() {
    return this.#services.get(AccessHandler);
  }

  public get topicsHandler() {
    return this.#services.get(TopicsHandler);
  }

  public get k8s() {
    return this.#services.get(K8sService);
  }

  public start = async () => {
    if (this.config.k8s.enabled) {
      await this.setupK8sOperator();
    }
    if (this.config.http.enabled) {
      console.log('starting http');
      const http = await this.server.getHttpServer();
      http.listen({ port: this.config.http.port, host: '0.0.0.0' });
    }
    if (this.config.tcp) {
      const tcp = this.server.getTcpServer();
      tcp.listen(this.config.tcp.port);
    }
  };

  public setupK8sOperator = async () => {
    await this.k8s.setup();
    this.accessHandler.register('k8s', this.k8s.clients);
  };

  public destroy = async () => {
    await this.services.destroy();
  };
}

export { Backbone };
