import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [
    PrismaModule,
    RoutesModule,
  ],
})
export class AppModule { }
