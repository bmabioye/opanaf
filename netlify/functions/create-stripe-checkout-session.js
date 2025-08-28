const fetch = globalThis.fetch;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const body = JSON.parse(event.body || '{}');
  const amount = Math.round((body.amount || 0) * 100); // in cents
  const currency = body.currency || 'usd';
  const successUrl = body.success_url || (process.env.SITE_URL ? `${process.env.SITE_URL}/youth-empowerment.html?payment=success` : '/youth-empowerment.html?payment=success');
  const cancelUrl = body.cancel_url || (process.env.SITE_URL ? `${process.env.SITE_URL}/youth-empowerment.html?payment=cancel` : '/youth-empowerment.html?payment=cancel');

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { statusCode: 500, body: 'Stripe secret not configured' };

  try {
    // Create Checkout Session via Stripe API
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('mode', 'payment');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('line_items[0][price_data][currency]', currency);
    params.append('line_items[0][price_data][product_data][name]', body.description || 'OPANAF donation');
    params.append('line_items[0][price_data][unit_amount]', String(amount));
    params.append('line_items[0][quantity]', '1');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await res.json();
    if (data.error) return { statusCode: 400, body: JSON.stringify(data) };
    // Return the session URL to redirect the client
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: data.url, id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
