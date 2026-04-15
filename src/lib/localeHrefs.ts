import type { CollectionEntry } from 'astro:content';
import { blogIndexHref, homeHref, postHref, type Locale, locales } from '../i18n/locales';

export function homeLocaleHrefs(): Record<Locale, string> {
	return Object.fromEntries(locales.map((l) => [l, homeHref(l)])) as Record<Locale, string>;
}

export function blogIndexLocaleHrefs(): Record<Locale, string> {
	return Object.fromEntries(locales.map((l) => [l, blogIndexHref(l)])) as Record<Locale, string>;
}

/** Same article in other locales, or that language’s blog index if the translation file is missing. */
export function postLocaleHrefs(
	posts: CollectionEntry<'blog'>[],
	translationKey: string,
): Record<Locale, string> {
	return Object.fromEntries(
		locales.map((l) => {
			const exists = posts.some((p) => p.data.translationKey === translationKey && p.data.locale === l);
			return [l, exists ? postHref(l, translationKey) : blogIndexHref(l)];
		}),
	) as Record<Locale, string>;
}

export function postAvailableLocales(posts: CollectionEntry<'blog'>[], translationKey: string): Set<Locale> {
	return new Set(
		posts.filter((p) => p.data.translationKey === translationKey).map((p) => p.data.locale),
	);
}
