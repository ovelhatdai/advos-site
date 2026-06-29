// Cloudflare Pages Function — POST /api/lead
// Recebe o lead do formulário, notifica por e-mail (Resend), encaminha pro Mautic
// (automação) e, opcionalmente, cria o Lead no Base44. Tudo via env vars (.env.example).
//
// Como o site é estático, este é o ÚNICO pedaço dinâmico. Pra mover o site pra outro host,
// reescreva só este arquivo (ex.: um endpoint Node/PHP na VPS) — o resto é HTML puro.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const nome = (data.nome || '').toString().trim();
  const email = (data.email || '').toString().trim();
  const telefone = (data.telefone || '').toString().trim();
  if (!nome || !email || !telefone) {
    return json({ ok: false, error: 'missing_fields' }, 422);
  }

  const lead = {
    nome,
    email,
    telefone,
    area_atuacao: (data.area_atuacao || '').toString(),
    tamanho_escritorio: (data.tamanho_escritorio || '').toString(),
    sistema_atual: (data.sistema_atual || '').toString(),
    origem: 'advos.ai',
  };

  const tasks = [];

  // 1) Notificação por e-mail via Resend
  if (env.RESEND_API_KEY && env.LEAD_NOTIFY_EMAIL) {
    const rows = Object.entries(lead)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#888">${k}</td><td><b>${v || '—'}</b></td></tr>`)
      .join('');
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.LEAD_FROM_EMAIL || 'site@advos.ai',
          to: env.LEAD_NOTIFY_EMAIL,
          subject: `Novo lead ADVOS: ${nome}`,
          html: `<h2>Novo lead do site advos.ai</h2><table>${rows}</table>`,
        }),
      }).catch(() => null)
    );
  }

  // 2) Encaminha pro Mautic (automação/nutrição)
  if (env.MAUTIC_FORM_URL) {
    const body = new URLSearchParams();
    body.set('mauticform[f_name]', nome);
    body.set('mauticform[email]', email);
    body.set('mauticform[phone]', telefone);
    body.set('mauticform[area]', lead.area_atuacao);
    tasks.push(
      fetch(env.MAUTIC_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }).catch(() => null)
    );
  }

  // 3) (Opcional) cria o Lead no Base44 — mesmo schema do app
  if (env.BASE44_APP_ID && env.BASE44_API_KEY) {
    tasks.push(
      fetch(`https://app.base44.com/api/apps/${env.BASE44_APP_ID}/entities/Lead`, {
        method: 'POST',
        headers: { api_key: env.BASE44_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, status: 'novo' }),
      }).catch(() => null)
    );
  }

  await Promise.allSettled(tasks);
  return json({ ok: true });
}
