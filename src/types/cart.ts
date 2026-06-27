export type CartItem = {
  giftId: string;
  vendorId: string;
  title: string;
  priceCents: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

export type CartCheckoutDetails = {
  recipientName: string;
  recipientAddress?: string;
  giftMessage?: string;
  deliveryDate?: string;
};

export function cartItemsEqual(a: CartItem[], b: CartItem[]): boolean {
  if (a.length !== b.length) return false;

  for (let index = 0; index < a.length; index += 1) {
    const left = a[index];
    const right = b[index];

    if (
      left.giftId !== right.giftId ||
      left.quantity !== right.quantity ||
      left.priceCents !== right.priceCents ||
      left.stock !== right.stock ||
      left.title !== right.title ||
      left.imageUrl !== right.imageUrl ||
      left.vendorId !== right.vendorId
    ) {
      return false;
    }
  }

  return true;
}
