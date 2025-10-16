import { AdminAuth } from './auth/auth.admin.ts';
import { JwtAuth } from './auth/auth.jwt.ts';
import { K8sAuth } from './auth/auth.k8s.ts';
import { OidcAuth } from './auth/auth.oidc.ts';
import { Config } from './config/config.ts';
import { MqttServer } from './server/server.ts';
import { K8sService } from './services/k8s/k8s.ts';
import { SessionProvider } from './services/sessions/sessions.provider.ts';
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

  public get sessionProvider() {
    return this.#services.get(SessionProvider);
  }

  public get topicsHandler() {
    return this.#services.get(TopicsHandler);
  }

  public get k8s() {
    return this.#services.get(K8sService);
  }

  public start = async () => {
    if (this.config.k8s.enabled) {
      await this.k8s.setup();
      this.sessionProvider.register('k8s', this.#services.get(K8sAuth));
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
    if (this.config.oidc.enabled) {
      this.sessionProvider.register('oidc', this.#services.get(OidcAuth));
    }
    if (this.config.jwtSecret) {
      this.sessionProvider.register('jwt', this.#services.get(JwtAuth));
    }
    if (this.config.adminToken) {
      this.sessionProvider.register('admin', this.#services.get(AdminAuth));
    }
  };

  public destroy = async () => {
    await this.services.destroy();
  };
}

export { Backbone };
