const fetch = globalThis.fetch || require('node-fetch');
const crypto = require('crypto');

// Minimal Stripe signature verifier and webhook handler.
// Expects STRIPE_WEBHOOK_SECRET environment variable to verify incoming events.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return { statusCode: 500, body: 'Webhook secret not configured' };

  const sigHeader = event.headers['stripe-signature'] || event.headers['Stripe-Signature'] || '';
  const payload = event.body || '';

  // Verify signature. Stripe signs the payload as `${timestamp}.${payload}` and provides v1 signatures.
  function verifyStripeSignature(sigHeader, payload, secret) {
    try {
      const parts = sigHeader.split(',').map(p => p.split('='));
      const kv = {};
      parts.forEach(([k, v]) => { if (k && v) { if (!kv[k]) kv[k] = []; kv[k].push(v); } });
      const t = kv.t && kv.t[0];
      const v1s = kv.v1 || [];
      if (!t || v1s.length === 0) return false;

      const signedPayload = `${t}.${payload}`;
      const expectedSig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

      // compare against each v1 signature using timingSafeEqual
      const expectedBuf = Buffer.from(expectedSig);
      for (let s of v1s) {
        try {
          const sigBuf = Buffer.from(s);
          if (sigBuf.length !== expectedBuf.length) continue;
          if (crypto.timingSafeEqual(sigBuf, expectedBuf)) return true;
        } catch (e) {
          // ignore
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  const verified = verifyStripeSignature(sigHeader, payload, webhookSecret);
  if (!verified) {
    console.error('Stripe webhook signature verification failed');
    return { statusCode: 400, body: 'Signature verification failed' };
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(payload);
  } catch (err) {
    console.error('Invalid JSON payload for Stripe event', err);
    return { statusCode: 400, body: 'Invalid payload' };
  }

  try {
    const type = stripeEvent.type;
    // Handle checkout.session.completed and payment_intent.succeeded
    if (type === 'checkout.session.completed') {
      const session = stripeEvent.data.object || {};
      const amount = (session.amount_total || session.display_items?.[0]?.amount || 0) / 100;
      const currency = (session.currency || 'usd').toUpperCase();
      const id = session.id || '';
      const customer = session.customer_details || {};

      // Submit a Netlify form record for donations (form name: donation)
      const form = new URLSearchParams();
      form.append('form-name', 'donation');
      form.append('donor-name', customer.name || session.metadata?.donor_name || 'Stripe Donor');
      form.append('donor-email', customer.email || session.customer_email || '');
      form.append('amount', String(amount));
      form.append('currency', currency);
      form.append('payment-method', 'stripe-checkout');
      form.append('transaction-id', id);
      form.append('payment-status', 'completed');
      form.append('timestamp', new Date().toISOString());

      await fetch('https://'+(process.env.SITE_URL ? process.env.SITE_URL.replace(/^https?:\/\//,'') : (event.headers.host || 'localhost')) + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      }).catch(err => console.error('Failed to submit Netlify form record from webhook:', err));
    }

    if (type === 'payment_intent.succeeded') {
      const pi = stripeEvent.data.object || {};
      const amount = (pi.amount || 0) / 100;
      const currency = (pi.currency || 'usd').toUpperCase();
      const id = pi.id || '';

      const form = new URLSearchParams();
      form.append('form-name', 'donation');
      form.append('donor-name', pi.metadata?.donor_name || 'Stripe Donor');
      form.append('donor-email', pi.receipt_email || pi.metadata?.donor_email || '');
      form.append('amount', String(amount));
      form.append('currency', currency);
      form.append('payment-method', 'stripe-payment-intent');
      form.append('transaction-id', id);
      form.append('payment-status', 'completed');
      form.append('timestamp', new Date().toISOString());

      await fetch('https://'+(process.env.SITE_URL ? process.env.SITE_URL.replace(/^https?:\/\//,'') : (event.headers.host || 'localhost')) + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      }).catch(err => console.error('Failed to submit Netlify form record from webhook:', err));
    }

    // Respond 200 to acknowledge receipt
    return { statusCode: 200, body: 'Received' };
  } catch (err) {
    console.error('Error handling Stripe event:', err);
    return { statusCode: 500, body: 'Server error' };
  }
};
