import { getProductById } from './content/catalog';
import { siteConfig } from './content/site';

export interface BagItem {
	productId: string;
	quantity: number;
}

export const storageKey = 'byafi-inquiry-bag-v1';

export function formatCurrency(value: number) {
	return new Intl.NumberFormat(siteConfig.currencyLocale, {
		style: 'currency',
		currency: siteConfig.currencyCode,
		maximumFractionDigits: 0
	}).format(value);
}

export function isValidWhatsappNumber(value: string) {
	return /^\d{9,15}$/.test(value.replace(/\D/g, ''));
}

export function normalizeBag(value: unknown): BagItem[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((entry) => {
			if (!entry || typeof entry !== 'object') {
				return null;
			}

			const productId =
				'productId' in entry && typeof entry.productId === 'string'
					? entry.productId
					: 'id' in entry && typeof entry.id === 'string'
						? entry.id
						: null;

			const quantity =
				'quantity' in entry && Number.isInteger(entry.quantity) ? Number(entry.quantity) : null;

			if (!productId || !quantity || quantity < 1) {
				return null;
			}

			return { productId, quantity };
		})
		.filter((entry): entry is BagItem => Boolean(entry));
}

export function getBagTotals(items: BagItem[]) {
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
	const total = items.reduce((sum, item) => {
		const product = getProductById(item.productId);
		return product ? sum + product.price * item.quantity : sum;
	}, 0);

	return { itemCount, total };
}

export function buildWhatsappOrderMessage(items: BagItem[]) {
	const lines = ['Hi byafi, I would like to place an order inquiry:', ''];

	items.forEach((item, index) => {
		const product = getProductById(item.productId);

		if (!product) {
			return;
		}

		lines.push(
			`${index + 1}. ${product.name} x${item.quantity} (${formatCurrency(product.price * item.quantity)})`
		);
	});

	lines.push('');
	lines.push(`Estimated total: ${formatCurrency(getBagTotals(items).total)}`);
	lines.push('Could you please confirm availability, size guidance, and payment details?');

	return lines.join('\n');
}
