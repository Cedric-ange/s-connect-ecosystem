import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DynamicFormsController } from './dynamic-forms.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController, DynamicFormsController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}