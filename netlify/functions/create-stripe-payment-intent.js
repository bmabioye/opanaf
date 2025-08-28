const fetch = globalThis.fetch || require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const body = JSON.parse(event.body || '{}');
  const amount = Math.round((body.amount || 0) * 100); // dollars -> cents
  const currency = body.currency || 'usd';

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { statusCode: 500, body: 'Stripe secret not configured' };

  try {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: String(amount),
        currency,
        description: body.description || 'OPANAF donation',
        receipt_email: body.receipt_email || ''
      })
    });
    const data = await res.json();
    if (data.error) return { statusCode: 400, body: JSON.stringify(data) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_secret: data.client_secret, id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
