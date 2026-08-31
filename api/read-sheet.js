function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { cell += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c !== '\r') cell += c;
    }
  }
  row.push(cell); rows.push(row);
  return rows.filter(r => r.some(v => String(v || '').trim()));
}

function googleCsvUrls(input) {
  const url = new URL(input);
  if (!url.hostname.includes('docs.google.com')) return [input];
  const m = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!m) return [input];
  const id = m[1];
  const urls = [];

  let explicitGid = url.searchParams.get('gid');
  if (url.hash && url.hash.includes('gid=')) {
    const hm = url.hash.match(/gid=([0-9]+)/); if (hm) explicitGid = hm[1];
  }

  // Important: do NOT force gid=0. Some Google Form response sheets have a
  // default/exportable sheet that works without gid while gid=0 exports empty.
  if (explicitGid) urls.push(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${explicitGid}`);
  urls.push(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv`);
  urls.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`);
  return [...new Set(urls)];
}

module.exports = async (req, res) => {
  try {
    const input = req.query.url;
    if (!input) return res.status(400).json({ error: 'Missing sheet url' });
    const csvUrls = googleCsvUrls(input);
    let lastText = '', lastUrl = csvUrls[0], lastStatus = 0;

    for (const csvUrl of csvUrls) {
      const r = await fetch(csvUrl, { headers: { 'user-agent': 'NahrProposalGenerator/1.0' } });
      const text = await r.text();
      lastText = text; lastUrl = csvUrl; lastStatus = r.status;
      if (!r.ok) continue;
      if (/<!doctype html|<html/i.test(text) && /Sign in|accounts\.google/i.test(text)) {
        return res.status(403).json({ error: 'الشيت خاص أو غير قابل للتصدير. شاركه أو استخدم رابط CSV قابل للقراءة.' });
      }
      const rows = parseCsv(text);
      const headers = rows.shift() || [];
      if (headers.length && rows.length) {
        return res.status(200).json({ headers, rows, source: csvUrl, attemptedSources: csvUrls });
      }
    }

    if (/<!doctype html|<html/i.test(lastText)) {
      return res.status(403).json({ error: 'الشيت يرجع صفحة HTML بدل CSV. تأكد من مشاركة الشيت أو استخدم رابط تصدير CSV.' });
    }
    return res.status(422).json({ error: 'تم الوصول للشيت لكن CSV طلع فارغ. تأكد من رابط التبويب أو مشاركة الشيت.', source: lastUrl, attemptedSources: csvUrls, httpStatus: lastStatus });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to read sheet' });
  }
};
