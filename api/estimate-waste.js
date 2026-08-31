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
function heuristicEstimate(responses) {
  const rows = responses.map((r) => {
    const taskHours = Number(r.taskHours || 0);
    const opinion = parseHours(r.baselineOpinion);
    const automationScore = Number(r.automationScore || 0);
    const dataScore = Number(r.dataScore || 0);
    const repetitiveText = `${r.tasks || ''} ${r.automationWish || ''}`;
    let automatableRatio = 0.35;
    if (/تقرير|تقارير|تلخيص|رسائل|واتساب|بيانات|ادخال|إدخال|مطابقة|متابعة|تصنيف|تحديث|نقل/i.test(repetitiveText)) automatableRatio += 0.20;
    if (/يدوي|متكرر|أسبوع|اسبوع|يومي/i.test(repetitiveText)) automatableRatio += 0.10;
    if (automationScore >= 4 || dataScore >= 4) automatableRatio += 0.10;
    if (automationScore <= 1) automatableRatio -= 0.05;
    automatableRatio = Math.max(0.20, Math.min(0.75, automatableRatio));
    const aiFromTasks = taskHours ? taskHours * automatableRatio : 0;
    const estimate = aiFromTasks && opinion ? Math.max(opinion, (aiFromTasks * 0.7 + opinion * 0.3)) : (aiFromTasks || opinion);
    return { name: r.name, dept: r.dept, employeeOpinionWeeklyHours: opinion, aiEstimatedWeeklyHours: Number(estimate.toFixed(1)), rationale: 'تقدير احتياطي مبني على نوع المهام وتكرارها وقابلية الأتمتة الظاهرة من الإجابة.', confidence: taskHours && opinion ? 'medium' : 'low' };
  });
  const totalEmployeeOpinionWeeklyHours = rows.reduce((s,r)=>s+(r.employeeOpinionWeeklyHours||0),0);
  const totalAiEstimatedWeeklyHours = rows.reduce((s,r)=>s+(r.aiEstimatedWeeklyHours||0),0);
  return {
    modelUsed: 'heuristic-fallback',
    totalEmployeeOpinionWeeklyHours: Number(totalEmployeeOpinionWeeklyHours.toFixed(1)),
    totalAiEstimatedWeeklyHours: Number(totalAiEstimatedWeeklyHours.toFixed(1)),
    method: 'fallback heuristic; Gemini not configured or unavailable',
    rows,
    insights: ['يعرض هذا الرقم مقارنة بين رأي الموظفين وتقدير قابلية الأتمتة من وصف المهام.', 'يجب تثبيت الرقم النهائي في مرحلة قياس خط الأساس قبل وعد ROI نهائي.']
  };
}
function extractJson(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
  return JSON.parse(m ? (m[1] || m[0]) : text);
}
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const responses = Array.isArray(req.body?.responses) ? req.body.responses.slice(0, 80) : [];
    if (!responses.length) return res.status(400).json({ error: 'Missing responses' });
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!key) return res.status(200).json(heuristicEstimate(responses));
    const prompt = `You are estimating actually automatable/wasted weekly hours from employee survey answers for a B2B AI enablement proposal.\nReturn ONLY valid JSON. Do not invent company facts. Compare the employee's own opinion with your estimate from their task descriptions.\nRules:\n- employeeOpinionWeeklyHours comes from their baseline answer.\n- aiEstimatedWeeklyHours should be conservative, based on repetitive task descriptions, task hours, outputs, AI maturity, and automation wish.\n- If evidence is weak, stay close to employee opinion.\n- If task descriptions show repetitive reporting, WhatsApp/customer replies, data entry, follow-up, matching, classification, summarization, or template work, estimate a higher actually recoverable portion.\n- Never exceed total taskHours for a person unless taskHours is missing and baseline opinion exists.\nJSON shape: {"modelUsed":"gemini","totalEmployeeOpinionWeeklyHours":number,"totalAiEstimatedWeeklyHours":number,"method":"Arabic one sentence explaining the method","insights":["Arabic insight"]}\nDo not return per-person rows unless absolutely necessary. Keep output short.\nResponses:\n${JSON.stringify(responses).slice(0, 35000)}`;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } })
    });
    const data = await r.json();
    if (!r.ok) return res.status(200).json(heuristicEstimate(responses));
    const text = data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('') || '';
    const parsed = extractJson(text);
    parsed.modelUsed = parsed.modelUsed || 'gemini';
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(200).json({ ...heuristicEstimate(req.body?.responses || []), warning: e.message });
  }
};
