import type { Locale } from '../i18n/locales';
import { withBase } from '../utils/url';

export type CategorySlug =
	| 'engineering'
	| 'java'
	| 'spring'
	| 'api'
	| 'data'
	| 'testing'
	| 'security'
	| 'systems'
	| 'devops'
	| 'research';

const categories: CategorySlug[] = [
	'engineering',
	'java',
	'spring',
	'api',
	'data',
	'testing',
	'security',
	'systems',
	'devops',
	'research',
];

const labels: Record<Locale, Record<CategorySlug, string>> = {
	en: {
		engineering: 'Engineering & modeling',
		java: 'Java fundamentals',
		spring: 'Spring & backend',
		api: 'APIs & the web',
		data: 'Databases & persistence',
		testing: 'Testing & debugging',
		security: 'Security & identity',
		systems: 'Systems & architecture',
		devops: 'Deployment & tools',
		research: 'Research · NeuroAI & people',
	},
	fr: {
		engineering: 'Ingénierie & modélisation',
		java: 'Fondamentaux Java',
		spring: 'Spring & backend',
		api: 'APIs & le web',
		data: 'Bases de données & persistance',
		testing: 'Tests & débogage',
		security: 'Sécurité & identité',
		systems: 'Systèmes & architecture',
		devops: 'Déploiement & outils',
		research: 'Recherche · NeuroIA & personnes',
	},
	ar: {
		engineering: 'الهندسة والنمذجة',
		java: 'أساسيات جافا',
		spring: 'سبرنغ والواجهة الخلفية',
		api: 'واجهات البرمجة والويب',
		data: 'قواعد البيانات والتخزين',
		testing: 'الاختبار وتصحيح الأخطاء',
		security: 'الأمن والهوية',
		systems: 'الأنظمة والمعمارية',
		devops: 'النشر والأدوات',
		research: 'البحث · العصبي الاصطناعي والأشخاص',
	},
};

/** Map a post's primary tag to a category slug. */
export function categoryFor(data: { tags?: string[] }): CategorySlug {
	const primary = (data.tags?.[0] ?? '').toLowerCase();

	if (primary.includes('java')) return 'java';
	if (primary.includes('spring') || primary.includes('jpa') || primary.includes('hibernate')) return 'spring';
	if (primary.includes('api') || primary.includes('rest') || primary.includes('http') || primary.includes('validation')) return 'api';
	if (primary.includes('database') || primary.includes('sql') || primary.includes('persistence') || primary.includes('index') || primary.includes('transaction') || primary.includes('migration')) return 'data';
	if (primary.includes('test') || primary.includes('junit') || primary.includes('mock') || primary.includes('debug')) return 'testing';
	if (primary.includes('security') || primary.includes('auth') || primary.includes('jwt') || primary.includes('password') || primary.includes('permission')) return 'security';
	if (primary.includes('docker') || primary.includes('kubernetes') || primary.includes('deploy') || primary.includes('ci') || primary.includes('maven') || primary.includes('git')) return 'devops';
	if (primary.includes('architecture') || primary.includes('design') || primary.includes('system') || primary.includes('kafka') || primary.includes('cache') || primary.includes('scale') || primary.includes('microservice')) return 'systems';
	if (primary.includes('research') || primary.includes('eeg') || primary.includes('neuro') || primary.includes('machine-learning') || primary.includes('signal')) return 'research';
	return 'engineering';
}

export function categoryLabel(slug: CategorySlug, lang: Locale): string {
	return labels[lang][slug];
}

export function categoryHref(lang: Locale, slug: CategorySlug): string {
	return withBase(`${lang}/category/${slug}/`);
}

export function categoryStrings(lang: Locale) {
	const all = lang === 'ar' ? 'كل الكتابات' : lang === 'fr' ? 'Tout le contenu' : 'All writing';
	const explore = lang === 'ar' ? 'استكشف حسب الفئة' : lang === 'fr' ? 'Explorer par catégorie' : 'Explore by category';
	const related = lang === 'ar' ? 'مقالات ذات صلة' : lang === 'fr' ? 'Articles associés' : 'Related writing';
	return { all, explore, related };
}
