import { AccessHandler } from './access/access.handler.ts';
import { K8sService } from './k8s/k8s.ts';
import { MqttServer } from './server/server.ts';
import { TopicsHandler } from './topics/topics.handler.ts';

const accessHandler = new AccessHandler();
const topicsHandler = new TopicsHandler();

const k8s = new K8sService();
await k8s.setup();
accessHandler.register('k8s', k8s.clients);
const server = new MqttServer({
  accessHandler,
  topicsHandler,
});
const tcp = server.getTcpServer();
tcp.listen(1883);
const http = await server.getHttpServer();
http.listen({ port: 8883 });

console.log('started');
