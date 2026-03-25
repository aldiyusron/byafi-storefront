import { getCollectionLabel, getVariantBySku } from '../lib/content/catalog';
import { siteConfig } from '../lib/content/site';
import {
	buildWhatsappOrderMessage,
	formatCurrency,
	getBagTotals,
	isValidWhatsappNumber,
	normalizeBag,
	storageKey,
	type BagItem
} from '../lib/storefront';

function initStorefront() {
	const bagDrawer = document.getElementById('bag-drawer');
	const bagBackdrop = document.getElementById('bag-backdrop');
	const bagCount = document.getElementById('bag-count');
	const bagItems = document.getElementById('bag-items');
	const bagTotal = document.getElementById('bag-total');
	const checkoutButton = document.getElementById('checkout-button');

	if (
		!(bagDrawer instanceof HTMLElement) ||
		!(bagBackdrop instanceof HTMLElement) ||
		!(bagCount instanceof HTMLElement) ||
		!(bagItems instanceof HTMLElement) ||
		!(bagTotal instanceof HTMLElement) ||
		!(checkoutButton instanceof HTMLButtonElement)
	) {
		revealSections();
		return;
	}

	const ui = {
		bagDrawer,
		bagBackdrop,
		bagCount,
		bagItems,
		bagTotal,
		checkoutButton
	};

	const state = {
		bag: loadBag()
	};

	renderBag();
	bindEvents();
	initSizeSelector();
	revealSections();

	function bindEvents() {
		document.addEventListener('click', (event) => {
			const target = event.target;

			if (!(target instanceof HTMLElement)) {
				return;
			}

			const addButton = target.closest<HTMLElement>('[data-add-product]');
			const sizeChip = target.closest<HTMLElement>('[data-select-size]');
			const qtyButton = target.closest<HTMLElement>('[data-qty-change]');
			const removeButton = target.closest<HTMLElement>('[data-remove-product]');
			const openBagButton = target.closest<HTMLElement>('[data-open-bag]');
			const closeBagButton = target.closest<HTMLElement>('[data-close-bag]');

			if (sizeChip) {
				handleSizeSelect(sizeChip);
			}

			if (addButton) {
				const productId = addButton.getAttribute('data-add-product');
				const sku = addButton.getAttribute('data-selected-sku');

				if (productId && sku) {
					addToBag(productId, sku);
					openBag();
				}
			}

			if (qtyButton) {
				const sku = qtyButton.getAttribute('data-qty-change');
				const delta = Number(qtyButton.getAttribute('data-qty-delta'));

				if (sku && Number.isInteger(delta)) {
					updateQuantity(sku, delta);
				}
			}

			if (removeButton) {
				const sku = removeButton.getAttribute('data-remove-product');

				if (sku) {
					removeFromBag(sku);
				}
			}

			if (openBagButton) {
				openBag();
			}

			if (closeBagButton) {
				closeBag();
			}
		});

		ui.checkoutButton.addEventListener('click', () => {
			if (state.bag.length === 0) {
				return;
			}

			if (!isValidWhatsappNumber(siteConfig.whatsappNumber)) {
				window.alert('Please update the WhatsApp number before using direct checkout.');
				return;
			}

			const cleanNumber = siteConfig.whatsappNumber.replace(/\D/g, '');
			const message = buildWhatsappOrderMessage(state.bag);
			window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
		});

		ui.bagBackdrop.addEventListener('click', closeBag);

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeBag();
			}
		});
	}

	function handleSizeSelect(chip: HTMLElement) {
		const sku = chip.getAttribute('data-select-size');
		if (!sku) return;

		if (chip.classList.contains('is-disabled')) return;

		const selector = chip.closest('.size-selector');
		if (!selector) return;

		selector.querySelectorAll('[data-select-size]').forEach((el) => {
			el.classList.remove('is-active');
		});
		chip.classList.add('is-active');

		const addButton = document.querySelector<HTMLButtonElement>('[data-add-product][data-needs-size]');
		if (addButton) {
			addButton.setAttribute('data-selected-sku', sku);
			addButton.disabled = false;
		}

		const sizeHint = document.getElementById('size-hint');
		if (sizeHint) {
			const match = getVariantBySku(sku);
			if (match && match.variant.stock > 0 && match.variant.stock <= 3) {
				sizeHint.textContent = `Only ${match.variant.stock} left`;
				sizeHint.classList.add('is-low-stock');
			} else {
				sizeHint.textContent = '';
				sizeHint.classList.remove('is-low-stock');
			}
		}
	}

	function initSizeSelector() {
		const addButton = document.querySelector<HTMLButtonElement>('[data-add-product][data-needs-size]');
		if (addButton) {
			addButton.disabled = true;
		}
	}

	function renderBag() {
		const entries = state.bag
			.map((item) => {
				const match = getVariantBySku(item.sku);

				if (!match) {
					return null;
				}

				const { product, variant } = match;
				const lineTotal = variant.price * item.quantity;

				return `
					<article class="bag-item">
						<div class="bag-item-header">
							<div>
								<span class="bag-pill">${getCollectionLabel(product.category)}</span>
								<strong>${product.name}</strong>
								<p class="product-meta">${variant.color} · ${product.fit} · Size ${variant.size}</p>
							</div>
							<span>${formatCurrency(lineTotal)}</span>
						</div>

						<div class="bag-item-footer">
							<div class="bag-qty">
								<button type="button" aria-label="Decrease quantity" data-qty-change="${item.sku}" data-qty-delta="-1">-</button>
								<span>${item.quantity}</span>
								<button type="button" aria-label="Increase quantity" data-qty-change="${item.sku}" data-qty-delta="1">+</button>
							</div>

							<button type="button" class="footer-bag-link" data-remove-product="${item.sku}">
								Remove
							</button>
						</div>
					</article>
				`;
			})
			.filter(Boolean);

		const totals = getBagTotals(state.bag);

		ui.bagCount.textContent = String(totals.itemCount);
		ui.bagTotal.textContent = formatCurrency(totals.total);
		ui.checkoutButton.disabled = totals.itemCount === 0;

		if (entries.length === 0) {
			ui.bagItems.innerHTML = `
				<article class="bag-empty">
					<strong>Your bag is empty.</strong>
					<p class="bag-empty-copy">
						Browse the collection and add pieces you love.
					</p>
				</article>
			`;
			return;
		}

		ui.bagItems.innerHTML = entries.join('');
	}

	function addToBag(productId: string, sku: string) {
		const existing = state.bag.find((item) => item.sku === sku);

		if (existing) {
			existing.quantity += 1;
		} else {
			state.bag.push({ productId, sku, quantity: 1 });
		}

		persistBag();
		renderBag();
	}

	function updateQuantity(sku: string, delta: number) {
		state.bag = state.bag
			.map((item) =>
				item.sku === sku ? { ...item, quantity: item.quantity + delta } : item
			)
			.filter((item) => item.quantity > 0);

		persistBag();
		renderBag();
	}

	function removeFromBag(sku: string) {
		state.bag = state.bag.filter((item) => item.sku !== sku);
		persistBag();
		renderBag();
	}

	function openBag() {
		document.body.classList.add('bag-open');
		document.body.style.overflow = 'hidden';
		ui.bagDrawer.setAttribute('aria-hidden', 'false');
		ui.bagBackdrop.hidden = false;
	}

	function closeBag() {
		document.body.classList.remove('bag-open');
		document.body.style.overflow = '';
		ui.bagDrawer.setAttribute('aria-hidden', 'true');
		ui.bagBackdrop.hidden = true;
	}

	function persistBag() {
		try {
			window.localStorage.setItem(storageKey, JSON.stringify(state.bag));
		} catch {
			return;
		}
	}

	function loadBag(): BagItem[] {
		try {
			const raw = window.localStorage.getItem(storageKey);
			return normalizeBag(raw ? JSON.parse(raw) : []);
		} catch {
			return [];
		}
	}
}

function revealSections() {
	const revealNodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduceMotion || !('IntersectionObserver' in window)) {
		revealNodes.forEach((node) => node.classList.add('is-visible'));
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.18 }
	);

	revealNodes.forEach((node) => observer.observe(node));
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initStorefront, { once: true });
} else {
	initStorefront();
}
