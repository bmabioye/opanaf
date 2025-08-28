exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
      paypalEnv: process.env.PAYPAL_ENV || 'sandbox'
    })
  };
};
