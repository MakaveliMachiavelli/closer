/* Closer — land the job, not just apply.
   100% client-side. Engines are pure functions exposed on window.CloserEngine for tests. */
'use strict';

const PRO_CODES = ['CLOSER-PRO-199-0F4C-D98A', 'CLOSER-PRO-199-DEMO-972C-BB7B'];
const FREE_RUNS = 3;        // tailored material sets on free tier
const FREE_ROWS = 5;        // tracker rows on free tier
const LS = { cv: 'closer_cv', jd: 'closer_jd', runs: 'closer_runs', pro: 'closer_pro', trk: 'closer_trk' };

/* ================================================================
   ENGINES (pure, deterministic — tested)
   ================================================================ */
const SKILLS = {
  'Web & Dev': ['JavaScript','TypeScript','React','Vue','Angular','Next.js','HTML','CSS','Tailwind','PHP','Laravel','WordPress','Node.js','Python','Django','Java','C#','.NET','C++','REST API','GraphQL'],
  'Mobile': ['Flutter','React Native','Kotlin','Swift','Android','iOS'],
  'Data': ['SQL','MySQL','PostgreSQL','MongoDB','Excel','Data Analysis','Power BI','Tableau','Pandas','Data Entry','Reporting'],
  'Cloud & Ops': ['AWS','GCP','Azure','Docker','Kubernetes','Linux','CI/CD','Git','GitHub','Networking','IT Support','Helpdesk','Active Directory','Office 365','Hardware Troubleshooting','Windows Server'],
  'Design': ['Graphic Design','Canva','Photoshop','Illustrator','Figma','UI Design','UX Design','Video Editing','CapCut','Premiere Pro','After Effects','Logo Design'],
  'Marketing': ['SEO','Copywriting','Content Writing','Facebook Ads','Google Ads','Social Media Management','Email Marketing','Google Analytics','Influencer Marketing','Marketplace Listing','Shopee','Lazada'],
  'Ops & Business': ['Virtual Assistant','Customer Service','Project Management','Agile','Scrum','Jira','Trello','Asana','Salesforce','HubSpot','Zendesk','Bookkeeping','QuickBooks','Xero','Invoicing','Payroll','Recruitment','Sales','Lead Generation','Shopify','E-commerce','Teaching','Training']
};
const ALL_SKILLS = Object.values(SKILLS).flat();
const ROLES = ['Web Developer','Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Mobile Developer','Virtual Assistant','Graphic Designer','Video Editor','Data Analyst','IT Support Specialist','System Administrator','Project Manager','Accountant','Bookkeeper','Social Media Manager','Digital Marketer','SEO Specialist','Content Writer','Copywriter','Customer Service Representative','Sales Representative','Recruiter','Teacher','Encoder','QA Tester','DevOps Engineer','Business Analyst'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const titleCase = (s) => s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1));

function hasSkill(lowerText, sk) {
  const e = sk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9+#])${e}([^a-z0-9+#]|$)`, 'i').test(lowerText);
}

function parseResume(text) {
  const t = String(text || '').trim();
  const lines = t.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lower = t.toLowerCase();

  const email = (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [])[0] || '';
  const phone = (t.match(/(\+63|0)9\d{2}[-\s.]?\d{3}[-\s.]?\d{3,4}|\+?\d[\d\s().-]{8,}\d/) || [])[0] || '';

  // name: first plausible line (≤5 words, no digits/@)
  let name = 'Your Name';
  for (const l of lines.slice(0, 6)) {
    if (l.includes('@') || /\d/.test(l) || l.length > 42 || l.split(/\s+/).length > 5) continue;
    name = titleCase(l.toLowerCase()); break;
  }

  // skills: dictionary scan (word-boundary only — substring matching would
  // report "Java" inside "JavaScript")
  const skills = ALL_SKILLS.filter(sk => hasSkill(lower, sk));

  // roles
  const roles = ROLES.filter(r => lower.includes(r.toLowerCase()));
  const roleWords = ['developer','engineer','designer','assistant','analyst','manager','writer','editor','support','accountant','bookkeeper','specialist','representative','recruiter','tester','administrator'];
  if (!roles.length) {
    roleWords.forEach(w => { if (lower.includes(w)) roles.push(titleCase(w)); });
  }

  // years of experience
  let years = 0;
  const ym = [...lower.matchAll(/(\d{1,2}(?:\.\d)?)\s*(?:\+\s*)?years?\b/g)];
  if (ym.length) years = Math.max(...ym.map(m => parseFloat(m[1])));
  const ranges = [...lower.matchAll(/(20\d{2})\s*(?:-|–|to)\s*(20\d{2}|present)/g)];
  ranges.forEach(m => {
    const end = m[2] === 'present' ? new Date().getFullYear() : parseInt(m[2]);
    const span = end - parseInt(m[1]);
    if (span > 0 && span < 40) years = Math.max(years, span);
  });

  // experience bullet lines
  const bullets = lines.filter(l =>
    /^([•\-*>✓▪]|\d+[.)])\s+/.test(l) || /\b(built|managed|created|developed|led|automated|designed|maintained|improved|handled|increased|reduced|supported|delivered)\b/i.test(l)
  ).map(l => l.replace(/^([•\-*>✓▪]|\d+[.)])\s+/, '')).slice(0, 14);

  return { name, email, phone, skills, roles, years, bullets };
}

function matchJd(profile, jdText) {
  const jd = String(jdText || '').toLowerCase();
  const jdSkills = ALL_SKILLS.filter(sk => hasSkill(jd, sk));
  const have = new Set(profile.skills.map(s => s.toLowerCase()));
  const matched = jdSkills.filter(s => have.has(s.toLowerCase()));
  const missing = jdSkills.filter(s => !have.has(s.toLowerCase()));
  const score = jdSkills.length ? Math.round(100 * matched.length / jdSkills.length) : 0;
  const lower = jd;
  const seniority = /\b(senior|sr\.?|lead|principal|head)\b/.test(lower) ? 'Senior-level post'
    : /\b(junior|jr\.?|entry[\s-]level|trainee|fresh grad)\b/.test(lower) ? 'Junior / entry-level post'
    : '';
  return { score, matched, missing, seniority, jdSkills };
}

function tailorCv(p, m, info) {
  const role = info.role || p.roles[0] || 'the role';
  const company = info.company || 'your target company';
  const yearsTxt = p.years > 0 ? `${p.years} years of` : 'hands-on';
  const top = m.matched.slice(0, 6);
  const skillsLine = top.length ? top.join(', ') : (p.skills.slice(0, 5).join(', ') || 'your core tools');
  const L = [];
  L.push(`PROFESSIONAL SUMMARY (ATS-optimized — paste at the top of your CV)`);
  L.push(`${role} with ${yearsTxt} experience${p.skills.length ? ` across ${p.skills.slice(0,4).join(', ')}` : ''}. Applying for ${role}${company !== 'your target company' ? ` at ${company}` : ''}. Strongest in: ${skillsLine}.`);
  L.push('');
  L.push(`SKILLS SECTION (reordered — matched skills first, exactly as the post words them):`);
  if (top.length) L.push(top.map(s => `${s} ✓matched`).concat(p.skills.filter(s => !top.includes(s))).join(' • '));
  else if (p.skills.length) L.push(p.skills.join(' • '));
  else L.push('(add your tools/skills list here)');
  L.push('');
  if (m.missing.length) {
    L.push(`KEYWORDS THE POST USES THAT YOUR CV DOESN'T (weave in honestly — or list under "currently learning"):`);
    L.push(m.missing.join(', '));
    L.push('');
  }
  L.push(`EXPERIENCE BULLETS (skeletons loaded with the post's keywords — replace [brackets] with your real numbers):`);
  const sk1 = top[0] || m.jdSkills[0] || 'the core tools';
  const sk2 = top[1] || m.jdSkills[1] || sk1;
  const b0 = p.bullets[0] || 'your most relevant accomplishment';
  const b1 = p.bullets[1] || 'a second result you delivered';
  L.push(`• ${titleCase(sk1)}: ${b0} — delivering [quantified result: %, ₱, users, hours saved]`);
  L.push(`• ${titleCase(sk2)}: ${b1} — measurable outcome [X% improvement / [N] units / ₱[amount]]`);
  L.push(`• Used ${[...new Set([...top.slice(0,3), ...m.missing.slice(0,2)])].join(', ') || sk1} to [what you did] for [who], resulting in [result]`);
  L.push('');
  L.push(`ATS TIP: mirror the post's exact wording ("${m.jdSkills.slice(0,3).join('", "') || 'key terms'}") — one phrasing per skill, both in the skills list and inside a bullet.`);
  return L.join('\n');
}

function coverLetter(p, m, info) {
  const role = info.role || 'the open role';
  const company = info.company || 'your team';
  const yearsTxt = p.years > 0 ? `${p.years} years` : 'several years';
  const ev1 = p.bullets[0] || `delivered results with ${p.skills[0] || 'my core tools'}`;
  const ev2 = p.bullets[1] || `worked hands-on with ${p.skills[1] || p.skills[0] || 'the required stack'}`;
  const strong = m.matched.slice(0, 3).join(', ') || p.skills.slice(0, 3).join(', ') || 'the skills you listed';
  const learn = m.missing.slice(0, 2);
  const L = [];
  L.push(`Dear Hiring Manager${info.company ? '' : ''},`);
  L.push('');
  L.push(`I'm applying for the ${role} position${info.company ? ` at ${company}` : ''}. I'm a ${p.roles[0] || 'professional'} with ${yearsTxt} of experience, and your post reads like my day job: ${strong}.`);
  L.push('');
  L.push(`Proof, briefly:`);
  L.push(`• ${ev1}`);
  L.push(`• ${ev2}`);
  L.push(`Both map directly to what you need${m.matched.length ? ` — especially ${m.matched.slice(0,2).join(' and ')}` : ''}.`);
  L.push('');
  L.push(learn.length
    ? `On ${learn.join(' and ')}: I haven't used them professionally yet, but they sit right next to ${m.matched[0] || p.skills[0] || 'my stack'} in my toolkit and I ramp fast — I'd welcome a practical test.`
    : `I'm comfortable with the full stack of requirements you listed and can start contributing in week one.`);
  L.push('');
  L.push(`I'd love 15 minutes to walk through how I'd approach your first 90 days. I'll follow up early next week either way. Thank you for your time.`);
  L.push('');
  L.push(`Sincerely,`);
  L.push(`${p.name}`);
  if (p.email) L.push(p.email);
  if (p.phone) L.push(p.phone);
  return L.join('\n');
}

function outreachDm(p, m, info) {
  const client = info.client || 'there';
  const problem = info.problem || 'the project you posted';
  const role = info.role || 'the work';
  const proof = p.bullets[0] || `delivered ${p.skills[0] || 'similar'} work end-to-end`;
  const stack = m.matched.slice(0, 3).join(', ') || p.skills.slice(0, 3).join(', ');
  const L = [];
  L.push(`Hi ${client} — saw your post about ${problem}.`);
  L.push('');
  L.push(`Quick proof I'm the right fit: ${proof}. Stack I'd use: ${stack}.`);
  L.push('');
  L.push(`Here's how I'd run it:`);
  L.push(`1. Audit — I review your current setup/requirements and send findings within 24h, free.`);
  L.push(`2. Fix/Build — the actual ${role} work, in milestones you approve one by one.`);
  L.push(`3. Handover — documentation + a walkthrough so you're not dependent on me.`);
  L.push('');
  L.push(`If the audit is useful, you decide whether to continue. Fair?`);
  L.push(`— ${p.name}${p.email ? ` (${p.email})` : ''}`);
  return L.join('\n');
}

function followUps(info) {
  const company = info.company || 'your company';
  const role = info.role || 'the role';
  const name = info.myName || '';
  const L = [];
  L.push(`=== DAY 0 — send right after applying (email/portal message) ===`);
  L.push(`Subject: Application for ${role} — ${name}`.trim());
  L.push('');
  L.push(`Hi ${company} team, I just submitted my application for ${role}. One line on fit: my experience maps directly to the requirements — happy to walk through specifics in 15 minutes. Thank you!${name ? `\n— ${name}` : ''}`);
  L.push('');
  L.push(`=== DAY 3 — value-add follow-up (the one that gets replies) ===`);
  L.push(`Subject: One idea for ${role} — following up`);
  L.push('');
  L.push(`Hi! Following up on my ${role} application. While reading your post again, I noted [one specific observation about their product/market/process — 1 line]. If useful, here's a quick sketch of how I'd approach it: [2-3 bullet mini-plan]. Would love to hear your thoughts — and either way, good luck with the search!`);
  L.push('');
  L.push(`=== DAY 7 — polite close-the-loop ===`);
  L.push(`Subject: Closing the loop — ${role} application`);
  L.push('');
  L.push(`Hi! I know inboxes get busy — I'll assume the timeline has moved and close the loop on my end. If ${role} is still open and you'd like to talk, I'm a reply away. Thanks either way for considering me!`);
  return L.join('\n');
}

function interviewPrep(p, m, info) {
  const role = info.role || 'the role';
  const company = info.company || 'the company';
  const L = [];
  L.push(`INTERVIEW PREP — ${role}${info.company ? ` @ ${company}` : ''}`);
  L.push(`(STAR = Situation, Task, Action, Result. Fill brackets with YOUR stories.)`);
  L.push('');
  L.push(`1. "Tell me about yourself." (90-second skeleton)`);
  L.push(`   Now: ${p.roles[0] || role}${p.years ? ` with ${p.years} years in the field` : ''}. → Best at ${p.skills.slice(0,3).join(', ') || 'your core skills'}. → Proof: ${p.bullets[0] || '[your top accomplishment]'}. → Why here: this ${role} role is exactly that, at a bigger scale.`);
  const qSkills = m.matched.slice(0, 3);
  qSkills.forEach((s, i) => {
    const b = p.bullets[i] || '[relevant story]';
    L.push('');
    L.push(`${i + 2}. "Tell me about your experience with ${s}."`);
    L.push(`   S: [when/where]  T: [what needed doing]`);
    L.push(`   A: ${b}`);
    L.push(`   R: [quantified outcome]`);
  });
  m.missing.slice(0, 2).forEach((s, i) => {
    L.push('');
    L.push(`${qSkills.length + i + 2}. "How would you get up to speed on ${s}?"`);
    L.push(`   A: It's adjacent to ${m.matched[0] || p.skills[0] || 'my stack'} — I'd [concrete plan: docs, small project, shadow] in week one and show a working demo by week two.`);
  });
  const n = qSkills.length + m.missing.slice(0,2).length + 2;
  L.push('');
  L.push(`${n + 1}. "Why do you want to work here?"`);
  L.push(`   A: [1 specific fact about ${company}] + this role uses my ${m.matched.slice(0,2).join(' & ') || 'core'} strengths daily.`);
  L.push('');
  L.push(`${n + 2}. "What are your salary expectations?" (PH-safe answer)`);
  L.push(`   A: "Based on the role's scope and my ${p.years || 'X'} years of experience, I'm looking at ₱[range]. I'm flexible for the right fit — what's the budgeted range for this position?"`);
  L.push('');
  L.push(`YOUR QUESTIONS FOR THEM (ask 2):`);
  L.push(`• What does success in this role look like at 90 days?`);
  L.push(`• What's the biggest challenge the team is facing right now?`);
  return L.join('\n');
}

/* ================================================================
   STATE + UI
   ================================================================ */
const $ = (id) => document.getElementById(id);
let pro = localStorage.getItem(LS.pro) === '1';
let runs = Number(localStorage.getItem(LS.runs) || 0);
let profile = null, match = null, info = {};

function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}

function applyPro() {
  $('proBadge').classList.toggle('hidden', !pro);
  $('trkCsv').classList.toggle('hidden', !pro);
}

/* ---------- step 1 ---------- */
function renderProfile() {
  const p = profile;
  $('cvProfile').classList.remove('hidden');
  const skillsHtml = p.skills.length
    ? p.skills.slice(0, 18).map(s => `<span class="skill-chip chip-have">${esc(s)}</span>`).join('') : '<span class="text-sm text-muted">No dictionary skills found — your CV should name concrete tools (e.g. "WordPress", "Excel", "React").</span>';
  $('cvProfile').innerHTML = `
    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1">
        <span class="font-heading font-bold text-lg">${esc(p.name)}</span>
        ${p.years ? `<span class="text-sm text-muted">${p.years} yrs experience</span>` : ''}
        ${p.email ? `<span class="text-sm text-muted">✉ ${esc(p.email)}</span>` : ''}
        ${p.phone ? `<span class="text-sm text-muted">☎ ${esc(p.phone)}</span>` : ''}
      </div>
      ${p.roles.length ? `<div class="mt-1 text-sm text-brand2 font-semibold">${p.roles.slice(0,4).map(esc).join(' · ')}</div>` : ''}
      <div class="mt-3 flex flex-wrap gap-1.5">${skillsHtml}</div>
      <div class="mt-2 text-xs text-muted">${p.skills.length} skills · ${p.bullets.length} experience bullets detected</div>
    </div>`;
}

/* ---------- step 2 ---------- */
function renderMatch() {
  const m = match;
  $('matchPanel').classList.remove('hidden');
  $('matchScore').textContent = m.score;
  document.querySelector('.radial').style.setProperty('--v', m.score);
  $('seniority').textContent = m.seniority || '';
  $('matchedSkills').innerHTML = m.matched.length
    ? m.matched.map(s => `<span class="skill-chip chip-have">${esc(s)}</span>`).join('')
    : '<span class="text-sm text-muted">None of the post\'s skills matched your CV — check step 1 or widen your CV\'s skill wording.</span>';
  $('missingSkills').innerHTML = m.missing.length
    ? m.missing.map(s => `<span class="skill-chip chip-gap">${esc(s)}</span>`).join('')
    : '<span class="text-sm text-muted">Nothing missing — you cover every skill in the post. 🎯</span>';
}

function generateMaterials() {
  if (!profile || !match) return;
  const gated = !pro && runs >= FREE_RUNS;
  if (gated) { openPay(); toast(`Free tier: ${FREE_RUNS} material sets — PRO unlocks unlimited.`); return; }
  if (!pro) { runs++; localStorage.setItem(LS.runs, String(runs)); }
  info = { company: $('jdCompany').value.trim(), role: $('jdRole').value.trim() };
  $('outCv').value = tailorCv(profile, match, info);
  $('outLetter').value = coverLetter(profile, match, info);
  renderDm();
  $('outFollow').value = followUps({ ...info, myName: profile.name });
  $('outInterview').value = interviewPrep(profile, match, info);
  $('matWrap').classList.remove('hidden');
  $('matLocked').classList.add('hidden');
  // prefill tracker
  if (!$('trkCompany').value) $('trkCompany').value = info.company;
  if (!$('trkRole').value) $('trkRole').value = info.role;
  if (!pro) toast(`Materials ready — ${FREE_RUNS - runs} free set${FREE_RUNS - runs === 1 ? '' : 's'} left.`);
  else toast('Materials ready — PRO: unlimited.');
}
function renderDm() {
  if (!profile || !match) return;
  $('outDm').value = outreachDm(profile, match, {
    client: $('dmClient').value.trim(), problem: $('dmProblem').value.trim(),
    role: $('jdRole').value.trim() || 'project'
  });
}

/* ---------- tracker ---------- */
const STAGES = ['Applied', 'Followed up', 'Interview', 'Offer', 'Rejected'];
const addDays = (iso, n) => { const t = new Date(iso + 'T00:00:00'); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); };
const todayISO = () => new Date().toISOString().slice(0, 10);

function getTrk() { try { return JSON.parse(localStorage.getItem(LS.trk) || '[]'); } catch (e) { return []; } }
function setTrk(rows) { localStorage.setItem(LS.trk, JSON.stringify(rows)); renderTracker(); }
function addEntry() {
  const company = $('trkCompany').value.trim(), role = $('trkRole').value.trim();
  if (!company || !role) { toast('Company and role first.'); return; }
  const rows = getTrk();
  if (!pro && rows.length >= FREE_ROWS) { openPay(); toast(`Free tracker holds ${FREE_ROWS} rows — PRO for unlimited.`); return; }
  const appliedAt = todayISO();
  rows.push({ id: Date.now(), company, role, source: $('trkSource').value, stage: 'Applied', appliedAt, nextActionAt: addDays(appliedAt, 3) });
  $('trkCompany').value = $('trkRole').value = '';
  setTrk(rows);
  toast('Tracked — Day-3 follow-up scheduled.');
}
function renderTracker() {
  const rows = getTrk();
  const tb = $('trkBody');
  tb.innerHTML = rows.length ? '' : '<tr><td colspan="7" class="text-sm text-muted p-4">No applications yet. Land 20 this week.</td></tr>';
  rows.forEach(r => {
    const opts = STAGES.map(s => `<option ${s === r.stage ? 'selected' : ''}>${s}</option>`).join('');
    const dead = ['Offer', 'Rejected'].includes(r.stage);
    const due = !dead && r.nextActionAt && r.nextActionAt <= todayISO();
    tb.insertAdjacentHTML('beforeend', `
      <tr class="border-t border-slate-100">
        <td class="font-semibold">${esc(r.company)}</td>
        <td>${esc(r.role)}</td>
        <td class="text-xs text-muted">${esc(r.source)}</td>
        <td><select class="select select-xs stage-select" data-id="${r.id}">${opts}</select></td>
        <td class="text-xs">${r.appliedAt}</td>
        <td class="text-xs">${dead ? '—' : `<span class="${due ? 'trk-due' : 'text-muted'}">${r.nextActionAt}${due ? ' DUE' : ''}</span>`}</td>
        <td><button class="mini-btn no-print" data-del="${r.id}" title="Remove">✕</button></td>
      </tr>`);
  });
  $('cntApplied').textContent = rows.filter(r => r.stage === 'Applied').length;
  $('cntFollow').textContent = rows.filter(r => r.stage === 'Followed up').length;
  $('cntInterview').textContent = rows.filter(r => ['Interview', 'Offer'].includes(r.stage)).length;
  $('trkCap').textContent = pro ? `${rows.length} tracked · PRO unlimited` : `Free tier: ${rows.length}/${FREE_ROWS} rows.`;
}
function advanceStage(id, stage) {
  const rows = getTrk(); const r = rows.find(x => x.id === id); if (!r) return;
  r.stage = stage;
  if (stage === 'Followed up') r.nextActionAt = addDays(todayISO(), 4);
  else if (stage === 'Interview' || dead(stage)) r.nextActionAt = '';
  setTrk(rows);
}
const dead = (s) => ['Offer', 'Rejected'].includes(s);
function followupsDue() {
  const rows = getTrk().filter(r => r.stage === 'Applied' && r.nextActionAt <= todayISO());
  if (!rows.length) { toast('No Day-3 follow-ups due today. 🎯'); return; }
  const text = rows.map(r => `--- ${r.company} · ${r.role} (applied ${r.appliedAt}) ---\n` +
    `Subject: One idea for ${r.role} — following up\n\nHi! Following up on my ${r.role} application. [One specific observation about their product/market — 1 line]. If useful, here's how I'd approach it: [2-3 bullet mini-plan]. Would love to hear your thoughts!`).join('\n\n');
  copyText(text, `${rows.length} follow-up message(s) copied — send them today.`);
}
function trkCsv() {
  const rows = [['Company','Role','Source','Stage','Applied','Next action']]
    .concat(getTrk().map(r => [r.company, r.role, r.source, r.stage, r.appliedAt, r.nextActionAt]));
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'closer-pipeline.csv'; a.click();
}

/* ---------- copy ---------- */
function copyText(text, msg) {
  const done = () => toast(msg || 'Copied.');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  } catch (e) { /* jsdom/no-op */ }
  done();
}

/* ---------- pay ---------- */
function openPay() { $('payModal').classList.remove('hidden'); $('codeMsg').textContent = ''; }

/* ================================================================
   WIRE-UP
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyPro();
  renderTracker();

  // step 1
  const SAMPLE_CV = `Juan Dela Cruz
juan.delacruz@email.com | 0917-123-4567
Web Developer — 2.5 years

EXPERIENCE
• Built 12 e-commerce sites with WordPress and Shopify for local businesses
• Automated client reports using Python and Excel, saving 10 hours a week
• Maintained Linux hosting, backups and domains for 20 client sites
SKILLS
JavaScript, HTML, CSS, PHP, MySQL, Git, Canva, Customer Service, SEO`;
  const SAMPLE_JD = `Junior Web Developer — Acme Retail Group (JobStreet)

We need a junior web developer to maintain and grow our online store.

Requirements:
- 1-2 years experience with JavaScript and WordPress
- Comfortable with HTML, CSS, and basic SEO
- Familiar with the Shopify e-commerce platform
- Knowledge of React is a plus
- Google Analytics and Facebook Ads experience preferred
- Junior/entry-level applicants welcome`;

  $('cvSample').addEventListener('click', () => {
    $('cvInput').value = SAMPLE_CV;
    $('jdInput').value = SAMPLE_JD;
    $('jdCompany').value = 'Acme Retail Group';
    $('jdRole').value = 'Junior Web Developer';
    $('cvAnalyze').click();
    $('matchBtn').click();
    toast('Sample loaded — scroll to step 3 for your materials.');
  });
  $('cvSave').classList.remove('hidden');
  $('cvSave').addEventListener('click', () => {
    try {
      localStorage.setItem('closer_cv_text', $('cvInput').value);
      $('cvSavedHint').textContent = 'Saved ✓ (auto-restores next visit)';
      toast('CV saved to this browser.');
    } catch (e) { toast('Could not save (storage full).'); }
  });
  try {
    const savedCv = localStorage.getItem('closer_cv_text');
    if (savedCv && !$('cvInput').value) { $('cvInput').value = savedCv; $('cvSavedHint').textContent = 'Restored from last visit'; }
  } catch (e) {}

  $('printMat').addEventListener('click', () => window.print());

  $('cvAnalyze').addEventListener('click', () => {
    profile = parseResume($('cvInput').value);
    renderProfile();
    toast(`CV parsed: ${profile.skills.length} skills, ${profile.bullets.length} bullets.`);
  });
  $('cvFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { $('cvInput').value = String(r.result); toast('File loaded — press Analyze.'); };
    r.readAsText(f);
  });

  // step 2
  $('jdFetch').addEventListener('click', async () => {
    const url = $('jdUrl').value.trim();
    if (!/^https?:\/\//.test(url)) { $('fetchMsg').textContent = 'Paste a full https:// URL — or just paste the post text below (always works).'; return; }
    $('fetchMsg').textContent = 'Fetching via public reader…';
    try {
      const res = await fetch('https://r.jina.ai/' + url);
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();
      $('jdInput').value = text.slice(0, 12000);
      $('fetchMsg').textContent = 'Fetched ✓ — trim to the role requirements and press Match.';
    } catch (e) {
      $('fetchMsg').textContent = 'That source blocked the fetch — paste the post text instead (10 seconds, always works).';
    }
  });
  $('matchBtn').addEventListener('click', () => {
    if (!profile) { toast('Analyze your CV first (step 1).'); $('step1').scrollIntoView(); return; }
    match = matchJd(profile, $('jdInput').value);
    renderMatch();
    if (match.jdSkills.length === 0) toast('Match ran, but no known skills found in the post — paste the requirements section too.');
    generateMaterials();
  });

  // tabs
  document.querySelectorAll('.tabs [data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs [data-tab]').forEach(t => t.classList.remove('tab-active'));
      tab.classList.add('tab-active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      $(`panel-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  // DM regenerates live
  ['dmClient', 'dmProblem'].forEach(id => $(id).addEventListener('input', renderDm));

  // copy buttons
  document.querySelectorAll('.copy-btn').forEach(b => b.addEventListener('click', () => copyText($(b.dataset.copy).value)));

  // tracker
  $('addTrk').addEventListener('click', addEntry);
  $('trkBody').addEventListener('change', e => {
    if (e.target.classList.contains('stage-select')) advanceStage(Number(e.target.dataset.id), e.target.value);
  });
  $('trkBody').addEventListener('click', e => {
    const del = e.target.closest('[data-del]'); if (!del) return;
    setTrk(getTrk().filter(r => r.id !== Number(del.dataset.del)));
  });
  $('followAllBtn').addEventListener('click', followupsDue);
  $('trkCsv').addEventListener('click', trkCsv);

  // pay modal
  $('proBtn').addEventListener('click', openPay);
  $('payClose').addEventListener('click', () => $('payModal').classList.add('hidden'));
  $('codeBtn').addEventListener('click', () => {
    const code = $('codeInput').value.trim().toUpperCase();
    if (PRO_CODES.map(c => c.toUpperCase()).includes(code)) {
      pro = true; localStorage.setItem(LS.pro, '1'); applyPro(); renderTracker();
      $('codeMsg').textContent = '✓ PRO unlocked — unlimited materials, tracker and CSV.';
      $('codeMsg').className = 'code-msg ok';
      setTimeout(() => $('payModal').classList.add('hidden'), 1500);
    } else {
      $('codeMsg').textContent = 'Invalid code — check your GCash confirmation.';
      $('codeMsg').className = 'code-msg bad';
    }
  });
  $('codeInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('codeBtn').click(); });
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));

  // lucide icons (visual only, guarded — absent in tests)
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

  // GSAP entrance (visual only, guarded — absent in tests)
  if (window.gsap) {
    window.gsap.from('.hero h1', { y: 24, opacity: 0, duration: .7, ease: 'power2.out' });
    window.gsap.from('.pill', { y: 10, opacity: 0, duration: .5, stagger: .06, delay: .3 });
  }
});

/* expose engines for tests */
window.CloserEngine = { parseResume, matchJd, tailorCv, coverLetter, outreachDm, followUps, interviewPrep };
