import { Backbone } from './backbone.ts';

const backbone = new Backbone();
await backbone.setupK8sOperator();

const tcp = backbone.server.getTcpServer();
tcp.listen(1883);
const http = await backbone.server.getHttpServer();
http.listen({ port: 8883 });

console.log('started');
