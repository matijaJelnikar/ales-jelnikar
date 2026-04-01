import type { APIRoute } from 'astro';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function isStr(v: unknown): v is string { return typeof v === 'string'; }

function json(status: number, message: string) {
  return Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tdRow(label: string, value: string) {
  return `<tr style="border-bottom:1px solid #f0f0f0;">
    <td style="padding:8px 12px;font-weight:600;width:220px;vertical-align:top;color:#666;font-size:14px;">${esc(label)}</td>
    <td style="padding:8px 12px;font-size:14px;">${esc(value)}</td>
  </tr>`;
}

function sectionHeader(title: string) {
  return `<tr><td colspan="2" style="padding:10px 12px 6px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;background:#f9f9f9;">${esc(title)}</td></tr>`;
}

const KRITINA: Record<string, string> = {
  opecna: 'Opečna (glinaste ploščice)',
  betonska: 'Betonska (betonske ploščice)',
  salonitna: 'Salonitna (valovita plošča)',
  plocevina: 'Pločevina',
  bitumenska: 'Bitumenska (ravna streha)',
  drugo: 'Drugo',
};

const OBDELAVA: Record<string, string> = {
  gips: 'Gips',
  les: 'Les',
  ni: 'Ni obdelano (prazna podstreha)',
};

const ZAMAKA: Record<string, string> = {
  pozimi: 'Samo pozimi',
  poleti: 'Samo poleti',
  celo_leto: 'Celo leto',
  ne_zamaka: 'Ne zamaka (druga težava)',
};

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return json(400, 'Neveljaven zahtevek.'); }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return json(400, 'Neveljaven zahtevek.');
  const b = raw as Record<string, unknown>;

  if (b.website) return json(400, 'Neveljaven zahtevek.');

  const type = b.type;
  if (type !== 'montaza' && type !== 'servis') return json(400, 'Neveljaven tip.');

  // Shared contact validation
  if (!isStr(b.ime) || !b.ime.trim()) return json(400, 'Vnesite ime in priimek.');
  if (b.ime.length > 100) return json(400, 'Ime je predolgo.');
  if (!isStr(b.telefon) || !b.telefon.trim()) return json(400, 'Vnesite telefonsko številko.');
  if (b.telefon.length > 20) return json(400, 'Telefonska številka je predolga.');
  const emailRaw = isStr(b.email) ? b.email.trim() : '';
  if (emailRaw) {
    if (emailRaw.length > 200) return json(400, 'E-naslov je predolg.');
    if (!EMAIL_REGEX.test(emailRaw)) return json(400, 'Neveljaven e-naslov.');
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return json(500, 'Pošiljanje ni uspelo. Prosimo, pokličite nas neposredno.');

  const toEmail = import.meta.env.CONTACT_EMAIL ?? 'info@alesjelnikar.si';
  const ime = b.ime.trim();
  const telefon = b.telefon.trim();

  let subject: string;
  let html: string;
  let attachments: { filename: string; content: string }[] | undefined;

  if (type === 'montaza') {
    const { sirina, visina, vrsta_kritine, notranja_obdelava, staro_okno, tip_dela, tip_okvirja, odpiranje, zasteklitev } = b;

    if (!isStr(sirina) || !sirina.trim() || isNaN(Number(sirina))) return json(400, 'Vnesite širino odprtine.');
    if (!isStr(visina) || !visina.trim() || isNaN(Number(visina))) return json(400, 'Vnesite višino odprtine.');
    if (!isStr(vrsta_kritine) || !Object.keys(KRITINA).includes(vrsta_kritine)) return json(400, 'Izberite vrsto kritine.');
    if (!isStr(notranja_obdelava) || !Object.keys(OBDELAVA).includes(notranja_obdelava)) return json(400, 'Izberite notranjo obdelavo.');
    if (!isStr(staro_okno) || !['da', 'ne'].includes(staro_okno)) return json(400, 'Označite obstoječe okno.');
    if (!isStr(tip_dela) || !['prazna', 'soba'].includes(tip_dela)) return json(400, 'Izberite tip dela.');
    if (!isStr(tip_okvirja) || !['plastificirano', 'leseno'].includes(tip_okvirja)) return json(400, 'Izberite tip okvirja.');
    if (!isStr(odpiranje) || !['rocno', 'elektricno'].includes(odpiranje)) return json(400, 'Izberite tip odpiranja.');
    if (!isStr(zasteklitev) || !['dvoslojno', 'troslojno'].includes(zasteklitev)) return json(400, 'Izberite zasteklitev.');

    const opomba = isStr(b.opomba) ? b.opomba.slice(0, 2000) : '';
    const vod = isStr(b.visina_od_tal) ? b.visina_od_tal.slice(0, 10) : '';
    const vpz = isStr(b.visina_parapeta) ? b.visina_parapeta.slice(0, 10) : '';
    const ss = isStr(b.staro_sirina) ? b.staro_sirina.slice(0, 10) : '';
    const sv = isStr(b.staro_visina) ? b.staro_visina.slice(0, 10) : '';

    subject = `Nova montaža – ${ime.replace(/[\r\n]/g, '')}`;
    html = `<div style="font-family:Arial,sans-serif;max-width:640px;border:1px solid #e0e0e0;">
      <div style="background:#bb0013;color:white;padding:16px 20px;">
        <h2 style="margin:0;font-size:18px;">Nova montaža – Povpraševanje</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${sectionHeader('Kontaktni podatki')}
        ${tdRow('Ime in priimek', ime)}
        ${tdRow('Telefon', telefon)}
        ${emailRaw ? tdRow('E-naslov', emailRaw) : ''}
        ${sectionHeader('Dimenzije odprtine med špirovci')}
        ${tdRow('Širina', sirina + ' cm')}
        ${tdRow('Višina', visina + ' cm')}
        ${sectionHeader('Streha in notranjost')}
        ${tdRow('Vrsta kritine', KRITINA[vrsta_kritine])}
        ${tdRow('Notranja obdelava', OBDELAVA[notranja_obdelava])}
        ${sectionHeader('Obstoječe stanje')}
        ${tdRow('Staro okno v odprtini', staro_okno === 'da' ? 'Da' : 'Ne')}
        ${staro_okno === 'da' && ss ? tdRow('Zunanji okvir – širina', ss + ' cm') : ''}
        ${staro_okno === 'da' && sv ? tdRow('Zunanji okvir – višina', sv + ' cm') : ''}
        ${tdRow('Tip dela', tip_dela === 'prazna' ? 'Prazna podstreha' : 'Soba z dokončanim stropom')}
        ${sectionHeader('Višine')}
        ${tdRow('Višina od tal do vrha okna', vod ? vod + ' cm' : '—')}
        ${tdRow('Višina parapetnega zidu', vpz ? vpz + ' cm' : '—')}
        ${sectionHeader('Vrsta okna')}
        ${tdRow('Okvir', tip_okvirja === 'plastificirano' ? 'Plastificirano (PVC)' : 'Leseno')}
        ${tdRow('Odpiranje', odpiranje === 'rocno' ? 'Ročno' : 'Električno')}
        ${tdRow('Zasteklitev', zasteklitev === 'dvoslojno' ? 'Dvoslojno' : 'Troslojno')}
        ${opomba ? `${sectionHeader('Opombe')}<tr><td colspan="2" style="padding:10px 12px;white-space:pre-wrap;font-size:14px;">${esc(opomba)}</td></tr>` : ''}
      </table>
    </div>`;

  } else {
    const { starost_okna, opis_problema, kdaj_zamaka, foto_base64, foto_naziv } = b;

    if (!isStr(starost_okna) || !starost_okna.trim() || isNaN(Number(starost_okna))) return json(400, 'Vnesite starost okna.');
    const starostNum = parseInt(starost_okna, 10);
    if (starostNum < 0 || starostNum > 200) return json(400, 'Neveljava starost okna.');
    if (!isStr(opis_problema) || !opis_problema.trim()) return json(400, 'Opišite problem.');
    if (opis_problema.length > 2000) return json(400, 'Opis je predolg (največ 2000 znakov).');
    if (!isStr(kdaj_zamaka) || !Object.keys(ZAMAKA).includes(kdaj_zamaka)) return json(400, 'Označite kdaj zamaka.');

    if (foto_base64 !== undefined) {
      if (!isStr(foto_base64)) return json(400, 'Neveljavna fotografija.');
      if (foto_base64.length > 7_000_000) return json(400, 'Fotografija je prevelika (največ 5 MB).');
      const naziv = isStr(foto_naziv) && foto_naziv.trim() ? foto_naziv.trim().slice(0, 200) : 'fotografija.jpg';
      attachments = [{ filename: naziv, content: foto_base64 }];
    }

    subject = `Servis – ${ime.replace(/[\r\n]/g, '')}`;
    html = `<div style="font-family:Arial,sans-serif;max-width:640px;border:1px solid #e0e0e0;">
      <div style="background:#bb0013;color:white;padding:16px 20px;">
        <h2 style="margin:0;font-size:18px;">Servis strešnega okna – Povpraševanje</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${sectionHeader('Kontaktni podatki')}
        ${tdRow('Ime in priimek', ime)}
        ${tdRow('Telefon', telefon)}
        ${emailRaw ? tdRow('E-naslov', emailRaw) : ''}
        ${sectionHeader('Podatki o oknu')}
        ${tdRow('Starost okna', starost_okna + ' let')}
        ${attachments ? tdRow('Fotografija ploščice', 'Priložena (glejte prilogo)') : tdRow('Fotografija ploščice', '—')}
        ${sectionHeader('Opis težave')}
        ${tdRow('Kdaj zamaka/pušča', ZAMAKA[kdaj_zamaka])}
        <tr><td colspan="2" style="padding:10px 12px;white-space:pre-wrap;font-size:14px;">${esc(opis_problema)}</td></tr>
      </table>
    </div>`;
  }

  try {
    const payload: Record<string, unknown> = {
      from: 'Spletna stran <noreply@alesjelnikar.si>',
      to: toEmail,
      subject,
      html,
    };
    if (emailRaw) payload.reply_to = emailRaw;
    if (attachments?.length) payload.attachments = attachments;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[inquiry] Resend:', err);
      return json(500, 'Napaka pri pošiljanju. Prosimo, pokličite nas neposredno.');
    }

    return Response.json(
      { message: 'Povpraševanje je bilo uspešno poslano. Kontaktirali vas bomo v najkrajšem možnem času.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[inquiry] Napaka:', err);
    return json(500, 'Napaka pri pošiljanju. Prosimo, pokličite nas neposredno.');
  }
};
