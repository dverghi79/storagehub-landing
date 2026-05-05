// slack-notify.js — CJS version (for static HTML projects)
// Required env vars: SLACK_WEBHOOK_URL

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('[slack-notify] SLACK_WEBHOOK_URL env var not set');
    return res.status(200).json({ ok: false, reason: 'not_configured' });
  }

  const body = req.body || {};
  const productName = body.product || process.env.PRODUCT_NAME || 'StorageHub';
  const email = body.email || 'unknown';
  const firstName = body.firstName || body.first_name || '';
  const source = body.source || 'waitlist';
  const facilities = body.facilities || '';
  const pms = body.pms || '';

  const text = `:tada: *New ${productName} signup!*\n` +
    `*Email:* ${email}\n` +
    (firstName ? `*Name:* ${firstName}\n` : '') +
    (facilities ? `*Facilities:* ${facilities}\n` : '') +
    (pms ? `*Current PMS:* ${pms}\n` : '') +
    `*Source:* ${source}\n` +
    `*Time:* ${new Date().toISOString()}`;

  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const responseText = await r.text();
    if (responseText !== 'ok') {
      console.error('[slack-notify] Slack error:', responseText);
      return res.status(200).json({ ok: false, reason: responseText });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[slack-notify] fetch error:', err);
    return res.status(200).json({ ok: false, reason: 'fetch_failed' });
  }
};
