import type { CategorySlug } from './categories';

/**
 * One small mechanism diagram per category (viewBox 0 0 140 100).
 * Strokes and text use currentColor so they follow the theme; the accent
 * (the part the category is about) uses var(--accent).
 */
const box = (x: number, y: number, w: number, h: number, t: string, accent = false, dash = false) =>
	`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" ${accent ? 'stroke="var(--accent)" stroke-width="1.8"' : ''} ${dash ? 'stroke-dasharray="3 2"' : ''}/><text x="${x + w / 2}" y="${y + h / 2 + 2.6}" text-anchor="middle">${t}</text>`;
const arrow = (x1: number, y1: number, x2: number, y2: number, label = '', lx = 0, ly = 0) => {
	const a = Math.atan2(y2 - y1, x2 - x1), s = 3.2, p = (d: number) => `${(x2 - s * Math.cos(a + d)).toFixed(1)},${(y2 - s * Math.sin(a + d)).toFixed(1)}`;
	return `<line x1="${x1}" y1="${y1}" x2="${x2 - 1.5 * Math.cos(a)}" y2="${y2 - 1.5 * Math.sin(a)}"/><polygon points="${x2},${y2} ${p(0.45)} ${p(-0.45)}" fill="currentColor" stroke="none"/>${label ? `<text class="lbl" x="${lx}" y="${ly}" text-anchor="middle">${label}</text>` : ''}`;
};

const art: Record<CategorySlug, { label: string; svg: string }> = {
	engineering: {
		label: 'An actor triggers a business rule that changes an entity',
		svg: box(6, 38, 34, 24, 'actor') + box(53, 38, 34, 24, 'rule', true) + box(100, 38, 34, 24, 'entity') + arrow(40, 50, 53, 50) + arrow(87, 50, 100, 50) + `<text class="lbl" x="46" y="32" text-anchor="middle">asks</text><text class="lbl" x="93" y="32" text-anchor="middle">changes</text>`,
	},
	java: {
		label: 'Two variables hold references to the same object in the heap',
		svg: box(6, 18, 34, 20, 'a') + box(6, 62, 34, 20, 'b') + box(78, 36, 54, 28, 'Object', true) + arrow(40, 28, 78, 44) + arrow(40, 72, 78, 56) + `<text class="lbl" x="22" y="12" text-anchor="middle">stack</text><text class="lbl" x="105" y="30" text-anchor="middle">heap</text>`,
	},
	spring: {
		label: 'A request passes from controller to service to repository',
		svg: box(35, 6, 70, 20, 'Controller') + box(35, 40, 70, 20, 'Service', true) + box(35, 74, 70, 20, 'Repository') + arrow(70, 26, 70, 40) + arrow(70, 60, 70, 74) + `<text class="lbl" x="116" y="36">DTO</text><text class="lbl" x="116" y="70">entity</text>`,
	},
	api: {
		label: 'A client sends a request and the server returns a status',
		svg: box(6, 30, 34, 40, 'client') + box(100, 30, 34, 40, 'server', true) + arrow(40, 42, 100, 42, 'GET /users', 70, 36) + arrow(100, 60, 40, 60, '200 OK', 70, 74),
	},
	data: {
		label: 'An index jumps straight to a row instead of scanning the table',
		svg: box(6, 34, 34, 32, 'index', true) + [0, 1, 2, 3, 4].map(i => `<rect x="62" y="${14 + i * 14}" width="72" height="11" rx="2" ${i === 3 ? 'stroke="var(--accent)" stroke-width="1.8"' : 'stroke-opacity=".45"'}/>`).join('') + arrow(40, 50, 62, 56) + `<text class="lbl" x="98" y="94" text-anchor="middle">rows</text>`,
	},
	testing: {
		label: 'A test drives the service while a mock stands in for the repository',
		svg: box(6, 38, 30, 24, 'test') + box(55, 38, 34, 24, 'Service', true) + box(104, 38, 30, 24, 'mock', false, true) + arrow(36, 50, 55, 50) + arrow(89, 50, 104, 50) + `<text class="lbl" x="45" y="32" text-anchor="middle">calls</text><text class="lbl" x="97" y="32" text-anchor="middle">fake data</text>`,
	},
	security: {
		label: 'A request passes an authentication gate before reaching a resource',
		svg: box(4, 38, 30, 24, 'user') + `<rect x="55" y="30" width="30" height="40" rx="3" stroke="var(--accent)" stroke-width="1.8"/><text x="70" y="53" text-anchor="middle">auth</text>` + box(106, 38, 30, 24, 'data') + arrow(34, 50, 55, 50, 'token', 44, 44) + arrow(85, 50, 106, 50, '', 0, 0) + `<text class="lbl" x="95" y="44" text-anchor="middle">allowed</text>`,
	},
	systems: {
		label: 'A load balancer spreads traffic across several instances',
		svg: box(4, 38, 28, 24, 'users') + box(48, 38, 32, 24, 'LB', true) + [0, 1, 2].map(i => box(100, 8 + i * 30, 34, 24, `app ${i + 1}`)).join('') + arrow(32, 50, 48, 50) + arrow(80, 46, 100, 20) + arrow(80, 50, 100, 50) + arrow(80, 54, 100, 80),
	},
	devops: {
		label: 'Code is built into an image and run as a container',
		svg: [['git', 4], ['build', 38], ['image', 72], ['run', 106]].map(([t, x], i) => box(x as number, 38, 30, 24, t as string, i === 2)).join('') + arrow(34, 50, 38, 50) + arrow(68, 50, 72, 50) + arrow(102, 50, 106, 50),
	},
	research: {
		label: 'A signal is cut into fixed windows called epochs',
		svg: `<polyline points="4,50 14,50 18,28 24,70 30,38 36,56 44,50 52,50 58,22 64,76 70,40 76,56 84,50 94,50 100,32 106,66 112,44 120,50 136,50"/><rect x="50" y="12" width="32" height="76" rx="2" stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="3 2"/><text class="lbl" x="66" y="8" text-anchor="middle">epoch</text><text class="lbl" x="70" y="98" text-anchor="middle">time</text>`,
	},
};

export function categoryVisual(slug: CategorySlug) {
	return art[slug];
}
