import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

export interface TranslatableField {
  [key: string]: string; // e.g. { en: "Category", ar: "فئة" }
}

export interface TranslatableObject {
  [key: string]: TranslatableField | any;
}

export interface CreateTranslatableDocumentOptions {
  obj: any;
  keysToTranslate: string[];
  supportedLanguages?: string[];
  defaultLanguage?: string;
}

export interface UpdateTranslatableDocumentOptions {
  input: any;
  currentLanguage: string;
  existingData?: any;
  translatableKeys?: string[];
  supportedLanguages?: string[];
}

export interface RetrieveTranslatedDocumentOptions {
  obj: any;
  language: string;
  fallbackLanguage?: string;
  translatableKeys?: string[];
}

/**
 * Utility service for managing multi-language (i18n) translatable fields in entities.
 * Provides three main operations: create, update, and retrieve translated documents.
 */
@Injectable()
export class TranslationService {
  private static readonly DEFAULT_FALLBACK_LANGUAGE = 'en';
  private static readonly DEFAULT_SUPPORTED_LANGUAGES = ['en', 'ar'];

  /**
   * Default translatable keys used across most modules.
   * Override by passing custom keys to the static methods if needed per module.
   */
  private static readonly DEFAULT_TRANSLATABLE_KEYS = ['name', 'description'];

  /**
   * Get the list of default translatable keys.
   */
  static getTranslatableKeys(): string[] {
    return Array.from(this.DEFAULT_TRANSLATABLE_KEYS);
  }

  /**
   * Get the list of default supported languages.
   */
  static getSupportedLanguages(): string[] {
    return [...this.DEFAULT_SUPPORTED_LANGUAGES];
  }

  /**
   * Check if a key is translatable.
   * @param key The field name to check
   * @param keys Optional override for translatable keys (used per module)
   */
  static isTranslatableKey(
    key: string,
    keys: string[] = this.DEFAULT_TRANSLATABLE_KEYS,
  ): boolean {
    return keys.includes(key);
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
   * Creates a new document with translatable fields initialized for all supported languages.
   * Use this when creating new entities that need translation support.
   * All supported languages will be populated with the provided values.
   *
   * Example:
   * Input:
   * - obj: { name: 'Car', price: 1000, active: true }
   * - keysToTranslate: ['name']
   * - supportedLanguages: ['en', 'ar']
   *
   * Output: { name: { en: 'Car', ar: 'Car' }, price: 1000, active: true }
   *
   * @param obj The base object to add translation keys to
   * @param keysToTranslate Array of field names that should be translatable
   * @param supportedLanguages Optional list of supported languages
   * @param defaultLanguage The language of the input values (defaults to 'en')
   */
  static createTranslatableDocument({
    obj,
    keysToTranslate,
    supportedLanguages = this.DEFAULT_SUPPORTED_LANGUAGES,
    defaultLanguage = this.DEFAULT_FALLBACK_LANGUAGE,
  }: CreateTranslatableDocumentOptions): any {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Object must be a valid object');
    }

    if (!Array.isArray(keysToTranslate) || keysToTranslate.length === 0) {
      throw new Error('keysToTranslate must be a non-empty array');
    }

    const result = { ...obj };

    keysToTranslate.forEach((key) => {
      if (key in result) {
        const value = result[key];

        // Only convert string values to translatable fields
        if (typeof value === 'string') {
          const translatableField: TranslatableField = {};

          supportedLanguages.forEach((lang) => {
            translatableField[lang] = value; // All languages get the same value
          });

          result[key] = translatableField;
        } else if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          // If the field is already a translatable object, ensure all languages are present
          const existingTranslations = { ...value };
          const defaultValue = existingTranslations[defaultLanguage] || '';

          supportedLanguages.forEach((lang) => {
            if (!(lang in existingTranslations)) {
              existingTranslations[lang] = defaultValue;
            }
          });
          result[key] = existingTranslations;
        }
      } else {
        // If key doesn't exist in object, create translatable field with empty values
        const translatableField: TranslatableField = {};
        supportedLanguages.forEach((lang) => {
          translatableField[lang] = '';
        });
        result[key] = translatableField;
      }
    });

    return result;
  }

  /**
   * Updates an existing document with new translation values for a specific language.
   * Use this when updating existing entities with new translations.
   * Preserves existing translations for other languages.
   *
   * Example:
   * Input: { name: 'Car' } + language: 'ar' + existingData: { name: { en: 'Car' } }
   * Output: { name: { en: 'Car', ar: 'Car' } }
   *
   * @param input The input object from frontend with new values
   * @param currentLanguage Language the current input is in
   * @param existingData Optional previous data to preserve other translations
   * @param translatableKeys Optional override for translatable keys
   * @param supportedLanguages Optional list of supported languages for complete field creation
   */
  static updateTranslatableDocument({
    input,
    currentLanguage,
    existingData,
    translatableKeys = this.DEFAULT_TRANSLATABLE_KEYS,
    supportedLanguages = this.DEFAULT_SUPPORTED_LANGUAGES,
  }: UpdateTranslatableDocumentOptions): any {
    const result = { ...input };

    Object.keys(result).forEach((key) => {
      if (
        this.isTranslatableKey(key, translatableKeys) &&
        typeof result[key] === 'string'
      ) {
        const existingTranslations = existingData?.[key] || {};

        // Create complete translatable field with all supported languages
        const translatableField: TranslatableField = {};

        supportedLanguages.forEach((lang) => {
          if (lang === currentLanguage) {
            translatableField[lang] = result[key];
          } else {
            translatableField[lang] = existingTranslations[lang] || result[key];
          }
        });

        result[key] = translatableField;
      }
    });

    return result;
  }

  /**
   * Retrieves a document with translations flattened for a specific language.
   * Use this when serving data to frontend or displaying content.
   * Recursively handles nested objects and arrays.
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
   * @param obj The original object with translatable fields
   * @param language Preferred language (e.g., 'en', 'ar')
   * @param fallbackLanguage Fallback language if preferred isn't available
   * @param translatableKeys Optional override for translatable keys (module-specific)
   */
  static retrieveTranslatedDocument({
    obj,
    language,
    fallbackLanguage = this.DEFAULT_FALLBACK_LANGUAGE,
    translatableKeys = this.DEFAULT_TRANSLATABLE_KEYS,
  }: RetrieveTranslatedDocumentOptions): any {
    if (!obj || typeof obj !== 'object') return obj;

    const result: any = Array.isArray(obj) ? [] : {};

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (this.isTranslatableKey(key, translatableKeys)) {
        // Only translate the explicitly defined translatable keys
        if (
          value &&
          typeof value === 'object' &&
          (language in value || fallbackLanguage in value)
        ) {
          result[key] = value[language] ?? value[fallbackLanguage] ?? '';
        } else {
          result[key] = value; // fallback to original if translation structure not found
        }
      } else {
        // For all non-translatable keys: preserve value as-is
        result[key] = value;
      }
    }

    return result;
  }

  static retrieveTranslatedDocuments({
    items,
    language,
    fallbackLanguage = this.DEFAULT_FALLBACK_LANGUAGE,
    translatableKeys = this.DEFAULT_TRANSLATABLE_KEYS,
  }: {
    items: any[];
    language: string;
    fallbackLanguage?: string;
    translatableKeys?: string[];
  }): any[] {
    if (!Array.isArray(items)) return [];

    return items.map((item) =>
      this.recursivelyTranslate({
        obj: item,
        language,
        fallbackLanguage,
        translatableKeys,
      }),
    );
  }

  private static recursivelyTranslate({
    obj,
    language,
    fallbackLanguage,
    translatableKeys,
  }: {
    obj: any;
    language: string;
    fallbackLanguage: string;
    translatableKeys: string[];
  }): any {
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        this.recursivelyTranslate({
          obj: item,
          language,
          fallbackLanguage,
          translatableKeys,
        }),
      );
    }

    if (obj && typeof obj === 'object') {
      const result: any = {};

      for (const key of Object.keys(obj)) {
        let value = obj[key];

        // ✅ Convert ObjectId to string
        if (key === '_id' && Types.ObjectId.isValid(value)) {
          result[key] = value.toString();
          continue;
        }

        // ✅ Handle translatable keys
        if (
          translatableKeys.includes(key) &&
          value &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          result[key] =
            value[language] ??
            value[fallbackLanguage] ??
            Object.values(value)[0] ??
            '';
        }

        // ✅ Handle arrays
        else if (Array.isArray(value)) {
          result[key] = value.map((v) =>
            this.recursivelyTranslate({
              obj: v,
              language,
              fallbackLanguage,
              translatableKeys,
            }),
          );
        }

        // ✅ Handle nested objects
        else if (value && typeof value === 'object') {
          result[key] = this.recursivelyTranslate({
            obj: value,
            language,
            fallbackLanguage,
            translatableKeys,
          });
        }

        // ✅ Pass through other values
        else {
          result[key] = value;
        }
      }

      return result;
    }

    return obj;
  }
}
