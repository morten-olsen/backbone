import { Backbone } from './backbone.ts';
process.env.JWT_SECRET = 'test';
process.env.ADMIN_TOKEN = 'admin';
process.env.API_ENABLED = 'true';
process.env.WS_ENABLED = 'true';
process.env.TCP_ENABLED = 'true';

const backbone = new Backbone();
await backbone.start();

console.log('started');
