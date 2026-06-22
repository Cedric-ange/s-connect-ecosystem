import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

export async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    
    // 🌐 MIDDLEWARE CORS MANUEL POUR VERCEL SERVERLESS
    const serverInstance = app.getHttpAdapter().getInstance();
    serverInstance.use((req: any, res: any, next: any) => {
      res.setHeader('Access-Control-Allow-Origin', 'https://salesconnected-frontend.vercel.app');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Réponse immédiate 200 OK aux requêtes de preflight (OPTIONS)
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async (req: unknown, res: unknown) => {
  const server = await bootstrapServer();
  return server(req, res);
};