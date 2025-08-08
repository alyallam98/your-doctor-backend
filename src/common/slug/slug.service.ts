import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

export interface SlugOptions {
  separator?: string;
  lowercase?: boolean;
  strict?: boolean;
  trim?: boolean;
}
@Injectable()
export class SlugService {
  private readonly defaultOptions: Required<SlugOptions> = {
    separator: '-',
    lowercase: true,
    strict: false,
    trim: true,
  };

  generate(text: string, options?: SlugOptions): string {
    const merged = { ...this.defaultOptions, ...options };

    const hasArabic = /[\u0600-\u06FF]/.test(text);

    if (hasArabic) {
      return text.trim().replace(/\s+/g, merged.separator); // keep Arabic chars
    }

    return slugify(text, {
      lower: merged.lowercase,
      strict: merged.strict,
      trim: merged.trim,
      replacement: merged.separator,
    });
  }
}
