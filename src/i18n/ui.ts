import type { Locale } from './locales';

type LayoutCopy = {
	skipToContent: string;
	navHome: string;
	navBlog: string;
	footer: string;
	siteTitle: string;
	siteSubtitle: string;
};

type HomeCopy = {
	eyebrow: string;
	heroTitle: string;
	heroLead: string;
	browsePosts: string;
	astroDocs: string;
	recentPosts: string;
	viewAll: string;
};

type BlogIndexCopy = {
	title: string;
	intro: (n: number) => string;
};

type PostCopy = {
	backToBlog: string;
	published: string;
	updated: string;
	langSwitcher: string;
};

const layout: Record<Locale, LayoutCopy> = {
	en: {
		skipToContent: 'Skip to content',
		navHome: 'Home',
		navBlog: 'All posts',
		footer:
			'Personal learning notes. Each topic can exist in English, French, and Arabic—add matching Markdown files under src/content/blog/en/, fr/, and ar/ with the same translationKey in frontmatter.',
		siteTitle: 'Nada Tayebi',
		siteSubtitle: 'Software engineering student',
	},
	fr: {
		skipToContent: 'Aller au contenu',
		navHome: 'Accueil',
		navBlog: 'Tous les articles',
		footer:
			'Carnet d\u2019apprentissage personnel. Chaque sujet peut exister en anglais, français et arabe : ajoutez les fichiers Markdown dans src/content/blog/en/, fr/ et ar/ avec le même translationKey dans le frontmatter.',
		siteTitle: 'Nada Tayebi',
		siteSubtitle: 'Étudiante en génie logiciel',
	},
	ar: {
		skipToContent: 'تخطّي إلى المحتوى',
		navHome: 'الرئيسية',
		navBlog: 'كل المقالات',
		footer:
			'مدوّنة تعلّم شخصية. يمكن أن يكون لكل موضوع نسخ بالإنجليزية والفرنسية والعربية—أضف ملفات Markdown في src/content/blog/en/ و fr/ و ar/ مع نفس translationKey في الواجهة الأمامية.',
		siteTitle: 'ندى الطيّبي',
		siteSubtitle: 'طالبة هندسة البرمجيات',
	},
};

const home: Record<Locale, HomeCopy> = {
	en: {
		eyebrow: 'Learning in public',
		heroTitle: 'Notes on computer science, IT, and related topics',
		heroLead:
			'Whenever I learn something new, I write it here—to remember it better, and in case it helps you too.',
		browsePosts: 'Browse all posts',
		astroDocs: 'How content works (Astro docs)',
		recentPosts: 'Recent posts',
		viewAll: 'View all →',
	},
	fr: {
		eyebrow: 'Apprendre en public',
		heroTitle: 'Notes d’informatique, d’IT et de sujets proches',
		heroLead:
			'Dès que j’apprends quelque chose de nouveau, je l’écris ici—pour mieux le retenir, et au cas où cela vous aiderait aussi.',
		browsePosts: 'Voir tous les articles',
		astroDocs: 'Fonctionnement du contenu (doc Astro)',
		recentPosts: 'Articles récents',
		viewAll: 'Tout voir →',
	},
	ar: {
		eyebrow: 'تعلّم علناً',
		heroTitle: 'ملاحظات في علوم الحاسوب وتقنية المعلومات وما يتعلّق بها',
		heroLead:
			'كلما تعلّمتُ شيئاً جديداً أكتبه هنا—لأثبّته في الذاكرة، ولعلّه يفيدك أنت أيضاً.',
		browsePosts: 'تصفّح كل المقالات',
		astroDocs: 'كيف يعمل المحتوى (وثائق Astro)',
		recentPosts: 'أحدث المقالات',
		viewAll: 'عرض الكل ←',
	},
};

const blogIndex: Record<Locale, BlogIndexCopy> = {
	en: {
		title: 'All posts',
		intro: (n) => `${n} article${n === 1 ? '' : 's'} so far.`,
	},
	fr: {
		title: 'Tous les articles',
		intro: (n) => `${n} article${n === 1 ? '' : 's'} pour l’instant.`,
	},
	ar: {
		title: 'كل المقالات',
		intro: (n) => (n === 1 ? 'مقال واحد حتى الآن.' : `${n} مقالات حتى الآن.`),
	},
};

const post: Record<Locale, PostCopy> = {
	en: {
		backToBlog: '← All posts',
		published: 'Published',
		updated: 'Updated',
		langSwitcher: 'Language',
	},
	fr: {
		backToBlog: '← Tous les articles',
		published: 'Publié le',
		updated: 'Mis à jour le',
		langSwitcher: 'Langue',
	},
	ar: {
		backToBlog: '← كل المقالات',
		published: 'تاريخ النشر',
		updated: 'تاريخ التحديث',
		langSwitcher: 'اللغة',
	},
};

export function layoutStrings(lang: Locale): LayoutCopy {
	return layout[lang];
}

export function homeStrings(lang: Locale): HomeCopy {
	return home[lang];
}

export function blogIndexStrings(lang: Locale): BlogIndexCopy {
	return blogIndex[lang];
}

export function postStrings(lang: Locale): PostCopy {
	return post[lang];
}
