const sampleHeaders = [
  'Timestamp','Email','الاسم','القسم','المسمى الوظيفي','سنوات خبرتك في هذا المجال','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه في عملك اليومي؟','استخدامك لأدوات الذكاء الاصطناعي حتى اليوم','الأدوات التي جربتها','أبعد ما وصلت إليه في استخدامها','صياغة طلب واضح يعطيني نتيجة دقيقة من أول مرة','الحكم على جودة المخرَج ومتى لا يصلح للاستخدام','استخدام الأداة على ملفات وبيانات عملي الحقيقية','بناء خطوة أتمتة تعمل دون تدخلي في كل مرة','اختر كل ما ينطبق عليك','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة من يومك تلقائيًا، أي مهمة تختار؟','مجموع الساعات الأسبوعية التي تقضيها في مهام متكررة يمكن أتمتتها','استعدادك لتطبيق ما تتعلمه فعليًا في عملك بعد التدريب'
];
const sampleRows = [
  ['2026-08-31','reem@example.com','ريم أحمد','الموارد البشرية','أخصائية تطوير موظفين','٦ سنوات','تجميع تقارير الحضور والتدريب','5','تلخيص ملاحظات الاجتماعات','3','تحديث ملفات المتدربين','2','تقارير، عروض، رسائل بريدية','أستخدمها أحيانًا','ChatGPT, Gemini','أكتب مسودات وأراجعها يدويًا','3','3','2','1','عدم وضوح حالات الاستخدام، الخوف من الأخطاء، عدم وجود بيانات مرتبة','بناء قوالب وأتمتة للتقارير','تجهيز تقرير التدريب الأسبوعي وإرساله تلقائيًا','10','4'],
  ['2026-08-31','fahad@example.com','فهد سالم','المبيعات','مشرف مبيعات','٨ سنوات','كتابة متابعة العملاء','4','تجهيز عروض الأسعار','3','تلخيص مكالمات العملاء','2','رسائل عملاء، عروض، تقارير مبيعات','أستخدمها أسبوعيًا','ChatGPT, Copilot','أستخدمها في المسودات والتلخيص','4','3','2','2','عدم معرفة أفضل طريقة للطلب، الخوف من مشاركة بيانات حساسة','تسريع كتابة العروض والمتابعات','تحويل ملاحظات المكالمة إلى رسالة متابعة وعرض مختصر','9','5'],
  ['2026-08-31','sara@example.com','سارة علي','خدمة العملاء','قائدة فريق','٥ سنوات','تصنيف شكاوى العملاء','6','كتابة ردود متكررة','4','تقرير نهاية اليوم','2','ردود، تقارير، تصنيفات','لم أستخدمها إلا قليلًا','Gemini','تجربة أسئلة بسيطة','2','2','1','1','لا أعرف من أين أبدأ، لا توجد قوالب، ضعف الثقة في المخرجات','استخدام AI بأمان في خدمة العملاء','تصنيف الشكاوى واقتراح الرد المناسب تلقائيًا','12','4']
];
let state = { headers: sampleHeaders, rows: sampleRows };
const $ = (id) => document.getElementById(id);
const arabicDigits = {'٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
function normalize(s){ return String(s||'').replace(/[\u064B-\u065F]/g,'').trim(); }
function toNum(v){ const s=String(v||'').replace(/[٠-٩]/g,d=>arabicDigits[d]).match(/-?\d+(\.\d+)?/); return s?Number(s[0]):0; }
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
function valuesFor(row, namePart){
  const out=[];
  state.headers.forEach((h,i)=>{ if(normalize(h).includes(normalize(namePart)) && row[i]) out.push(row[i]); });
  return out;
}
function splitMulti(v){ return String(v||'').split(/[,،;؛\n]+/).map(s=>s.trim()).filter(Boolean); }
function countBy(items){ const m=new Map(); items.filter(Boolean).forEach(x=>m.set(x,(m.get(x)||0)+1)); return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function topList(pairs, max=6){ return pairs.slice(0,max).map(([k,v])=>`<li>${escapeHtml(k)} <small>(${v})</small></li>`).join('') || '<li>غير محدد</li>'; }
function avg(nums){ const arr=nums.filter(n=>Number.isFinite(n)&&n>0); return arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 'غير محدد'; }

function formatNum(n){ return Number.isFinite(n) ? Math.round(n).toLocaleString('ar-SA') : 'غير محدد'; }
function money(n){ return Number.isFinite(n) ? `${Math.round(n).toLocaleString('ar-SA')} ريال` : 'غير محدد'; }
function percentBar(label, value, max, suffix=''){
  const pctValue = max ? Math.max(0, Math.min(100, (Number(value)||0) / max * 100)) : 0;
  return `<div class="bi-bar"><div class="bi-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}${suffix}</b></div><div class="bi-track"><span style="width:${pctValue}%"></span></div></div>`;
}
function kpiCard(label, value, note=''){
  return `<article class="bi-kpi"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b>${note?`<small>${escapeHtml(note)}</small>`:''}</article>`;
}
function getFinancialInputs(){
  const salary = toNum($('avgSalary')?.value || 0);
  const monthlyHours = toNum($('monthlyHours')?.value || 0);
  const hourlyCost = salary > 0 && monthlyHours > 0 ? salary / monthlyHours : 0;
  return { salary, monthlyHours, hourlyCost };
}
function yearsValue(row){ return parseHours(pick(row,['سنوات خبرتك','سنوات الخبرة','سنواتك'])); }
function rowWasteHours(row){
  const baseline = parseHours(pick(row,['مجموع الساعات الأسبوعية']));
  const taskHours = repeatedTasks(row).reduce((s,[,h])=>s+parseHours(h),0);
  return baseline || taskHours;
}
function buildEconomicImpact(rows, taskPairs, totalBaseline, totalTaskHours){
  const fin = getFinancialInputs();
  const weeklyWaste = totalBaseline || totalTaskHours || 0;
  const monthlyWasteHours = weeklyWaste * 4.33;
  const yearlyWasteHours = weeklyWaste * 52;
  const monthlyCost = fin.hourlyCost ? monthlyWasteHours * fin.hourlyCost : 0;
  const yearlyCost = fin.hourlyCost ? yearlyWasteHours * fin.hourlyCost : 0;
  const historicalRows = rows.map(r=>{
    const years = yearsValue(r);
    const weekly = rowWasteHours(r);
    return { name: personName(r), dept: pick(r,['القسم']), years, weekly, historicalHours: weekly * 52 * years, historicalCost: fin.hourlyCost ? weekly * 52 * years * fin.hourlyCost : 0 };
  }).filter(x=>x.years && x.weekly);
  const historicalHours = historicalRows.reduce((s,x)=>s+x.historicalHours,0);
  const historicalCost = historicalRows.reduce((s,x)=>s+x.historicalCost,0);
  const trainingRate = monthlyCost >= 1000000 ? 0.05 : 0.10;
  const trainingPrice = monthlyCost * trainingRate;
  const pricingRule = monthlyCost >= 1000000 ? '٥٪ من الهدر الشهري لأن الهدر الشهري مليون ريال أو أكثر' : '١٠٪ من الهدر الشهري لأن الهدر الشهري أقل من مليون ريال';
  return { ...fin, weeklyWaste, monthlyWasteHours, yearlyWasteHours, monthlyCost, yearlyCost, historicalRows, historicalHours, historicalCost, trainingRate, trainingPrice, pricingRule };
}
function economicCharts(e,d,a){
  const maxSkillLow = Math.max(...d.skillBreakdown.map(x=>x.lowPct), 100);
  const skillBars = d.skillBreakdown.map(x=>percentBar(x.label, x.lowPct, maxSkillLow, '%')).join('');
  const maxClusters = Math.max(...d.clusters.map(([,v])=>v), 1);
  const clusterBars = d.clusters.slice(0,6).map(([k,v])=>percentBar(k, v, maxClusters)).join('') || '<p>لا توجد عمليات مصنفة بعد.</p>';
  const monthlyVsYearly = percentBar('شهريًا', Math.round(e.monthlyCost), Math.max(e.yearlyCost,1), ' ريال') + percentBar('سنويًا', Math.round(e.yearlyCost), Math.max(e.yearlyCost,1), ' ريال');
  return `<section class="bi-section" aria-label="Power BI style visuals">
    <div class="bi-kpis">
      ${kpiCard('تكلفة الساعة', money(e.hourlyCost), `متوسط الراتب ÷ ساعات عمل الموظف شهريًا: ${formatNum(e.salary)} ÷ ${formatNum(e.monthlyHours)}`)}
      ${kpiCard('الهدر الشهري', money(e.monthlyCost), `${formatNum(e.monthlyWasteHours)} ساعة شهريًا`)}
      ${kpiCard('الهدر السنوي', money(e.yearlyCost), `${formatNum(e.yearlyWasteHours)} ساعة سنويًا`)}
      ${kpiCard('سعر التدريب', money(e.trainingPrice), e.pricingRule)}
      ${kpiCard('الهدر التاريخي', money(e.historicalCost), `${formatNum(e.historicalHours)} ساعة حسب سنوات الخبرة المدخلة`)}
    </div>
    <div class="bi-grid">
      <article><h4>تكلفة الهدر</h4>${monthlyVsYearly}</article>
      <article><h4>نقاط ضعف المهارة</h4>${skillBars}</article>
      <article><h4>تركيز الفرص حسب العمليات</h4>${clusterBars}</article>
    </div>
    <p class="chart-note">الأرقام أعلاه تقديرية من مدخلات الراتب وساعات العمل، وتبقى قابلة للتعديل قبل إرسال العرض.</p>
  </section>`;
}
function historicalLossTable(rows){
  return rows.slice(0,10).map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.dept)}</td><td>${escapeHtml(x.years)}</td><td>${formatNum(x.historicalHours)}</td><td>${money(x.historicalCost)}</td></tr>`).join('') || '<tr><td colspan="5">لا توجد سنوات خبرة أو ساعات كافية للحساب.</td></tr>';
}

function dedupeRows(rows){
  const seen = new Map(), unique = [], duplicates = [];
  for (const row of rows) {
    const name = normalize(pick(row,['الاسم'])).toLowerCase();
    const email = normalize(pick(row,['Email','البريد','الإيميل'])).toLowerCase();
    const key = email || `${name}|${normalize(pick(row,['القسم'])).toLowerCase()}`;
    if (key && seen.has(key)) duplicates.push({ key, name: pick(row,['الاسم']) || key });
    else { if (key) seen.set(key,true); unique.push(row); }
  }
  return { unique, duplicates };
}
function parseHours(v){
  const raw = String(v||'').trim();
  const s = raw.replace(/[٠-٩]/g,d=>arabicDigits[d]);
  if (!s) return 0;
  if (/اقل|أقل|less/i.test(raw) && /6|٦/.test(s)) return 3;
  if (/اكثر|أكثر|\+/.test(raw)) return toNum(s) || 0;
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
  if (nums.length >= 2) return (nums[0]+nums[1])/2;
  return nums[0] || 0;
}
function pct(part,total){ return total ? Math.round((part/total)*100) : 0; }
function personName(row){ return pick(row,['الاسم']) || 'غير محدد'; }
function skillValue(row, names){ return toNum(pick(row,names)); }
function allSkillValues(row){
  return [
    skillValue(row,['صياغة طلب واضح']),
    skillValue(row,['الحكم على جودة']),
    skillValue(row,['ملفات وبيانات عملي','استخدام الأداة على ملفات']),
    skillValue(row,['بناء خطوة أتمتة'])
  ];
}
function topNames(items, max=8){ return items.slice(0,max).map(x=>escapeHtml(x.name || x)).join(' · ') || 'لا يوجد'; }
function processClusters(taskPairs){
  const patterns = [
    ['التحصيل والمتأخرات', /تحصيل|متأخر|متاخر|مستحق|سداد|ايجار|إيجار/i],
    ['واتساب وخدمة العملاء', /واتساب|whatsapp|رسائل|عميل|عملاء|ردود|شكاوى|شكاوي/i],
    ['إدخال ونقل البيانات', /ادخال|إدخال|نقل|تحديث|بيانات|نظام|انظمة|أنظمة|اكسل|excel/i],
    ['متابعة وإقفال المهام', /متابعة|اقفال|إقفال|مهام|تذكير|تنسيق/i],
    ['الشؤون القانونية والقضايا', /قضية|قضايا|قانون|محكمة|عقد|عقود/i],
    ['المالية والمطابقات', /مطابقة|ارصدة|أرصدة|رصيد|مالية|فاتورة|فواتير|تقرير مالي/i],
    ['التقارير والتلخيص', /تقرير|تقارير|تلخيص|عرض|عروض|محضر/i]
  ];
  const counts = new Map();
  for (const t of taskPairs) {
    for (const [label, re] of patterns) if (re.test(t.task)) counts.set(label,(counts.get(label)||0)+1);
  }
  return [...counts.entries()].sort((a,b)=>b[1]-a[1]);
}
function buildDeepDiagnostics(a){
  const rows = a.rows;
  const skillDefs = [
    ['صياغة طلب واضح','prompt',['صياغة طلب واضح']],
    ['الحكم على جودة المخرَج','quality',['الحكم على جودة']],
    ['التطبيق على بيانات العمل الحقيقية','data',['ملفات وبيانات عملي','استخدام الأداة على ملفات']],
    ['بناء خطوة أتمتة مستقلة','automation',['بناء خطوة أتمتة']]
  ];
  const skillBreakdown = skillDefs.map(([label,key,names])=>{
    const vals = rows.map(r=>skillValue(r,names)).filter(Boolean);
    return { label, key, avg: avg(vals), low: vals.filter(v=>v<=2).length, lowPct: pct(vals.filter(v=>v<=2).length, vals.length), count: vals.length };
  });
  const dailyWeekly = rows.filter(r=>/يومي|يوميا|أسبوع|اسبوع|weekly|daily/i.test(pick(r,['استخدامك لأدوات الذكاء الاصطناعي'])));
  const textOnly = rows.filter(r=>/كتابة|صياغة|نصوص|مسودات|تلخيص|محتوى/i.test(pick(r,['أبعد ما وصلت إليه'])) && !/ربط|أتمت|اتمت|workflow|make|n8n|zapier|power automate/i.test(pick(r,['أبعد ما وصلت إليه'])));
  const integrationUsers = rows.filter(r=>/make|n8n|zapier|power automate|ربط|workflow|أتمت|اتمت/i.test((pick(r,['الأدوات التي جربتها'])+' '+pick(r,['أبعد ما وصلت إليه']))));
  const taskHourByPerson = rows.map(r=>({ name: personName(r), dept: pick(r,['القسم']), taskHours: repeatedTasks(r).reduce((s,[,h])=>s+parseHours(h),0), baseline: parseHours(pick(r,['مجموع الساعات الأسبوعية'])) })).filter(x=>x.taskHours || x.baseline);
  const blind = taskHourByPerson.filter(x=>x.taskHours>=40 && x.baseline>0 && x.baseline<=6);
  const timeAnomalies = taskHourByPerson.filter(x=>x.taskHours>48);
  const obstacleText = rows.flatMap(r=>splitMulti(pick(r,['اختر كل ما ينطبق عليك'])));
  const countIncludes = (re)=>obstacleText.filter(x=>re.test(x)).length;
  const governanceSignals = countIncludes(/سياسة|سرية|خصوصية|بيانات|مشاركة|مسموح|اعتماد/i);
  const orgBlockers = {
    time: countIncludes(/وقت|مشغول|ضغط/i),
    trust: countIncludes(/ثقة|جودة|دقة|أخطاء|اخطاء/i),
    notStarted: countIncludes(/لم أبدأ|لم ابدا|بجدية|لا أعرف من أين أبدأ|لا اعرف/i),
    governance: governanceSignals
  };
  const writingDemand = rows.filter(r=>/جودة.*كتب|أكتب|اكتب|كتابة|صياغة/i.test(pick(r,['أولويتك الأولى من التدريب']))).length;
  const automationDemand = rows.filter(r=>/أتمت|اتمت|autom/i.test(pick(r,['أولويتك الأولى من التدريب']))).length;
  const annualHours = Math.round((a.totalBaseline || a.totalTaskHours) * 46);
  const fte = annualHours ? (annualHours/1920).toFixed(1) : 'غير محدد';
  const conservativeLow = annualHours ? Math.round(annualHours*0.30) : 0;
  const conservativeHigh = annualHours ? Math.round(annualHours*0.40) : 0;
  const champions = rows.filter(r=>skillValue(r,['بناء خطوة أتمتة'])>=4).map(r=>({name:personName(r), dept:pick(r,['القسم'])}));
  const risks = rows.filter(r=>skillValue(r,['استعدادك لتطبيق'])>0 && skillValue(r,['استعدادك لتطبيق'])<=3).map(r=>({name:personName(r), readiness:skillValue(r,['استعدادك لتطبيق'])}));
  const highSkillLowReadiness = rows.filter(r=>allSkillValues(r).every(v=>v>=4) && skillValue(r,['استعدادك لتطبيق'])<=3).map(r=>({name:personName(r), readiness:skillValue(r,['استعدادك لتطبيق'])}));
  const clusters = processClusters(a.taskPairs);
  return { skillBreakdown, dailyWeeklyCount: dailyWeekly.length, textOnlyCount: textOnly.length, integrationCount: integrationUsers.length, blind, timeAnomalies, orgBlockers, writingDemand, automationDemand, annualHours, fte, conservativeLow, conservativeHigh, champions, risks, highSkillLowReadiness, clusters };
}
function diagnosticCards(d){
  const collapse = d.skillBreakdown.map(x=>`<tr><td>${escapeHtml(x.label)}</td><td>${escapeHtml(x.avg)}</td><td>${escapeHtml(x.low)} من ${escapeHtml(x.count)} (${escapeHtml(x.lowPct)}%)</td></tr>`).join('');
  const blind = d.blind.slice(0,5).map(x=>`<li>${escapeHtml(x.name)}: ${escapeHtml(x.taskHours)} ساعة مهام → ${escapeHtml(x.baseline)} ساعات قابلة للأتمتة</li>`).join('') || '<li>لا توجد فجوة واضحة حسب الأرقام الحالية.</li>';
  const anomalies = d.timeAnomalies.slice(0,6).map(x=>`<li>${escapeHtml(x.name)}: ${escapeHtml(x.taskHours)} ساعة أسبوعيًا في ثلاث مهام فقط</li>`).join('') || '<li>لا توجد أرقام شاذة كبيرة في العينة الحالية.</li>';
  const championText = topNames(d.champions,8);
  const riskText = topNames(d.risks.map(r=>`${r.name} (${r.readiness}/5)`),10);
  const highRiskText = topNames(d.highSkillLowReadiness.map(r=>`${r.name} (${r.readiness}/5)`),8);
  return `<h2>٤. القراءة التشخيصية للبيانات</h2>
<h3>١. سلّم المهارة وأين ينهار</h3><table class="generated-table"><tr><th>البعد</th><th>المتوسط</th><th>نسبة ٢ فأقل</th></tr>${collapse}</table><p>${escapeHtml(d.dailyWeeklyCount)} من العينة يستخدمون أدوات الذكاء الاصطناعي يوميًا أو أسبوعيًا، لكن ${escapeHtml(d.textOnlyCount)} لم يتجاوزوا الكتابة/الصياغة، و${escapeHtml(d.integrationCount)} فقط ظهرت لديهم أدوات ربط أو أتمتة. هذه فجوة بين الاستخدام والعائد التشغيلي.</p>
<h3>٢. الفريق لا يرى الفرصة كاملة</h3><ul>${blind}</ul><p>إذا ظهرت هذه الفجوة، يبدأ البرنامج بجلسة “رؤية الفرصة” قبل التدريب على الأدوات.</p>
<h3>٣. جودة قياس الوقت</h3><ul>${anomalies}</ul><p>وجود أرقام عالية أو غير متسقة يعني أن خط الأساس نفسه يحتاج ضبط قبل وعد ROI نهائي.</p>
<h3>٤. العوائق التنظيمية</h3><table class="generated-table"><tr><th>العائق</th><th>عدد الإشارات</th></tr><tr><td>الوقت</td><td>${escapeHtml(d.orgBlockers.time)}</td></tr><tr><td>الثقة بجودة المخرَج</td><td>${escapeHtml(d.orgBlockers.trust)}</td></tr><tr><td>لم يبدأ بجدية / لا يعرف البداية</td><td>${escapeHtml(d.orgBlockers.notStarted)}</td></tr><tr><td>سياسة الاستخدام والسرية والبيانات</td><td>${escapeHtml(d.orgBlockers.governance)}</td></tr></table>
<h3>٥. الطلب معكوس عن الحاجة</h3><p>${escapeHtml(d.writingDemand)} اختاروا تحسين الكتابة/الصياغة مقابل ${escapeHtml(d.automationDemand)} فقط اختاروا الأتمتة صراحة. لذلك يعاد تأطير العرض من “دورة كتابة أفضل” إلى “استرداد وقت وبناء عمليات”.</p>
<h3>٦. الفرصة مركّزة في عمليات</h3><ul>${topList(d.clusters,8)}</ul>
<h3>٧. حجم الفرصة بأدنى تقدير</h3><p>إجمالي الفرصة المعلنة ≈ ${escapeHtml(d.annualHours)} ساعة سنويًا ≈ ${escapeHtml(d.fte)} وظائف بدوام كامل. التقدير المحافظ لأول سنة: ${escapeHtml(d.conservativeLow)}–${escapeHtml(d.conservativeHigh)} ساعة مستردة فعليًا.</p>
<h3>٨. الأبطال والمخاطر</h3><p><b>أبطال داخليون محتملون:</b> ${championText}</p><p><b>مخاطر الدفعة الأولى:</b> ${riskText}</p><p><b>مهارة عالية مع استعداد منخفض:</b> ${highRiskText}</p>`;
}

function setStatus(msg){ $('loadStatus').textContent = msg; }
function renderRows(){
  renderOverview();
}
function buildAggregate(){
  const rawRows = state.rows || [];
  const deduped = dedupeRows(rawRows);
  const rows = deduped.unique;
  const people = rows.length;
  const duplicateCount = deduped.duplicates.length;
  const depts = countBy(rows.map(r=>pick(r,['القسم'])));
  const titles = countBy(rows.map(r=>pick(r,['المسمى الوظيفي'])));
  const outputs = countBy(rows.flatMap(r=>splitMulti(pick(r,['ما أكثر ما تنتجه']))));
  const aiUse = countBy(rows.map(r=>pick(r,['استخدامك لأدوات الذكاء الاصطناعي'])));
  const tools = countBy(rows.flatMap(r=>splitMulti(pick(r,['الأدوات التي جربتها']))));
  const obstacles = countBy(rows.flatMap(r=>splitMulti(pick(r,['اختر كل ما ينطبق عليك']))));
  const priorities = countBy(rows.map(r=>pick(r,['أولويتك الأولى من التدريب'])));
  const automationWishes = rows.map(r=>pick(r,['لو اختفت مهمة واحدة'])).filter(Boolean);
  const taskPairs = rows.flatMap(r=>repeatedTasks(r).map(([task,h])=>({task,hours:parseHours(h), owner:pick(r,['الاسم']), dept:pick(r,['القسم'])})));
  const totalTaskHours = taskPairs.reduce((s,t)=>s+(t.hours||0),0);
  const baselineHours = rows.map(r=>toNum(pick(r,['مجموع الساعات الأسبوعية']))).filter(Boolean);
  const totalBaseline = baselineHours.reduce((a,b)=>a+b,0);
  const scores = {
    prompt: avg(rows.map(r=>toNum(pick(r,['صياغة طلب واضح'])))),
    quality: avg(rows.map(r=>toNum(pick(r,['الحكم على جودة'])))),
    data: avg(rows.map(r=>toNum(pick(r,['ملفات وبيانات عملي','استخدام الأداة على ملفات'])))),
    automation: avg(rows.map(r=>toNum(pick(r,['بناء خطوة أتمتة'])))),
    readiness: avg(rows.map(r=>toNum(pick(r,['استعدادك لتطبيق']))))
  };
  const economics = buildEconomicImpact(rows, taskPairs, totalBaseline, totalTaskHours);
  const diagnostics = buildDeepDiagnostics({ rows, people, depts, titles, outputs, aiUse, tools, obstacles, priorities, automationWishes, taskPairs, totalTaskHours, totalBaseline, scores });
  return { rows, people, duplicateCount, depts, titles, outputs, aiUse, tools, obstacles, priorities, automationWishes, taskPairs, totalTaskHours, totalBaseline, scores, diagnostics, economics };
}
function renderOverview(){
  const a=buildAggregate();
  const box=$('companyOverview');
  if(!box) return;
  box.innerHTML = `<div class="overview-grid">
    <div><b>${a.people}</b><span>العينة بعد إزالة التكرار</span></div>
    <div><b>${a.depts.length}</b><span>الأقسام</span></div>
    <div><b>${a.totalBaseline || a.totalTaskHours}</b><span>ساعات أسبوعية متكررة</span></div>
    <div><b>${money(a.economics.monthlyCost)}</b><span>تكلفة شهرية تقديرية</span></div>
  </div>
  <p class="overview-note">العرض سيُبنى على كل الردود كمراجعة شركة كاملة. لا يتم استخدام رد فردي. التكرارات المحذوفة: ${a.duplicateCount}</p>`;
}
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function loadSheet(){
  const url=$('sheetUrl').value.trim();
  if(!url){ setStatus('ضع رابط Google Sheet أو استخدم البيانات التجريبية.'); return; }
  setStatus('جاري قراءة الشيت...');
  const res=await fetch('/api/read-sheet?url='+encodeURIComponent(url));
  const data=await res.json();
  if(!res.ok){ setStatus(data.error || 'تعذر قراءة الشيت.'); return; }
  state={headers:data.headers, rows:data.rows};
  renderRows(); setStatus(`تمت قراءة ${data.rows.length} رد. سيتم توليد نظرة شاملة على الشركة من كل الردود.`);
}
function repeatedTasks(row){
  const pairs = [
    [pick(row,['المهمة المتكررة الأولى']), pick(row,['ساعاتها أسبوعيًا'])],
    [pick(row,['المهمة المتكررة الثانية']), pick(row,['ساعاتها أسبوعيًا 2'])],
    [pick(row,['المهمة المتكررة الثالثة']), pick(row,['ساعاتها أسبوعيًا 3'])]
  ].filter(([task])=>task);
  return pairs;
}
function taskTable(tasks){
  return tasks.slice(0,12).map(t=>`<tr><td>${escapeHtml(t.task)}</td><td>${escapeHtml(t.dept)}</td><td>${escapeHtml(t.owner)}</td><td>${escapeHtml(t.hours || 'غير محدد')}</td></tr>`).join('') || '<tr><td colspan="4">يتم تحديدها في اجتماع الفهم.</td></tr>';
}
function generateProposal(){
  const company = $('companyName').value.trim() || 'اسم الجهة التجريبية';
  const sector = $('companySector').value;
  const a = buildAggregate();
  const topPriority = a.priorities[0]?.[0] || 'تحديد أولويات التدريب بعد اجتماع الفهم';
  const topObstacle = a.obstacles[0]?.[0] || 'تحدد تفصيليًا في اجتماع الفهم';
  const html = `<div class="cover"><img src="/logo-nahr.svg" alt="نهر"><h1>عرض فني ومالي مبدئي</h1><p>${escapeHtml($('programName').value)}</p><div class="meta"><div><b>الجهة</b><br>${escapeHtml(company)}</div><div><b>القطاع</b><br>${escapeHtml(sector)}</div><div><b>عدد الردود المحللة</b><br>${escapeHtml(a.people)}</div><div><b>المدة المقترحة</b><br>${escapeHtml($('timeline').value)}</div></div></div>
<h2>١. الملخص التنفيذي</h2><p>بناءً على تحليل ${escapeHtml(a.people)} رد من نموذج جاهزية الذكاء الاصطناعي والأتمتة، نقترح برنامجًا عمليًا يساعد ${escapeHtml(company)} على بناء جاهزية مؤسسية، وليس تدريبًا مبنيًا على حالة فردية. الأولوية الأكثر تكرارًا في الردود هي: <b>${escapeHtml(topPriority)}</b>.</p>
<h2>٢. النظرة العامة على الشركة</h2><table class="generated-table"><tr><th>البند</th><th>النتيجة</th></tr><tr><td>عدد الردود</td><td>${escapeHtml(a.people)}</td></tr><tr><td>الأقسام المشاركة</td><td>${a.depts.map(([d,c])=>escapeHtml(d)+' ('+c+')').join('، ') || 'غير محدد'}</td></tr><tr><td>المسميات الوظيفية</td><td>${a.titles.slice(0,8).map(([d,c])=>escapeHtml(d)+' ('+c+')').join('، ') || 'غير محدد'}</td></tr><tr><td>متوسط الراتب الشهري المدخل</td><td>${money(a.economics.salary)}</td></tr><tr><td>ساعات عمل الموظف في الشهر — مدخل منك</td><td>${formatNum(a.economics.monthlyHours)}</td></tr><tr><td>تكلفة الساعة التقديرية</td><td>${money(a.economics.hourlyCost)}</td></tr><tr><td>إجمالي الساعات الأسبوعية القابلة للتحسين</td><td>${escapeHtml(a.totalBaseline || a.totalTaskHours || 'غير محدد')}</td></tr><tr><td>الهدر الشهري المحسوب</td><td>${money(a.economics.monthlyCost)}</td></tr><tr><td>سعر التدريب المحسوب</td><td>${money(a.economics.trainingPrice)} (${escapeHtml(Math.round(a.economics.trainingRate*100))}٪)</td></tr><tr><td>أبرز العوائق</td><td>${escapeHtml(topObstacle)}</td></tr></table>
${economicCharts(a.economics,a.diagnostics,a)}
<h2>٣. التكلفة المالية للهدر</h2><p>المدخلات التي تأتي منك هي متوسط راتب الموظف الشهري وعدد ساعات عمل الموظف في الشهر. نحسب تكلفة الساعة بقسمة الراتب على ساعات العمل الشهرية: ${money(a.economics.salary)} ÷ ${formatNum(a.economics.monthlyHours)} = ${money(a.economics.hourlyCost)} للساعة. بعدها نضرب تكلفة الساعة في مجموع الساعات المهدرة من الشيت لاستخراج التكلفة الشهرية والسنوية والتاريخية.</p><p>مجموع الساعات المهدرة من الشيت هو ${formatNum(a.economics.weeklyWaste)} ساعة أسبوعيًا، لذلك تكون التكلفة الشهرية التقريبية ${money(a.economics.monthlyCost)}، والتكلفة السنوية ${money(a.economics.yearlyCost)}. وبناءً على قاعدة التسعير المعتمدة، سعر التدريب = ${money(a.economics.trainingPrice)} (${escapeHtml(Math.round(a.economics.trainingRate*100))}٪ من الهدر الشهري).</p><table class="generated-table"><tr><th>المؤشر</th><th>القيمة</th></tr><tr><td>معادلة تكلفة الساعة</td><td>متوسط الراتب الشهري ÷ ساعات عمل الموظف في الشهر = ${money(a.economics.hourlyCost)}</td></tr><tr><td>مصدر الساعات المهدرة</td><td>مجموع الساعات المهدرة من كل ردود الشيت، بعد إزالة التكرارات</td></tr><tr><td>الساعات المهدرة شهريًا</td><td>${formatNum(a.economics.monthlyWasteHours)}</td></tr><tr><td>التكلفة الشهرية</td><td>${money(a.economics.monthlyCost)}</td></tr><tr><td>قاعدة التسعير</td><td>${escapeHtml(a.economics.pricingRule)}</td></tr><tr><td>سعر التدريب المقترح</td><td>${money(a.economics.trainingPrice)}</td></tr><tr><td>الساعات المهدرة سنويًا</td><td>${formatNum(a.economics.yearlyWasteHours)}</td></tr><tr><td>التكلفة السنوية</td><td>${money(a.economics.yearlyCost)}</td></tr><tr><td>الخسارة التاريخية حسب سنوات الخبرة المدخلة</td><td>${money(a.economics.historicalCost)} / ${formatNum(a.economics.historicalHours)} ساعة</td></tr></table><h3>تفصيل الخسارة التاريخية حسب الموظف</h3><table class="generated-table"><tr><th>الاسم</th><th>القسم</th><th>سنوات الخبرة</th><th>ساعات تاريخية</th><th>تكلفة تاريخية</th></tr>${historicalLossTable(a.economics.historicalRows)}</table>
${diagnosticCards(a.diagnostics)}
<h2>٥. أين يذهب وقت الفريق؟</h2><table class="generated-table"><tr><th>المهمة المتكررة</th><th>القسم</th><th>صاحب الرد</th><th>الساعات/أسبوع</th></tr>${taskTable(a.taskPairs)}</table>
<h2>٦. أكثر المخرجات اليومية</h2><ul>${topList(a.outputs,8)}</ul>
<h2>٧. مستوى الجاهزية الحالي</h2><table class="generated-table"><tr><th>المهارة</th><th>متوسط التقييم من ٥</th></tr><tr><td>صياغة طلب واضح</td><td>${a.scores.prompt}</td></tr><tr><td>الحكم على جودة المخرج</td><td>${a.scores.quality}</td></tr><tr><td>استخدام الأدوات على ملفات وبيانات العمل</td><td>${a.scores.data}</td></tr><tr><td>بناء خطوة أتمتة</td><td>${a.scores.automation}</td></tr><tr><td>الاستعداد للتطبيق</td><td>${a.scores.readiness}</td></tr></table>
<h2>٨. الأدوات والعوائق المتكررة</h2><div class="two-col"><div><h3>الأدوات المجربة</h3><ul>${topList(a.tools,8)}</ul></div><div><h3>العوائق</h3><ul>${topList(a.obstacles,8)}</ul></div></div>
<h2>٩. مخرجات البرنامج المقترحة</h2><ul><li>برنامج تدريبي مبني على احتياج الشركة كاملًا، مع أمثلة من أكثر الأقسام تكرارًا.</li><li>تمارين تطبيقية مبنية على مهام مثل: ${a.automationWishes.slice(0,4).map(escapeHtml).join('، ') || 'تحدد بعد اجتماع الفهم'}.</li><li>قوالب عمل تساعد الفريق على إنتاج ${a.outputs.slice(0,3).map(([k])=>escapeHtml(k)).join('، ') || 'المخرجات اليومية'} بجودة أعلى.</li><li>قياس أثر بعد ٩٠ يومًا بناءً على خط الأساس في الردود.</li></ul>
<h2>١٠. نطاق العمل المقترح</h2><h3>مسار التدريب والتطبيق</h3><p>ورش عملية مبنية على أنماط الردود، وليست تدريبًا عامًا لشخص واحد.</p><h3>مسار القوالب والأتمتة</h3><p>تصميم نماذج تشغيل وقوالب لأكثر المهام المتكررة داخل الشركة.</p>
<h2>١١. خطة التنفيذ</h2><ol><li>تحليل كل ردود النموذج وتجميعها حسب الأقسام والأولويات.</li><li>اجتماع فهم مع أصحاب القرار لتأكيد النطاق والفئات.</li><li>تصميم تدريب وتمارين حسب أهم ٣–٥ مهام متكررة.</li><li>تنفيذ التدريب وتطبيق القوالب.</li><li>قياس الأثر بعد ٩٠ يومًا.</li></ol>
<h2>١٢. العرض المالي</h2><table class="generated-table"><tr><th>البند</th><th>القيمة</th></tr><tr><td>الهدر الشهري المحسوب</td><td>${money(a.economics.monthlyCost)}</td></tr><tr><td>قاعدة التسعير</td><td>${escapeHtml(a.economics.pricingRule)}</td></tr><tr><td>سعر التدريب المقترح</td><td>${money(a.economics.trainingPrice)}</td></tr><tr><td>ملاحظة</td><td>السعر محسوب تلقائيًا من الهدر الشهري، وليس مدخلًا يدويًا في النموذج.</td></tr></table><h2>١٣. الخطوة التالية</h2><p>اعتماد نطاق العمل وعدد المشاركين، ثم إرسال النسخة النهائية من العرض الفني والمالي.</p>`;
  $('proposal').innerHTML=html;
}
function htmlToMd(node){ return node.innerText.replace(/\n{3,}/g,'\n\n'); }
function download(name, type, text){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href); }
$('loadSample').addEventListener('click',()=>{ state={headers:sampleHeaders, rows:sampleRows}; renderRows(); setStatus('تم تحميل بيانات تجريبية متعددة الردود. غيّر اسم الجهة ثم ولّد نظرة الشركة.'); });
$('loadSheet').addEventListener('click',loadSheet);
$('generate').addEventListener('click',generateProposal);
$('copyProposal').addEventListener('click',async()=>{ await navigator.clipboard.writeText(htmlToMd($('proposal'))); });
$('downloadMd').addEventListener('click',()=>download('nahr-company-overview-proposal.md','text/markdown;charset=utf-8',htmlToMd($('proposal'))));
$('downloadHtml').addEventListener('click',()=>download('nahr-company-overview-proposal.html','text/html;charset=utf-8','<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>عرض نهر</title><link rel="stylesheet" href="https://nahr-proposal-generator.vercel.app/styles.css"><body><main><article class="proposal">'+$('proposal').innerHTML+'</article></main></body></html>'));
$('printPdf').addEventListener('click',()=>window.print());
renderRows();
