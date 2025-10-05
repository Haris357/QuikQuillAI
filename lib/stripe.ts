import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default stripe;

export const SUBSCRIPTION_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;