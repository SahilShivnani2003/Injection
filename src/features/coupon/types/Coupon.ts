export interface Coupon {
    name: string;
    code: string;
    description: string;

    discountType: 'flat' | 'percentage';
    discountValue: number;

    isActive?: boolean;

    userId?: string | null;
    bookingId?: string | null;

    isUsed?: boolean;
    usedAt?: Date | null;
    expiresAt?: Date | null;

    createdAt?: Date;
    updatedAt?: Date;
}