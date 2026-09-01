const sampleHeaders = [
  'Timestamp','Email','الاسم','القسم','المسمى الوظيفي','سنوات خبرتك في هذا المجال','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه في عملك اليومي؟','استخدامك لأدوات الذكاء الاصطناعي حتى اليوم','الأدوات التي جربتها','أبعد ما وصلت إليه في استخدامها','صياغة طلب واضح يعطيني نتيجة دقيقة من أول مرة','الحكم على جودة المخرَج ومتى لا يصلح للاستخدام','استخدام الأداة على ملفات وبيانات عملي الحقيقية','بناء خطوة أتمتة تعمل دون تدخلي في كل مرة','اختر كل ما ينطبق عليك','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة من يومك تلقائيًا، أي مهمة تختار؟','مجموع الساعات الأسبوعية التي تقضيها في مهام متكررة يمكن أتمتتها','استعدادك لتطبيق ما تتعلمه فعليًا في عملك بعد التدريب'
];
const sampleRows = [
  ['2026-08-31','reem@example.com','ريم أحمد','الموارد البشرية','أخصائية تطوير موظفين','٦ سنوات','تجميع تقارير الحضور والتدريب','5','تلخيص ملاحظات الاجتماعات','3','تحديث ملفات المتدربين','2','تقارير، عروض، رسائل بريدية','أستخدمها أحيانًا','ChatGPT, Gemini','أكتب مسودات وأراجعها يدويًا','3','3','2','1','عدم وضوح حالات الاستخدام، الخوف من الأخطاء، عدم وجود بيانات مرتبة','بناء قوالب وأتمتة للتقارير','تجهيز تقرير التدريب الأسبوعي وإرساله تلقائيًا','10','4'],
  ['2026-08-31','fahad@example.com','فهد سالم','المبيعات','مشرف مبيعات','٨ سنوات','كتابة متابعة العملاء','4','تجهيز عروض الأسعار','3','تلخيص مكالمات العملاء','2','رسائل عملاء، عروض، تقارير مبيعات','أستخدمها أسبوعيًا','ChatGPT, Copilot','أستخدمها في المسودات والتلخيص','4','3','2','2','عدم معرفة أفضل طريقة للطلب، الخوف من مشاركة بيانات حساسة','تسريع كتابة العروض والمتابعات','تحويل ملاحظات المكالمة إلى رسالة متابعة وعرض مختصر','9','5'],
  ['2026-08-31','sara@example.com','سارة علي','خدمة العملاء','قائدة فريق','٥ سنوات','تصنيف شكاوى العملاء','6','كتابة ردود متكررة','4','تقرير نهاية اليوم','2','ردود، تقارير، تصنيفات','لم أستخدمها إلا قليلًا','Gemini','تجربة أسئلة بسيطة','2','2','1','1','لا أعرف من أين أبدأ، لا توجد قوالب، ضعف الثقة في المخرجات','استخدام AI بأمان في خدمة العملاء','تصنيف الشكاوى واقتراح الرد المناسب تلقائيًا','12','4']
];

let state = { headers: sampleHeaders, rows: sampleRows, source: 'sample' };
let tableMode = 'important';
const $ = (id) => document.getElementById(id);
const arabicDigits = {'٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
const importantColumns = ['الاسم','القسم','المسمى الوظيفي','سنوات خبرتك','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه','استخدامك لأدوات الذكاء الاصطناعي','أبعد ما وصلت إليه','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة','مجموع الساعات الأسبوعية','استعدادك لتطبيق'];

function normalize(s){ return String(s||'').replace(/[\u064B-\u065F]/g,'').trim(); }
function toNum(v){ const s=String(v||'').replace(/[٠-٩]/g,d=>arabicDigits[d]).match(/-?\d+(\.\d+)?/); return s?Number(s[0]):0; }
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function splitMulti(v){ return String(v||'').split(/[,،;؛\n]+/).map(s=>s.trim()).filter(Boolean); }
function countBy(items){ const m=new Map(); items.filter(Boolean).forEach(x=>m.set(x,(m.get(x)||0)+1)); return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function parseHours(v){
  const raw = String(v||'').trim();
  const s = raw.replace(/[٠-٩]/g,d=>arabicDigits[d]);
  if (!s) return 0;
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
  if (!nums.length) return 0;
  if (/اقل|أقل|less/i.test(raw)) return nums[0] / 2;
  if (/اكثر|أكثر|more|\+/i.test(raw)) return nums[0] + Math.min(8, Math.max(2, nums[0] * 0.17));
  if (nums.length >= 2) return (nums[0]+nums[1])/2;
  return nums[0];
}
function pick(row, names){
  const headers = state.headers.map(h => normalize(h));
  for (const name of names) {
    const n = normalize(name);
    const exact = headers.findIndex(h => h === n);
    if (exact >= 0 && row[exact]) return row[exact];
  }
  for (const name of names) {
    const n = normalize(name);
    const idx = headers.findIndex(h => h.includes(n));
    if (idx >= 0 && row[idx]) return row[idx];
  }
  return '';
}
function personName(row){ return pick(row,['الاسم']) || 'غير محدد'; }
function repeatedTasks(row){
  return [
    [pick(row,['المهمة المتكررة الأولى']), pick(row,['ساعاتها أسبوعيًا'])],
    [pick(row,['المهمة المتكررة الثانية']), pick(row,['ساعاتها أسبوعيًا 2'])],
    [pick(row,['المهمة المتكررة الثالثة']), pick(row,['ساعاتها أسبوعيًا 3'])]
  ].filter(([task])=>task);
}
function rowWasteHours(row){
  const baseline = parseHours(pick(row,['مجموع الساعات الأسبوعية']));
  const taskHours = repeatedTasks(row).reduce((s,[,h])=>s+parseHours(h),0);
  return baseline || taskHours;
}
function dedupeRows(rows){
  const seen = new Set(), unique = [], duplicates = [];
  for (const row of rows) {
    const name = normalize(pick(row,['الاسم'])).toLowerCase();
    const dept = normalize(pick(row,['القسم'])).toLowerCase();
    const email = normalize(pick(row,['Email','Email Address','البريد','الإيميل'])).toLowerCase();
    const keys = [email && `email:${email}`, (name || dept) && `person:${name}|${dept}`].filter(Boolean);
    if (keys.some(k => seen.has(k))) duplicates.push({ key: keys[0] || '', name: personName(row) });
    else { keys.forEach(k => seen.add(k)); unique.push(row); }
  }
  return { unique, duplicates };
}
function selectedColumnIndexes(){
  if (tableMode === 'all') return state.headers.map((_,i)=>i);
  return state.headers.map((h,i)=>({h,i})).filter(({h})=>importantColumns.some(p=>normalize(h).includes(normalize(p)))).map(x=>x.i);
}
function cleanData(){
  const deduped = dedupeRows(state.rows || []);
  return deduped.unique.map(row => Object.fromEntries(state.headers.map((h,i)=>[h, row[i] || ''])));
}
function buildAggregate(){
  const rawRows = state.rows || [];
  const deduped = dedupeRows(rawRows);
  const rows = deduped.unique;
  const depts = countBy(rows.map(r=>pick(r,['القسم'])));
  const titles = countBy(rows.map(r=>pick(r,['المسمى الوظيفي'])));
  const priorities = countBy(rows.map(r=>pick(r,['أولويتك الأولى من التدريب'])));
  const tools = countBy(rows.flatMap(r=>splitMulti(pick(r,['الأدوات التي جربتها']))));
  const totalWaste = rows.reduce((s,r)=>s+rowWasteHours(r),0);
  const taskCount = rows.reduce((s,r)=>s+repeatedTasks(r).length,0);
  return { rows, people: rows.length, rawCount: rawRows.length, duplicateCount: deduped.duplicates.length, depts, titles, priorities, tools, totalWaste, taskCount };
}
function topList(pairs, max=6){ return pairs.slice(0,max).map(([k,v])=>`<li>${escapeHtml(k)} <small>(${v})</small></li>`).join('') || '<li>غير محدد</li>'; }
function renderOverview(){
  const a = buildAggregate();
  $('companyOverview').innerHTML = `<div class="overview-grid">
    <div><b>${a.people}</b><span>العينة بعد إزالة التكرار</span></div>
    <div><b>${a.rawCount}</b><span>الردود الخام</span></div>
    <div><b>${a.depts.length}</b><span>الأقسام</span></div>
    <div><b>${Math.round(a.totalWaste).toLocaleString('ar-SA')}</b><span>ساعات أسبوعية متكررة</span></div>
  </div><p class="overview-note">التكرارات المحذوفة: ${a.duplicateCount}. هذه الصفحة تعرض البيانات فقط ولا تولّد عرضًا.</p>`;
  $('schemaSummary').innerHTML = `<div class="overview-grid">
    <div><b>${state.headers.length}</b><span>الأعمدة المقروءة</span></div>
    <div><b>${a.taskCount}</b><span>مهام متكررة مذكورة</span></div>
    <div><b>${a.titles.length}</b><span>مسميات وظيفية</span></div>
    <div><b>${a.tools.length}</b><span>أدوات AI مذكورة</span></div>
  </div><div class="two-col"><div><h3>أهم الأولويات</h3><ul>${topList(a.priorities,5)}</ul></div><div><h3>الأدوات المجربة</h3><ul>${topList(a.tools,5)}</ul></div></div>`;
}
function renderTable(){
  const a = buildAggregate();
  const idxs = selectedColumnIndexes();
  if (!a.rows.length) { $('dataTable').innerHTML = '<p class="empty">لا توجد بيانات بعد.</p>'; return; }
  const head = idxs.map(i=>`<th>${escapeHtml(state.headers[i])}</th>`).join('');
  const body = a.rows.map(row=>`<tr>${idxs.map(i=>`<td>${escapeHtml(row[i] || '')}</td>`).join('')}</tr>`).join('');
  $('dataTable').innerHTML = `<div class="table-scroll"><table class="generated-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function render(){ renderOverview(); renderTable(); }
function setStatus(msg){ $('loadStatus').textContent = msg; }
async function loadSheet(){
  const url=$('sheetUrl').value.trim();
  if(!url){ setStatus('ضع رابط Google Sheet أو استخدم البيانات التجريبية.'); return; }
  setStatus('جاري قراءة الشيت بنفس طريقة المولد الحالي...');
  try {
    const res=await fetch('/api/read-sheet?url='+encodeURIComponent(url));
    const data=await res.json();
    if(!res.ok){ setStatus(data.error || 'تعذر قراءة الشيت.'); return; }
    state={headers:data.headers, rows:data.rows, source:data.source || url};
    render();
    setStatus(`تمت قراءة ${data.rows.length} رد من الشيت. تم تنظيفها وعرضها بدون توليد عرض.`);
  } catch(e) {
    setStatus('تعذر قراءة الشيت: ' + (e.message || 'خطأ غير معروف'));
  }
}
function download(name, type, text){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href); }
function cleanCsv(){
  const rows = cleanData();
  const esc = (v)=>`"${String(v ?? '').replace(/"/g,'""')}"`;
  return [state.headers.map(esc).join(','), ...rows.map(r=>state.headers.map(h=>esc(r[h])).join(','))].join('\n');
}
function compactForDiagnostic(){
  const rows = buildAggregate().rows;
  return rows.map(r=>({
    name: personName(r),
    email: pick(r,['Email','Email Address','البريد','الإيميل']),
    dept: pick(r,['القسم']),
    title: pick(r,['المسمى الوظيفي']),
    years: pick(r,['سنوات خبرتك','سنوات الخبرة']),
    tasks: repeatedTasks(r).map(([task,hours])=>({task,hours})),
    dailyOutput: pick(r,['ما أكثر ما تنتجه']),
    aiUsage: pick(r,['استخدامك لأدوات الذكاء الاصطناعي','استخدام أدوات الذكاء الاصطناعي']),
    tools: pick(r,['الأدوات التي جربتها']),
    furthestUse: pick(r,['أبعد ما وصلت إليه']),
    promptScore: toNum(pick(r,['صياغة طلب واضح','تقييم صياغة الطلب'])),
    qualityScore: toNum(pick(r,['الحكم على جودة','تقييم الحكم على جودة'])),
    dataScore: toNum(pick(r,['ملفات وبيانات عملي','استخدام AI على بيانات العمل','تقييم استخدام AI على بيانات العمل'])),
    automationScore: toNum(pick(r,['بناء خطوة أتمتة','تقييم بناء الأتمتة'])),
    barriers: pick(r,['اختر كل ما ينطبق عليك','العوائق الحالية']),
    trainingDemand: pick(r,['أولويتك الأولى من التدريب','أولوية التدريب']),
    automationWish: pick(r,['لو اختفت مهمة واحدة','المهمة التي يتمنى الموظف']),
    wasteHours: rowWasteHours(r),
    employeeAutomatableOpinion: pick(r,['مجموع الساعات الأسبوعية','مجموع الساعات الأسبوعية القابلة للأتمتة']),
    readiness: toNum(pick(r,['استعدادك لتطبيق','الاستعداد للتطبيق']))
  }));
}
function listItems(items){
  const arr = Array.isArray(items) ? items : (items && typeof items === 'object' ? Object.entries(items).map(([k,v])=>`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) : (items ? [items] : []));
  return arr.slice(0,8).map(x=>`<li>${escapeHtml(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('') || '<li>غير متوفر من البيانات الحالية.</li>';
}
function money(n){ return Number.isFinite(Number(n)) ? `${Math.round(Number(n)).toLocaleString('ar-SA')} ريال` : 'غير محسوب'; }
function diagnosticTable(rows, cols){
  if(!rows || !rows.length) return '<p>غير متوفر من البيانات الحالية.</p>';
  return `<table class="generated-table"><thead><tr>${cols.map(c=>`<th>${escapeHtml(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,8).map(r=>`<tr>${cols.map(c=>`<td>${escapeHtml(r[c.key] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function renderDiagnostic(d){
  const capability = diagnosticTable(d.capabilityLadder, [{key:'label',label:'المهارة'}, {key:'average',label:'المتوسط'}, {key:'lowPct',label:'% ١–٢'}, {key:'highPct',label:'% ٤–٥'}, {key:'interpretation',label:'المعنى'}]);
  const clusters = diagnosticTable(d.processClusters, [{key:'name',label:'العملية'}, {key:'employeeCount',label:'الموظفون'}, {key:'weeklyHours',label:'ساعات/أسبوع'}, {key:'automationFeasibility',label:'قابلية الأتمتة'}, {key:'intervention',label:'التدخل'}]);
  const beforeAfter = (d.beforeAfter||[]).slice(0,6).map(x=>`<div class="before-after-card"><h3>${escapeHtml(x.area)}</h3><div class="three-state"><div><b>قبل</b><p>${escapeHtml(x.before)}</p></div><div><b>التدخل</b><p>${escapeHtml(x.intervention)}</p></div><div><b>بعد</b><p>${escapeHtml(x.after)}</p></div></div></div>`).join('') || '<p>غير متوفر من البيانات الحالية.</p>';
  $('diagnosticOutput').innerHTML = `<div class="cover"><img src="/logo-nahr.svg" alt="نهر"><h1>AI Transformation Diagnostic</h1><p>Current State → Intervention → Target State</p></div>
    <h2>١. Executive Summary</h2><p>${escapeHtml(d.executiveSummary || '')}</p>
    <div class="bi-kpis"><article class="bi-kpi"><span>الردود الفريدة</span><b>${escapeHtml(d.dataIntegrity?.uniqueRespondents ?? '')}</b><small>بعد فحص البيانات</small></article><article class="bi-kpi"><span>الساعات الأسبوعية المعلنة</span><b>${escapeHtml(d.wasteEngine?.reportedWeeklyHours ?? '')}</b><small>Reported capacity</small></article><article class="bi-kpi"><span>FTE equivalent</span><b>${escapeHtml(d.wasteEngine?.fteEquivalent ?? '')}</b><small>${escapeHtml(d.wasteEngine?.assumption || '')}</small></article><article class="bi-kpi"><span>Consulting Fee</span><b>${money(d.pricing?.consultingFee)}</b><small>${escapeHtml(d.pricing?.rule || '')}</small></article></div>
    <h2>٢. Evidence Standard</h2><ul>${listItems(d.evidenceStandard)}</ul>
    <h2>٣. Data Integrity Scan</h2><table class="generated-table"><tr><th>البند</th><th>القيمة</th></tr><tr><td>Total responses</td><td>${escapeHtml(d.dataIntegrity?.totalResponses ?? '')}</td></tr><tr><td>Unique respondents</td><td>${escapeHtml(d.dataIntegrity?.uniqueRespondents ?? '')}</td></tr><tr><td>Duplicates</td><td>${escapeHtml(d.dataIntegrity?.duplicates ?? '')}</td></tr><tr><td>Data quality</td><td>${escapeHtml(d.dataIntegrity?.dataQualityScore ?? '')}</td></tr></table>
    <h2>٤. AI Capability Ladder</h2>${capability}
    <h2>٥. Contradiction Engine</h2><ul>${listItems(d.contradictions)}</ul>
    <h2>٦. Automation Blindness Index</h2><ul>${listItems(d.automationBlindness)}</ul>
    <h2>٧. Process Clustering</h2>${clusters}
    <h2>٨. Need vs Demand Gap</h2><ul>${listItems(d.needVsDemandGap)}</ul>
    <h2>٩. Barrier Decomposition</h2>${diagnosticTable(d.barrierDecomposition, [{key:'barrier',label:'العائق'}, {key:'type',label:'نوعه'}, {key:'intervention',label:'التدخل'}])}
    <h2>١٠. Before → Intervention → After</h2>${beforeAfter}
    <h2>١١. Engagement Architecture</h2><ol>${listItems(d.engagementArchitecture).replaceAll('<li>','<li>')}</ol>
    <h2>١٢. Value Case & Success Measurement</h2><p>الفرصة النظرية: ${escapeHtml(d.valueCase?.theoreticalOpportunityHours ?? '')} ساعة. الهدف الواقعي: ${escapeHtml(d.valueCase?.realisticTargetHours ?? '')} ساعة. ${escapeHtml(d.valueCase?.measurableValue || '')}</p><ul>${listItems(d.successMeasurement)}</ul>`;
}
async function runDiagnostic(){
  const responses = compactForDiagnostic();
  if(!responses.length){ setStatus('حمّل الشيت أولًا قبل تشغيل التشخيص.'); return; }
  $('diagnosticOutput').innerHTML = '<p class="empty">جاري تشغيل محرك التشخيص الجديد...</p>';
  setStatus('جاري تشغيل التشخيص الجديد من البيانات المستخرجة...');
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 90000);
  try {
    const res = await fetch('/api/diagnostic-proposal', { method:'POST', headers:{'content-type':'application/json'}, signal:controller.signal, body: JSON.stringify({ responses, workingWeeks: toNum($('workingWeeks')?.value || 46), loadedHourlyCost: toNum($('loadedHourlyCost')?.value || 0) || null }) });
    clearTimeout(timeout);
    const data = await res.json();
    if(!res.ok || data.error) throw new Error(data.error || 'Diagnostic failed');
    renderDiagnostic(data);
    setStatus(`تم تشغيل التشخيص الجديد باستخدام ${data.modelUsed || 'AI'}.`);
  } catch(e) {
    clearTimeout(timeout);
    $('diagnosticOutput').innerHTML = '<p class="empty">تعذر تشغيل التشخيص الآن. جرب مرة أخرى أو قلل حجم الشيت.</p>';
    setStatus('تعذر تشغيل التشخيص: ' + (e.message || 'خطأ غير معروف'));
  }
}
$('loadSample').addEventListener('click',()=>{ state={headers:sampleHeaders, rows:sampleRows, source:'sample'}; render(); setStatus('تم تحميل بيانات تجريبية. هذه نسخة استخراج فقط بدون مولد.'); });
$('loadSheet').addEventListener('click',loadSheet);
$('runDiagnostic').addEventListener('click',runDiagnostic);
$('showAll').addEventListener('click',()=>{ tableMode='all'; renderTable(); });
$('showImportant').addEventListener('click',()=>{ tableMode='important'; renderTable(); });
$('copyJson').addEventListener('click',async()=>{ await navigator.clipboard.writeText(JSON.stringify(cleanData(), null, 2)); setStatus('تم نسخ JSON النظيف.'); });
$('copyDiagnostic').addEventListener('click',async()=>{ await navigator.clipboard.writeText($('diagnosticOutput').innerText); setStatus('تم نسخ التشخيص.'); });
$('downloadDiagnostic').addEventListener('click',()=>download('nahr-ai-transformation-diagnostic.html','text/html;charset=utf-8','<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تشخيص نهر</title><link rel="stylesheet" href="https://nahr-proposal-generator.vercel.app/styles.css"><body><main><article class="proposal">'+$('diagnosticOutput').innerHTML+'</article></main></body></html>'));
$('downloadJson').addEventListener('click',()=>download('nahr-clean-responses.json','application/json;charset=utf-8',JSON.stringify(cleanData(), null, 2)));
$('downloadCsv').addEventListener('click',()=>download('nahr-clean-responses.csv','text/csv;charset=utf-8',cleanCsv()));
render();
