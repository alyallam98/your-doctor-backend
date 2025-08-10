import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RoleSeedService } from './modules/role/role.seed';
import { PermissionSeedService } from './modules/permission/permission.seed';
import { graphqlUploadExpress } from 'graphql-upload';
// import helmet from 'helmet';
import { GraphqlValidationExceptionFilter } from './common/filters/graphql-validation-exception.filter';
import { ZoneSeedService } from './modules/zone/zones.seed';
import { SpecializationSeedService } from './modules/specialization/specializations.seed';
import 'tsconfig-paths/register';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet());

  // app.useGlobalFilters(new GraphqlValidationExceptionFilter());
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          constraints: err.constraints,
        }));
        return new BadRequestException(formattedErrors);
      },
    }),
  );
  app.use(cookieParser());
  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  );

  // const permissionSeedService = app.get(PermissionSeedService);
  // await permissionSeedService.seedDefaultPermissions();

  // const roleSeedService = app.get(RoleSeedService);
  // await roleSeedService.seedDefaultRoles();

  // const employeeSeedService = app.get(EmployeeSeedService);
  // await employeeSeedService.seedDefaultEmployees();

  // const zoneSeedService = app.get(ZoneSeedService);
  // await zoneSeedService.seedDefaultZones();
  // const zoneSeedService = app.get(SpecializationSeedService);
  // await zoneSeedService.seedDefaultSpecializations();

  await app.listen(3000);
}
bootstrap();
