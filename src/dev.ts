import { Backbone } from './backbone.ts';
process.env.JWT_SECRET = 'test';
process.env.ADMIN_TOKEN = 'admin';
process.env.API_ENABLED = 'true';

const backbone = new Backbone();
await backbone.start();

console.log('started');
