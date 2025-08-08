import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService as NestI18nService } from 'nestjs-i18n';
import { I18nPath } from './generated/i18n.generated';

export interface TranslationOptions {
  lang?: string;
  args?: any;
  defaultValue?: string;
}

@Injectable()
export class I18nService {
  constructor(private readonly nestI18nService: NestI18nService) {}

  /**
   * Get translation with automatic language detection
   */
  translate(key: I18nPath, options?: TranslationOptions): string {
    const lang = options?.lang || this.getCurrentLanguage();

    return this.nestI18nService.t(key, {
      lang,
      args: options?.args,
      defaultValue: options?.defaultValue,
    });
  }

  /**
   * Async translation (useful for GraphQL resolvers)
   */
  async translateAsync(
    key: string,
    options?: TranslationOptions,
  ): Promise<string> {
    const lang = options?.lang || this.getCurrentLanguage();

    return this.nestI18nService.t(key, {
      lang,
      args: options?.args,
      defaultValue: options?.defaultValue,
    });
  }

  /**
   * Get current language from context
   */
  getCurrentLanguage(): string {
    return I18nContext.current()?.lang || 'en';
  }

  /**
   * Get multiple translations at once
   */
  translateMultiple(
    keys: string[],
    options?: Omit<TranslationOptions, 'args'>,
  ): Record<string, string> {
    const lang = options?.lang || this.getCurrentLanguage();
    const translations: Record<string, string> = {};

    keys.forEach((key) => {
      translations[key] = this.nestI18nService.t(key, {
        lang,
        defaultValue: options?.defaultValue || `Missing: ${key}`,
      });
    });

    return translations;
  }

  /**
   * Check if translation exists
   */
  hasTranslation(key: string, lang?: string): boolean {
    const targetLang = lang || this.getCurrentLanguage();

    try {
      const translation = this.nestI18nService.t(key, { lang: targetLang });
      return translation !== key; // If key is returned, translation doesn't exist
    } catch {
      return false;
    }
  }

  /**
   * Get all available languages (this would need to be configured based on your setup)
   */
  getAvailableLanguages(): string[] {
    // You might want to get this from configuration or file system
    return ['en', 'es', 'fr', 'de']; // Example languages
  }

  /**
   * Validate language code
   */
  isValidLanguage(lang: string): boolean {
    return this.getAvailableLanguages().includes(lang);
  }

  /**
   * Get validation messages
   */
  getValidationMessage(field: string, rule: string, lang?: string): string {
    const key = `validation.${field}.${rule}`;
    const fallbackKey = `validation.${rule}`;

    const targetLang = lang || this.getCurrentLanguage();

    // Try specific field validation message first
    let message = this.nestI18nService.t(key, {
      lang: targetLang,
      defaultValue: null,
    });

    // Fall back to general validation message
    if (!message || message === key) {
      message = this.nestI18nService.t(fallbackKey, {
        lang: targetLang,
        defaultValue: `Validation failed for ${field}`,
      });
    }

    return message as string;
  }

  /**
   * Format message with parameters
   */
  formatMessage(
    key: I18nPath,
    params: Record<string, any>,
    lang?: string,
  ): string {
    return this.translate(key, {
      lang,
      args: params,
    });
  }

  /**
   * Get localized date format
   */
  getLocalizedDate(date: Date, lang?: string): string {
    const targetLang = lang || this.getCurrentLanguage();

    return new Intl.DateTimeFormat(targetLang).format(date);
  }

  /**
   * Get localized number format
   */
  getLocalizedNumber(number: number, lang?: string): string {
    const targetLang = lang || this.getCurrentLanguage();

    return new Intl.NumberFormat(targetLang).format(number);
  }

  /**
   * Get localized currency format
   */
  getLocalizedCurrency(
    amount: number,
    currency: string = 'USD',
    lang?: string,
  ): string {
    const targetLang = lang || this.getCurrentLanguage();

    return new Intl.NumberFormat(targetLang, {
      style: 'currency',
      currency,
    }).format(amount);
  }
}
