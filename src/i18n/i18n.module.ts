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
          path: join(__dirname, './locales/'), // Adjust path as needed
          watch: true, // Enable live reloading in development
        },
        typesOutputPath: join(
          process.cwd(),
          'src/i18n/generated/i18n.generated.ts',
        ),
        throwOnMissingKey: process.env.NODE_ENV === 'development', // Throw in dev only
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
