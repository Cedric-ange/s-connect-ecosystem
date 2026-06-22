import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          // 🔌 On force la connexion directe (Port 5432) qui fonctionne à 100% avec ton mot de passe
          url: 'postgresql://postgres.begprdaocbyxfbzvavwb:Salesconnected2026@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}