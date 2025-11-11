import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function resolveSecretKey() {
  return process.env.STRIPE_TEST_SECRET_KEY || null;
}

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = resolveSecretKey();

  if (!secretKey) {
    throw new Error(
      "Stripe secret key não configurada. Defina STRIPE_SECRET_KEY ou STRIPE_TEST_SECRET_KEY."
    );
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  });

  return stripeClient;
}
