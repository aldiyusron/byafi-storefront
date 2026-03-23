export interface PromiseCard {
	title: string;
	copy: string;
}

export interface EditorialCard {
	index: string;
	title: string;
	copy: string;
	gradient: string;
}

export interface OrderStep {
	number: string;
	title: string;
	copy: string;
}

export interface PrimaryNavItem {
	label: string;
	href: string;
}

export const siteConfig = {
	name: 'byafi',
	locale: 'en',
	currencyCode: 'IDR',
	currencyLocale: 'id-ID',
	defaultTitle: 'byafi | Modest Wear with Whimsical Details',
	description:
		'Modest womenswear with gathered sleeves, flowing cuts, and prints that surprise. Browse and order through WhatsApp.',
	tagline: 'whimsical charms in every little thing.',
	brandDescription:
		'Modest womenswear made for women who notice the small things — a gathered cuff, a polka-dot lining, a sleeve that moves.',
	footerCopy:
		'Modest womenswear for those who notice the gentle details.',
	instagramUrl: 'https://www.instagram.com/dearbyafi/',
	whatsappNumber: '62812XXXXXXX'
} as const;

export const primaryNav: PrimaryNavItem[] = [
	{ label: 'Story', href: '/#story' },
	{ label: 'Lookbook', href: '/#lookbook' },
	{ label: 'Collection', href: '/collection' },
	{ label: 'Order', href: '/#order' }
];

export const heroNotes = [
	'Whimsical modest pieces',
	'Direct WhatsApp ordering',
	'Small-batch drops',
	'Handpicked fabrics & details'
];

export const promises: PromiseCard[] = [
	{
		title: 'Modest by design',
		copy:
			'Every silhouette drapes with hijab in mind. Longer hemlines, gathered wrists, relaxed ease — modesty woven into the pattern, not added as an afterthought.'
	},
	{
		title: 'Personal from start to finish',
		copy:
			'You order through WhatsApp and talk to us directly. Ask about sizing, request styling advice, confirm fabric details before you commit.'
	},
	{
		title: 'Small batches, careful hands',
		copy:
			'We release in limited drops with handpicked fabrics. Each piece is made in small runs so the quality stays close and the details stay intentional.'
	}
];

export const editorials: EditorialCard[] = [
	{
		index: '01',
		title: 'Gentle Draping',
		copy: 'Flowing silhouettes, soft gathers, and modest cuts that move beautifully through the day.',
		gradient: 'linear-gradient(160deg, #e0c8cb 0%, #9e7279 100%)'
	},
	{
		index: '02',
		title: 'Whimsical Details',
		copy: 'Polka dots, delicate prints, and hand-picked trims that make each piece feel like a small discovery.',
		gradient: 'linear-gradient(160deg, #c8b8cc 0%, #e0c8cb 100%)'
	},
	{
		index: '03',
		title: 'Everyday Poetry',
		copy: 'Pieces designed to carry charm from morning errands to afternoon gatherings and quiet evenings.',
		gradient: 'linear-gradient(160deg, #3a3035 0%, #1c1719 100%)'
	}
];

export const orderSteps: OrderStep[] = [
	{
		number: '01',
		title: 'Browse the collection',
		copy:
			'Explore the pieces, open any product page, and save the ones that speak to you.'
	},
	{
		number: '02',
		title: 'Build your inquiry bag',
		copy:
			'The site gathers your selections and prepares a clean order summary with totals.'
	},
	{
		number: '03',
		title: 'Continue on WhatsApp',
		copy:
			'Send the pre-filled message to chat about sizing, fabric, payment, and delivery.'
	}
];
