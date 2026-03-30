import type { APIRoute } from 'astro';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function json400(message: string) {
  return Response.json({ message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
}

function json500(message: string) {
  return Response.json({ message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json400('Neveljaven zahtevek.');
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return json400('Neveljaven zahtevek.');
  }

  const body = raw as Record<string, unknown>;

  // Honeypot — bots fill this hidden field, humans don't
  if (body.website) {
    return json400('Neveljaven zahtevek.');
  }

  const { ime, email, telefon, opis, datum } = body;

  // Type guards — reject if any required field isn't a plain string
  if (!isString(ime) || !isString(email) || !isString(opis)) {
    return json400('Neveljaven zahtevek.');
  }
  if (telefon !== undefined && !isString(telefon)) return json400('Neveljaven zahtevek.');
  if (datum !== undefined && !isString(datum)) return json400('Neveljaven zahtevek.');

  // Required fields
  if (!ime.trim() || !email.trim() || !opis.trim()) {
    return json400('Prosimo, izpolnite vsa obvezna polja.');
  }

  // Length limits
  if (ime.length > 100) return json400('Ime je predolgo (največ 100 znakov).');
  if (email.length > 200) return json400('E-naslov je predolg.');
  if (opis.length > 2000) return json400('Sporočilo je predolgo (največ 2000 znakov).');
  if (telefon && telefon.length > 20) return json400('Telefonska številka je predolga.');
  if (datum && datum.length > 10) return json400('Neveljaven datum.');

  // Email format
  if (!EMAIL_REGEX.test(email)) {
    return json400('Neveljaven e-naslov.');
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY ni nastavljen');
    return json500('Pošiljanje ni uspelo. Prosimo, pokličite nas neposredno.');
  }

  const toEmail = import.meta.env.CONTACT_EMAIL ?? 'info@alesjelnikar.si';

  const html = `
    <h2>Novo povpraševanje – Aleš Jelnikar</h2>
    <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="font-weight:bold;width:140px;">Ime in priimek:</td><td>${escapeHtml(ime)}</td></tr>
      <tr><td style="font-weight:bold;">E-naslov:</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      ${telefon ? `<tr><td style="font-weight:bold;">Telefon:</td><td><a href="tel:${escapeHtml(telefon)}">${escapeHtml(telefon)}</a></td></tr>` : ''}
      ${datum ? `<tr><td style="font-weight:bold;">Željeni datum:</td><td>${escapeHtml(datum)}</td></tr>` : ''}
      <tr><td style="font-weight:bold;vertical-align:top;">Sporočilo:</td><td style="white-space:pre-wrap;">${escapeHtml(opis)}</td></tr>
    </table>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Spletna stran <noreply@alesjelnikar.si>',
        to: toEmail,
        reply_to: email,
        subject: `Novo povpraševanje od ${ime.replace(/[\r\n]/g, '')}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[contact] Resend API napaka:', err);
      return json500('Napaka pri pošiljanju. Prosimo, pokličite nas neposredno.');
    }

    return Response.json(
      { message: 'Sporočilo je bilo uspešno poslano. Odgovorili vam bomo v najkrajšem možnem času.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[contact] Napaka pri pošiljanju:', err);
    return json500('Napaka pri pošiljanju. Prosimo, pokličite nas neposredno.');
  }
};
