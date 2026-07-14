import type { Locale } from './locales';

type Personal = {
	introduction: string;
	aboutNav: string;
	intro: string;
	title: string;
	start: string;
	topics: string[];
	featured: string;
	continue: string;
	recent: string;
	about: string;
	aboutText: string;
	github: string;
	interests: string;
	interestList: string[];
	welcome: string;
	welcomeText: string;
	topicText: string[];
};

const personalData: Record<Locale, Personal> = {
	en: {
		introduction: 'Personal technical journal',
		aboutNav: 'About',
		intro: 'A personal journal on software, systems, and the ideas behind them. Written as I learn, shared as I go.',
		title: 'Notes on computer science,\nIT, and related topics',
		start: 'Start here',
		topics: ['Java & Spring', 'Databases', 'Architecture', 'DevOps'],
		featured: 'The latest entry',
		continue: 'Continue reading',
		recent: 'Recent entries',
		about: 'About',
		aboutText: 'I am Nada Tayebi, a software engineering student. I write about what I learn — backend development, systems design, databases, and the concepts behind them.',
		github: 'View on GitHub →',
		interests: 'Interests',
		interestList: ['Backend engineering', 'System design', 'Neuroscience & AI', 'Data engineering'],
		welcome: 'New to this journal?',
		welcomeText: 'Start with the first article in the learning series and follow along.',
		topicText: [
			'From syntax to architecture — building real applications.',
			'Schema design, queries, and persistence patterns.',
			'Modules, boundaries, and how systems evolve.',
			'Containers, pipelines, and shipping code.',
		],
	},
	fr: {
		introduction: 'Journal technique personnel',
		aboutNav: 'À propos',
		intro: 'Un journal personnel sur le logiciel, les systèmes et les idées qui les façonnent. Écrit au fil de mes découvertes, partagé avec vous.',
		title: "Notes d'informatique,\nd'IT et de sujets proches",
		start: 'Commencez ici',
		topics: ['Java & Spring', 'Bases de données', 'Architecture', 'DevOps'],
		featured: 'La dernière publication',
		continue: 'Continuer la lecture',
		recent: 'Publications récentes',
		about: 'À propos',
		aboutText: "Je suis Nada Tayebi, étudiante en génie logiciel. J'écris sur ce que j'apprends — développement backend, conception de systèmes, bases de données et les concepts qui les sous-tendent.",
		github: 'Voir sur GitHub →',
		interests: 'Centres dintérêt',
		interestList: ['Génie backend', 'Conception de systèmes', 'Neurosciences & IA', 'Ingénierie des données'],
		welcome: 'Nouveau dans ce journal ?',
		welcomeText: "Commencez par le premier article de la série d'apprentissage et suivez le fil.",
		topicText: [
			'De la syntaxe à larchitecture — construire de vraies applications.',
			"Conception de schémas, requêtes et patterns de persistance.",
			'Modules, frontières et évolution des systèmes.',
			'Conteneurs, pipelines et livraison de code.',
		],
	},
	ar: {
		introduction: 'دفتر تقني شخصي',
		aboutNav: 'نبذة عني',
		intro: 'دفتر شخصي على البرمجيات، الأنظمة والأفكار اللي وراهم. كنكتب شنو كنتعلّم وكنشاركو معاكم.',
		title: 'ملاحظات في علوم الحاسوب\nومعلوماتية وما تعلّق بها',
		start: 'ابدأ من هنا',
		topics: ['جافا وسبرنغ', 'قواعد البيانات', 'المعمارية', 'النشر'],
		featured: 'آخر مقال',
		continue: 'واصل القراءة',
		recent: 'آخر المقالات',
		about: 'نبذة عني',
		aboutText: 'أنا ندى الطيّبي، طالبة هندسة برمجيات. كنكتب على شنو كنتعلم — تطوير الخلفية، تصميم الأنظمة، قواعد البيانات والمفاهيم اللي وراهم.',
		github: 'شوف على GitHub →',
		interests: 'الاهتمامات',
		interestList: ['هندسة الخلفية', 'تصميم الأنظمة', 'الأعصاب والذكاء الاصطناعي', 'هندسة البيانات'],
		welcome: 'جديد فهاد الدفتر؟',
		welcomeText: 'ابدأ بأول مقال فالسلسلة وتبع معايا.',
		topicText: [
			'من الصياغة للمعمارية — بناء تطبيقات حقيقية.',
			'تصميم المخططات والاستعلامات وأنماط التخزين.',
			'الوحدات والحدود وتطور الأنظمة.',
			'الحاويات والمسارات وتسليم الكود.',
		],
	},
};

export function personal(lang: Locale): Personal {
	return personalData[lang];
}
