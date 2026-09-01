function parseHours(v) {
  const arabicDigits = {'٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
  const raw = String(v || '').trim();
  const s = raw.replace(/[٠-٩]/g, d => arabicDigits[d]);
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m => Number(m[0]));
  if (!nums.length) return 0;
  if (/اقل|أقل|less/i.test(raw)) return nums[0] / 2;
  if (/اكثر|أكثر|more|\+/i.test(raw)) return nums[0] + Math.min(8, Math.max(2, nums[0] * 0.17));
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  return nums[0];
}
function avg(xs){ const a=xs.filter(x=>Number.isFinite(x)); return a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0; }
function median(xs){ const a=xs.filter(x=>Number.isFinite(x)).sort((a,b)=>a-b); if(!a.length) return 0; const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; }
function pct(n,d){ return d ? Math.round(n/d*100) : 0; }
function countBy(items){ const m=new Map(); items.filter(Boolean).forEach(x=>m.set(x,(m.get(x)||0)+1)); return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function clusterTask(text){
  const t=String(text||'');
  const clusters=[
    ['التقارير والتلخيص', /تقرير|تقارير|تلخيص|محضر|عرض|عروض/i],
    ['خدمة العملاء والرسائل', /عميل|عملاء|واتساب|رسائل|ردود|شكاوى|شكاوي|متابعة/i],
    ['إدخال ونقل البيانات', /ادخال|إدخال|نقل|تحديث|بيانات|نظام|اكسل|excel|مطابقة/i],
    ['المالية والتحصيل', /تحصيل|فاتورة|فواتير|مطابقة|رصيد|أرصدة|ارصدة|سداد|متأخر|متاخر/i],
    ['الموارد البشرية والتدريب', /تدريب|موظف|موظفين|حضور|متدرب|تطوير/i],
    ['العقود والشؤون القانونية', /عقد|عقود|قانون|قضية|قضايا|محكمة/i]
  ];
  return clusters.find(([,re])=>re.test(t))?.[0] || 'عمليات متفرقة';
}
function fallbackDiagnostic(input){
  const rows = Array.isArray(input.responses) ? input.responses : [];
  const weeks = Number(input.workingWeeks || 46);
  const loadedHourlyCost = Number(input.loadedHourlyCost || ((Number(input.avgSalary || 0) > 0 && Number(input.monthlyHours || 0) > 0) ? Number(input.avgSalary) / Number(input.monthlyHours) : 0));
  const totalWeekly = rows.reduce((s,r)=>s+Number(r.wasteHours||0),0);
  const annualHours = totalWeekly * weeks;
  const annualWaste = loadedHourlyCost ? annualHours * loadedHourlyCost : null;
  const skills = ['promptScore','qualityScore','dataScore','automationScore'].map(k=>rows.map(r=>Number(r[k]||0)).filter(Boolean));
  const capability = skills.map((vals,i)=>({ label:['صياغة الطلب','الحكم على الجودة','التطبيق على بيانات العمل','بناء الأتمتة'][i], average:+avg(vals).toFixed(1), median:+median(vals).toFixed(1), lowPct:pct(vals.filter(v=>v<=2).length, vals.length), highPct:pct(vals.filter(v=>v>=4).length, vals.length) }));
  const tasks = rows.flatMap(r=>(r.tasks||[]).map(t=>({ ...t, dept:r.dept, cluster:clusterTask(t.task), hours:parseHours(t.hours) })));
  const clusters = countBy(tasks.map(t=>t.cluster)).map(([name,count])=>({ name, count, weeklyHours:+tasks.filter(t=>t.cluster===name).reduce((s,t)=>s+(t.hours||0),0).toFixed(1) })).sort((a,b)=>b.weeklyHours-a.weeklyHours);
  const departments = countBy(rows.map(r=>r.dept)).map(([name,count])=>({ name, respondents:count, weeklyHours:+rows.filter(r=>r.dept===name).reduce((s,r)=>s+Number(r.wasteHours||0),0).toFixed(1) })).sort((a,b)=>b.weeklyHours-a.weeklyHours);
  const fee = annualWaste == null ? null : annualWaste * (annualWaste < 1000000 ? 0.10 : 0.55);
  return {
    modelUsed:'heuristic-fallback',
    executiveSummary:'هذا تشخيص أولي مبني على هيكلة البيانات وليس قراءة AI كاملة. استخدمه كمسودة تشغيلية حتى يعود نموذج الذكاء الاصطناعي بنتيجة أعمق.',
    evidenceStandard:['FACT: عدد الردود والأقسام والمهام من الشيت.','CALCULATION: الساعات السنوية = الساعات الأسبوعية × أسابيع العمل.','HYPOTHESIS: أسباب الهدر تحتاج مقابلة تحقق مع الإدارة.'],
    dataIntegrity:{ totalResponses:rows.length, uniqueRespondents:rows.length, duplicates:0, dataQualityScore: rows.length?'medium':'low', metricsSafeForCalculation:['عدد الردود','الأقسام','الساعات الأسبوعية المصرح بها'], metricsRequiringValidation:['القيمة المالية','قابلية الأتمتة الفعلية','نسبة الاسترداد'] },
    capabilityLadder: capability,
    processClusters: clusters.slice(0,8),
    departmentWaste: departments.slice(0,8),
    wasteEngine:{ reportedWeeklyHours:+totalWeekly.toFixed(1), annualHours:+annualHours.toFixed(1), fteEquivalent:+(annualHours/1920).toFixed(1), annualLaborWaste: annualWaste==null?null:Math.round(annualWaste), assumption:`${weeks} أسبوع عمل منتج سنويًا` },
    contradictions:['تحتاج قراءة AI لاستخراج التناقضات العميقة من النصوص.'],
    beforeAfter:[{ area:clusters[0]?.name || 'العمليات المتكررة', before:'مهام متكررة موزعة على عدة موظفين بدون خط أساس تحقق.', intervention:'تشخيص خط أساس، اختيار العمليات الأعلى أثرًا، ثم تدريب وبناء قوالب/أتمتة.', after:'عمليات مقاسة، مالك واضح، وقابلية تتبع للساعات المستردة.' }],
    engagementArchitecture:['Phase 1 — Diagnosis & Baseline','Phase 2 — Segmented Capability Building','Phase 3 — Workflow Build','Phase 4 — Governance','Phase 5 — Adoption & Champions','Phase 6 — Value Validation'],
    valueCase:{ theoreticalOpportunityHours:+annualHours.toFixed(1), realisticTargetHours:+(annualHours*0.35).toFixed(1), measurableValue:'يقاس بعد التنفيذ عبر الساعات المستردة، زمن الدورة، وعدد اللمسات اليدوية.' },
    pricing:{ annualWasteUsed: annualWaste==null?null:Math.round(annualWaste), rule: annualWaste==null?'القيمة المالية تحتاج تكلفة ساعة محملة قبل حساب السعر':(annualWaste<1000000?'10% × Annual Waste':'55% × Annual Waste'), consultingFee: fee==null?null:Math.round(fee) }
  };
}
function extractJson(text) {
  const clean = String(text||'').trim();
  const fenced = clean.match(/```json\s*([\s\S]*?)```/);
  return JSON.parse(fenced ? fenced[1] : clean.match(/\{[\s\S]*\}/)?.[0] || clean);
}
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error:'POST only' });
    const responses = Array.isArray(req.body?.responses) ? req.body.responses.slice(0, 120) : [];
    if (!responses.length) return res.status(400).json({ error:'Missing responses' });
    const payload = { responses, assumptions:{ workingWeeks:req.body?.workingWeeks || 46, avgSalary:req.body?.avgSalary || null, monthlyHours:req.body?.monthlyHours || null, loadedHourlyCost:req.body?.loadedHourlyCost || ((Number(req.body?.avgSalary || 0) > 0 && Number(req.body?.monthlyHours || 0) > 0) ? Number(req.body.avgSalary) / Number(req.body.monthlyHours) : null), hourlyCostFormula:'loadedHourlyCost = avgSalary / monthlyHours', pricingRule:'If validated cumulative annual waste is below SAR 1,000,000: fee = 10% × Annual Waste. If above SAR 1,000,000: fee = 55% × Annual Waste.' } };
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!key) return res.status(200).json(fallbackDiagnostic({ ...payload, ...payload.assumptions }));
    const prompt = `Act as a Senior AI Transformation, Operations Diagnostic & Value-Creation Consultant. Do NOT summarize the survey question by question. Reconstruct the organization's operating reality from cross-response evidence. Classify material claims as FACT, CALCULATION, INFERENCE, or HYPOTHESIS. Never invent numbers. Never manufacture ROI.\n\nReturn ONLY valid JSON in this shape:\n{\n "modelUsed":"gemini",\n "executiveSummary":"Arabic executive summary",\n "evidenceStandard":["FACT/CALCULATION/INFERENCE/HYPOTHESIS statements"],\n "dataIntegrity":{"totalResponses":number,"uniqueRespondents":number,"duplicates":number,"dataQualityScore":"low|medium|high","metricsSafeForCalculation":["..."],"metricsRequiringValidation":["..."]},\n "capabilityLadder":[{"label":"Prompting|Evaluation|Real Data|Automation","average":number,"median":number,"lowPct":number,"highPct":number,"interpretation":"Arabic"}],\n "contradictions":["Arabic contradiction with implication"],\n "automationBlindness":["Arabic gap findings"],\n "processClusters":[{"name":"Arabic workflow cluster","employeeCount":number,"departments":["..."],"weeklyHours":number,"automationFeasibility":"low|medium|high","dataSensitivity":"low|medium|high","intervention":"Arabic"}],\n "departmentWaste":[{"name":"department","respondents":number,"weeklyHours":number}],\n "wasteEngine":{"reportedWeeklyHours":number,"conservativeWeeklyHours":number,"annualHours":number,"fteEquivalent":number,"annualLaborWaste":number|null,"assumption":"Arabic"},\n "needVsDemandGap":["Arabic"],\n "barrierDecomposition":[{"barrier":"Arabic","type":"training|process|technology|governance|management|adoption","intervention":"Arabic"}],\n "peopleSegmentation":[{"segment":"Arabic","count":number,"intervention":"Arabic"}],\n "beforeAfter":[{"area":"Arabic","before":"Arabic evidence-based current state","intervention":"Arabic specific service change","after":"Arabic target state"}],\n "engagementArchitecture":["Arabic phases"],\n "valueCase":{"theoreticalOpportunityHours":number,"realisticTargetHours":number,"measurableValue":"Arabic"},\n "pricing":{"annualWasteUsed":number|null,"rule":"Arabic","consultingFee":number|null,"commercialReviewFlag":"Arabic or empty"},\n "successMeasurement":["Arabic KPI"]\n}\n\nInput data:\n${JSON.stringify(payload).slice(0, 60000)}`;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{ temperature:0.15, responseMimeType:'application/json' } })
    });
    const data = await r.json();
    if (!r.ok) return res.status(200).json({ ...fallbackDiagnostic(payload), warning:data.error?.message || 'Gemini unavailable' });
    const text = data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('') || '';
    return res.status(200).json(extractJson(text));
  } catch (e) {
    return res.status(200).json({ ...fallbackDiagnostic({ responses:req.body?.responses || [], workingWeeks:req.body?.workingWeeks, avgSalary:req.body?.avgSalary, monthlyHours:req.body?.monthlyHours, loadedHourlyCost:req.body?.loadedHourlyCost }), warning:e.message });
  }
};
