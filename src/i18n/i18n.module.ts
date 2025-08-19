import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  I18nModule as NestI18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  CookieResolver,
  GraphQLWebsocketResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { I18nService } from './i18n.service';
import { TranslationService } from './translation.service';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('FALLBACK_LANGUAGE', 'en'),
        loaderOptions: {
          path:
            configService.get('NODE_ENV') === 'production'
              ? join(process.cwd(), 'dist/i18n/locales') // built files
              : join(process.cwd(), 'src/i18n/locales'), // dev source files
          watch: configService.get('NODE_ENV') !== 'production',
        },

        typesOutputPath: join(
          process.cwd(),
          'src/i18n/generated/i18n.generated.ts',
        ),
        throwOnMissingKey: configService.get('NODE_ENV') === 'development', // Throw in dev only
      }),
      resolvers: [
        new HeaderResolver(['x-lang']),
        // new CookieResolver(['lang', 'locale']), // Multiple cookie options
        AcceptLanguageResolver, // Accept-Language header (fallback)
        GraphQLWebsocketResolver, // For GraphQL subscriptions
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [I18nService, TranslationService],
  exports: [I18nService, TranslationService], // Export both for flexibility
})
export class LocalizationModule {}
