import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueProcessors } from './queue.processor';

const ENABLE_QUEUES = process.env.ENABLE_QUEUES === 'true';

@Module({
  imports: ENABLE_QUEUES ? [
    BullModule.registerQueue({
      name: 'email',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'), // Corrigé
      },
    }),
    BullModule.registerQueue({
      name: 'analytics',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'), // Corrigé
      },
    }),
    BullModule.registerQueue({
      name: 'data-pipeline',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'), // Corrigé
      },
    }),
    BullModule.registerQueue({
      name: 'ml-predictions',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'), // Corrigé
      },
    }),
  ] : [],
  controllers: [QueueController],
  providers: [QueueService, ...(ENABLE_QUEUES ? QueueProcessors : [])],
  exports: [QueueService],
})
export class QueueModule {}