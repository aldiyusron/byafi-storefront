import { getProductById, getVariantBySku } from './content/catalog';
import { siteConfig } from './content/site';

export interface BagItem {
	productId: string;
	sku: string;
	quantity: number;
}

export const storageKey = 'byafi-bag-v2';

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

			const sku = 'sku' in entry && typeof entry.sku === 'string' ? entry.sku : null;

			const quantity =
				'quantity' in entry && Number.isInteger(entry.quantity) ? Number(entry.quantity) : null;

			if (!productId || !sku || !quantity || quantity < 1) {
				return null;
			}

			return { productId, sku, quantity };
		})
		.filter((entry): entry is BagItem => Boolean(entry));
}

export function getBagTotals(items: BagItem[]) {
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
	const total = items.reduce((sum, item) => {
		const match = getVariantBySku(item.sku);
		if (match) {
			return sum + match.variant.price * item.quantity;
		}
		const product = getProductById(item.productId);
		return product ? sum + product.price * item.quantity : sum;
	}, 0);

	return { itemCount, total };
}

export function buildWhatsappOrderMessage(items: BagItem[]) {
	const lines = ['Hi byafi, I would like to place an order:', ''];

	items.forEach((item, index) => {
		const match = getVariantBySku(item.sku);

		if (!match) {
			return;
		}

		const { product, variant } = match;
		const lineTotal = variant.price * item.quantity;

		lines.push(
			`${index + 1}. ${product.name} (${variant.size}) x${item.quantity} (${formatCurrency(lineTotal)})`
		);
	});

	lines.push('');
	lines.push(`Estimated total: ${formatCurrency(getBagTotals(items).total)}`);
	lines.push('Could you please confirm availability and payment details?');

	return lines.join('\n');
}
