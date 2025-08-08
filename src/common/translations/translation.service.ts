import { Injectable } from '@nestjs/common';

export interface TranslatableField {
  [key: string]: string; // e.g. { en: "Category", ar: "فئة" }
}

export interface TranslatableObject {
  [key: string]: TranslatableField | any;
}

export interface PrepareTranslatableFieldsOptions {
  input: any;
  currentLanguage: string;
  existingData?: any;
  translatableKeys?: Set<string>;
  ensureAllLanguages?: boolean;
}

export interface FlattenTranslationsOptions {
  obj: any;
  language: string;
  fallbackLanguage?: string;
  translatableKeys?: Set<string>;
}

export interface BuildCompleteLangFieldOptions {
  value: string;
  currentLanguage: string;
  fallbackValue?: string;
  supportedLanguages?: string[];
}

/**
 * Utility service for managing multi-language (i18n) translatable fields in entities.
 * Supports dynamic translation flattening and preparing backend-compatible structures.
 */
@Injectable()
export class TranslationService {
  private static readonly DEFAULT_FALLBACK_LANGUAGE = 'en';

  /**
   * Default translatable keys used across most modules.
   * Override by passing custom keys to the static methods if needed per module.
   */
  private static readonly DEFAULT_TRANSLATABLE_KEYS = new Set([
    'name',
    'description',
  ]);

  /**
   * Get the list of default translatable keys.
   */
  static getTranslatableKeys(): string[] {
    return Array.from(this.DEFAULT_TRANSLATABLE_KEYS);
  }

  /**
   * Check if a key is translatable.
   * @param key The field name to check
   * @param keys Optional override for translatable keys (used per module)
   */
  static isTranslatableKey(
    key: string,
    keys: Set<string> = this.DEFAULT_TRANSLATABLE_KEYS,
  ): boolean {
    return keys.has(key);
  }

  /**
   * Get a list of available language codes for a translatable field.
   *
   * @param translatableField e.g. { en: "Hello", ar: "مرحبا" }
   */
  static getAvailableLanguages(translatableField: TranslatableField): string[] {
    if (!translatableField || typeof translatableField !== 'object') return [];
    return Object.keys(translatableField);
  }

  /**
   * Check if a specific language translation exists for a field.
   *
   * @param translatableField e.g. { en: "Name" }
   * @param language e.g. "en"
   */
  static hasTranslation(
    translatableField: TranslatableField,
    language: string,
  ): boolean {
    return !!(translatableField && translatableField[language]);
  }

  /**
   * Create a full translatable field object using all supported languages,
   * filling other languages using a fallback or repeating the provided value.
   *
   * @param value Original string value from input
   * @param currentLanguage Language of the input string
   * @param fallbackValue Optional fallback to use for other languages
   * @param supportedLanguages Optional list of supported languages (default: ['en', 'ar'])
   */
  static buildCompleteLangField({
    value,
    currentLanguage,
    fallbackValue,
    supportedLanguages = ['en', 'ar'],
  }: BuildCompleteLangFieldOptions): TranslatableField {
    const result: TranslatableField = {};
    for (const lang of supportedLanguages) {
      result[lang] =
        lang === currentLanguage ? value : (fallbackValue ?? value);
    }
    return result;
  }

  /**
   * Converts flat string fields into translatable objects for DB storage.
   * Keeps existing translations and updates the current one.
   *
   * Example:
   * Input: { name: 'Car' } + language: 'en'
   * Output: { name: { en: 'Car' } }
   *
   * @param input The input object from frontend
   * @param currentLanguage Language the current input is in
   * @param existingData Optional previous data to preserve other translations
   * @param translatableKeys Optional override for translatable keys
   * @param ensureAllLanguages If true, ensures all supported languages are included in result
   */
  static prepareTranslatableFields({
    input,
    currentLanguage,
    existingData,
    translatableKeys = this.DEFAULT_TRANSLATABLE_KEYS,
    ensureAllLanguages = false,
  }: PrepareTranslatableFieldsOptions): any {
    const result = { ...input };

    Object.keys(result).forEach((key) => {
      if (
        this.isTranslatableKey(key, translatableKeys) &&
        typeof result[key] === 'string'
      ) {
        const existingTranslations = existingData?.[key] || {};

        result[key] = ensureAllLanguages
          ? this.buildCompleteLangField({
              value: result[key],
              currentLanguage,
              fallbackValue: existingTranslations[currentLanguage],
            })
          : {
              ...existingTranslations,
              [currentLanguage]: result[key],
            };
      }
    });

    return result;
  }

  /**
   * Convert a nested object with translatable fields into a flat object
   * using the specified language, falling back if needed.
   *
   * Example input:
   * {
   *   name: { en: 'Car', ar: 'سيارة' },
   *   brand: { name: { en: 'Toyota', ar: 'تويوتا' } }
   * }
   *
   * Output (for 'ar'):
   * {
   *   name: 'سيارة',
   *   brand: { name: 'تويوتا' }
   * }
   *
   * @param obj The original object
   * @param language Preferred language (e.g., 'en', 'ar')
   * @param fallbackLanguage Fallback language if preferred isn't available
   * @param translatableKeys Optional override for translatable keys (module-specific)
   */
  static flattenTranslations({
    obj,
    language,
    fallbackLanguage = this.DEFAULT_FALLBACK_LANGUAGE,
    translatableKeys = this.DEFAULT_TRANSLATABLE_KEYS,
  }: FlattenTranslationsOptions): any {
    if (!obj || typeof obj !== 'object') return obj;

    const result = { ...obj };

    Object.keys(result).forEach((key) => {
      if (
        this.isTranslatableKey(key, translatableKeys) &&
        result[key] &&
        typeof result[key] === 'object'
      ) {
        // Return the translation for the requested language or fallback
        result[key] =
          result[key][language] ?? result[key][fallbackLanguage] ?? '';
      } else if (Array.isArray(result[key])) {
        // Recursively handle array of objects
        result[key] = result[key].map((item) =>
          this.flattenTranslations({
            obj: item,
            language,
            fallbackLanguage,
            translatableKeys,
          }),
        );
      } else if (result[key] && typeof result[key] === 'object') {
        // Recursively flatten nested objects
        result[key] = this.flattenTranslations({
          obj: result[key],
          language,
          fallbackLanguage,
          translatableKeys,
        });
      }
    });

    return result;
  }
}
