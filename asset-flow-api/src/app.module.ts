import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AssetModule } from './modules/asset/asset.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { BuildingModule } from './modules/building/building.module';
import { CategoryModule } from './modules/category/category.module';
import { DepartmentModule } from './modules/department/department.module';
import { DivisionModule } from './modules/division/division.module';
import { FloorModule } from './modules/floor/floor.module';
import { SiteModule } from './modules/site/site.module';
import { UnitModule } from './modules/unit/unit.module';
import { UserModule } from './modules/user/user.module';
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
    BuildingModule,
    CategoryModule,
    DepartmentModule,
    DivisionModule,
    FloorModule,
    SiteModule,
    UnitModule,
    UserModule,
  ],
})
export class AppModule {}