export interface CollectionCategory {
	id: string;
	label: string;
	description: string;
}

export interface Product {
	id: string;
	slug: string;
	name: string;
	category: string;
	price: number;
	badge: string;
	description: string;
	subtitle: string;
	fit: string;
	fabric: string;
	color: string;
	sizes: string[];
	note: string;
	palette: [string, string];
}

export const collectionFilters: CollectionCategory[] = [
	{
		id: 'all',
		label: 'All pieces',
		description: 'Every piece in the current collection.'
	},
	{
		id: 'sets',
		label: 'Sets',
		description: 'Coordinated pieces for effortless repeat wear.'
	},
	{
		id: 'dresses',
		label: 'Dresses',
		description: 'Flowing silhouettes for all-day grace.'
	},
	{
		id: 'layers',
		label: 'Layers',
		description: 'Light layering pieces with gentle structure.'
	},
	{
		id: 'separates',
		label: 'Separates',
		description: 'Mix-and-match pieces for everyday dressing.'
	}
];

export const browseCollections = collectionFilters.filter((collection) => collection.id !== 'all');

export const products: Product[] = [
	{
		id: 'naira-coord-set',
		slug: 'naira-coord-set',
		name: 'Naira Coord Set',
		category: 'sets',
		price: 849000,
		badge: 'New drop',
		description:
			'A soft-structured blazer with a flowing skirt, designed for gentle polish and easy repeat wear.',
		subtitle: 'Soft blazer + flowing skirt',
		fit: 'Relaxed tailoring',
		fabric: 'Textured twill blend',
		color: 'Dusty blush',
		sizes: ['S', 'M', 'L', 'XL'],
		note: 'Beautiful as an everyday uniform and easy to dress up for gatherings or dinner.',
		palette: ['#deb8b8', '#a07070']
	},
	{
		id: 'selah-column-dress',
		slug: 'selah-column-dress',
		name: 'Selah Column Dress',
		category: 'dresses',
		price: 689000,
		badge: 'Best seller',
		description:
			'A longline silhouette with fluid movement, delicate gathers at the wrist, and a graceful neckline.',
		subtitle: 'Longline dress with gathered sleeves',
		fit: 'Straight easy fit',
		fabric: 'Soft matte crepe',
		color: 'Soft ivory',
		sizes: ['S', 'M', 'L'],
		note: 'An event-ready shape with dreamy movement instead of overt embellishment.',
		palette: ['#ede5da', '#b8a898']
	},
	{
		id: 'tala-wrap-outer',
		slug: 'tala-wrap-outer',
		name: 'Tala Wrap Outer',
		category: 'layers',
		price: 735000,
		badge: 'Layering edit',
		description:
			'A wrap-style outer layer with a clean tie closure and enough ease for styling over dresses or basics.',
		subtitle: 'Wrap outer with tie closure',
		fit: 'Loose layered fit',
		fabric: 'Washed linen blend',
		color: 'Sage mist',
		sizes: ['S', 'M', 'L'],
		note: 'A transitional layer for those who want gentle structure without stiffness.',
		palette: ['#96a088', '#5c6852']
	},
	{
		id: 'alya-everyday-tunic',
		slug: 'alya-everyday-tunic',
		name: 'Alya Everyday Tunic',
		category: 'separates',
		price: 429000,
		badge: 'Core piece',
		description:
			'A clean tunic cut with a flattering long line and enough room to move through the day comfortably.',
		subtitle: 'Clean tunic with long line',
		fit: 'Easy straight fit',
		fabric: 'Breathable cotton blend',
		color: 'Warm cream',
		sizes: ['S', 'M', 'L', 'XL'],
		note: 'A lovely first piece for anyone discovering the brand for the first time.',
		palette: ['#e8dccf', '#b8a090']
	},
	{
		id: 'mira-soft-blazer',
		slug: 'mira-soft-blazer',
		name: 'Mira Soft Blazer',
		category: 'layers',
		price: 779000,
		badge: 'Studio favorite',
		description:
			'The sharpest layer in the collection, cut with soft shoulders and enough room for repeated wear.',
		subtitle: 'Relaxed blazer with soft shoulder',
		fit: 'Tailored relaxed fit',
		fabric: 'Brushed suiting',
		color: 'Charcoal',
		sizes: ['S', 'M', 'L'],
		note: 'A signature piece that anchors any outfit with quiet confidence.',
		palette: ['#4a4044', '#1c1719']
	},
	{
		id: 'safa-shirt-dress',
		slug: 'safa-shirt-dress',
		name: 'Safa Shirt Dress',
		category: 'dresses',
		price: 625000,
		badge: 'Easy classic',
		description:
			'A shirt-inspired dress with a tidy collar, modest length, and beautiful movement through the skirt.',
		subtitle: 'Shirt dress with full sweep',
		fit: 'Relaxed waist fit',
		fabric: 'Crisp cotton poplin',
		color: 'Dusty rose',
		sizes: ['S', 'M', 'L', 'XL'],
		note: 'An all-day piece that feels as lovely at a cafe as it does at a gathering.',
		palette: ['#d9b8bb', '#9e7880']
	},
	{
		id: 'rumi-pleat-skirt',
		slug: 'rumi-pleat-skirt',
		name: 'Rumi Pleat Skirt',
		category: 'separates',
		price: 465000,
		badge: 'Wardrobe builder',
		description:
			'A mid-length pleated skirt with enough volume for movement and enough restraint to stay refined.',
		subtitle: 'Pleated skirt with soft movement',
		fit: 'Mid-rise with drape',
		fabric: 'Lightweight satin twill',
		color: 'Soft lavender',
		sizes: ['S', 'M', 'L'],
		note: 'Pairs naturally with both tailoring and softer tunic-style tops.',
		palette: ['#c8b8cc', '#7a6880']
	},
	{
		id: 'lina-lounge-set',
		slug: 'lina-lounge-set',
		name: 'Lina Lounge Set',
		category: 'sets',
		price: 598000,
		badge: 'Weekend set',
		description:
			'An easy matching set built for comfort without losing shape, with a playful polka-dot print.',
		subtitle: 'Matching top + wide-leg trouser',
		fit: 'Soft relaxed fit',
		fabric: 'Airy rayon blend',
		color: 'Cream with black dot',
		sizes: ['S', 'M', 'L', 'XL'],
		note: 'A charming set that brings a playful side to the collection.',
		palette: ['#2a2428', '#d8d0c8']
	}
];

export function getCollectionById(collectionId: string) {
	return collectionFilters.find((collection) => collection.id === collectionId);
}

export function getCollectionLabel(collectionId: string) {
	return getCollectionById(collectionId)?.label ?? collectionId;
}

export function getProducts(categoryId?: string) {
	if (!categoryId || categoryId === 'all') {
		return products;
	}

	return products.filter((product) => product.category === categoryId);
}

export function getProductById(productId: string) {
	return products.find((product) => product.id === productId);
}

export function getProductBySlug(slug: string) {
	return products.find((product) => product.slug === slug);
}
