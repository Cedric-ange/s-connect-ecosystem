import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

// Middleware et modules Multi-Tenant
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ProductsModule } from './products/products.module';

// Modules de base existants
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TerritoriesModule } from './territories/territories.module';
import { OutletsModule } from './outlets/outlets.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { VisitsModule } from './visits/visits.module';

// Modules ML avancés existants
import { QueueModule } from './queue/queue.module';
import { OrderIntelligenceModule } from './order-intelligence/order-intelligence.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProductsModule, // 📦 Ajout du catalogue produits multi-tenant
    AuthModule,
    UsersModule,
    TerritoriesModule,
    OutletsModule,
    CloudinaryModule,
    VisitsModule,
    QueueModule,
    OrderIntelligenceModule,
    AnalyticsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 🛡️ Le filtre multi-tenant intercepte désormais TOUTES les requêtes de l'application
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}