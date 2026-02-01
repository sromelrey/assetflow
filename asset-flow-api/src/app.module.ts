import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AssetModule } from './modules/asset/asset.module';
import { EmployeeModule } from './modules/employee/employee.module';
@Module({
  imports: [
    // Global config module
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // Set to false in production
        ssl: false,
      }),
    }),
    
    // Feature modules
    AuthModule,
    AssetModule,
    EmployeeModule,
  ],
})
export class AppModule {}