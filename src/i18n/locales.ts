import { withBase } from '../utils/url';

export const locales = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isLocale(s: string | undefined): s is Locale {
	return s !== undefined && (locales as readonly string[]).includes(s);
}

export function homeHref(lang: Locale): string {
	return withBase(`${lang}/`);
}

export function blogIndexHref(lang: Locale): string {
	return withBase(`${lang}/blog/`);
}

export function postHref(lang: Locale, translationKey: string): string {
	return withBase(`${lang}/blog/${translationKey}/`);
}

export function isRtl(lang: Locale): boolean {
	return lang === 'ar';
}
