import { CRITERIA, QUESTIONS } from './data/bank.js';
import { initialState, loadState, persistState, newCandidate, getCoverage, getScore, getElapsed, pauseTimer, resultsCsv, detailedCsv, validateState } from './store.js';
const $ = (s) => document.querySelector(s);
const app = $('#app');
const stored = loadState();
let state = stored.state;
let persistError = stored.error;
let activeFilter = 'all';
let bankCategory = 'all';
let bankQuery = '';
let pickQuery = '';
let expandedTwist = false;
let expandedWatch = false;
let toastTimeout = 0;
const TYPE_LABEL = { E: 'خبرة', Q: 'سؤال', L: 'تحدي عملي', R: 'Role-play' };
const STATUS_LABEL = { not_started: 'لم تبدأ', in_progress: 'جارية', completed: 'مكتملة' };
const DECISION_LABEL = { pending: 'قيد المراجعة', accepted: 'مقبول', rejected: 'مرفوض', waitlist: 'قائمة انتظار' };
const icons = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.91 1.91-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20h-2.7v-.09A1.65 1.65 0 0 0 11.3 18.4a1.65 1.65 0 0 0-1.82.33l-.06.06-1.91-1.91.06-.06A1.65 1.65 0 0 0 7.9 15a1.65 1.65 0 0 0-1.51-1H6.3v-2.7h.09A1.65 1.65 0 0 0 7.9 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.91-1.91.06.06A1.65 1.65 0 0 0 11.3 6.6a1.65 1.65 0 0 0 1-1.51V5h2.7v.09A1.65 1.65 0 0 0 16 6.6a1.65 1.65 0 0 0 1.82-.33l.06-.06 1.91 1.91-.06.06A1.65 1.65 0 0 0 19.4 10a1.65 1.65 0 0 0 1.51 1H21v2.7h-.09A1.65 1.65 0 0 0 19.4 15Z"/>',
    arrow: '<path d="m15 18-6-6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    edit: '<path d="m16 5 3 3M3 21l4-.8L20 7a2 2 0 0 0-3-3L4 17z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M5 17v4h14v-4"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
};
function ic(name, size = 18) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.info}</svg>`; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x] ?? x)); }
function slotLabel(c) { return c.name.trim() || `متقدم ${String(c.slot).padStart(2, '0')}`; }
function route() { return decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'overview'; }
function findCandidate(id) { return state.candidates.find(c => c.id === id); }
function save() { if (persistError?.includes('تعذر قراءة')) {
    toast('البيانات الحالية لم يتم حفظها لأن نسخة الجهاز القديمة غير قابلة للقراءة.', 'error');
    return;
} try {
    persistState(state);
    persistError = null;
    $('#save-indicator')?.replaceChildren(document.createTextNode('محفوظ على الجهاز'));
}
catch {
    persistError = 'تعذر حفظ التعديلات على الجهاز. صدّر نسخة احتياطية إن أمكن.';
    toast(persistError, 'error');
} }
function go(to) { const next = '#' + to; if (location.hash === next)
    render();
else
    location.hash = next; }
function toast(message, type = 'success') {
    let t = $('#toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.setAttribute('role', 'status');
        document.body.append(t);
    }
    t.className = `toast show ${type}`;
    t.textContent = message;
    clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => t?.classList.remove('show'), 3600);
}
function navItem(id, label, icon, active) { return `<a class="nav-link ${active === id ? 'active' : ''}" href="#${id}" ${active === id ? 'aria-current="page"' : ''}>${ic(icon, 19)}<span>${label}</span></a>`; }
function shell(content, active) {
    app.innerHTML = `<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>
  <div class="layout"><aside class="sidebar" aria-label="التنقل الرئيسي"><a class="brand" href="#overview" aria-label="Rally Interview Hub - الرئيسية"><span class="brand-mark">R<span class="brand-dot"></span></span><span class="brand-text"><strong>RALLY</strong><span>INTERVIEW HUB</span></span></a>
  <div class="sidebar-group"><div class="sidebar-caption">WORKSPACE / المساحة</div><nav class="sidebar-nav" aria-label="القائمة الرئيسية">${navItem('overview', 'نظرة عامة', 'grid', active)}${navItem('bank', 'بنك الأسئلة', 'book', active)}${navItem('results', 'النتائج والتقييمات', 'chart', active)}${navItem('settings', 'النسخ والبيانات', 'settings', active)}</nav></div>
  <div class="sidebar-bottom"><div class="workspace-card"><span class="workspace-symbol">OP</span><div><strong>Operations</strong><span>RALLY · Menoufia</span></div></div><p>مُصمم للمقابلات الـOffline<br>نسخة الاستخدام الفردي</p></div></aside>
  <div class="workspace"><header class="topbar"><a class="mobile-brand" href="#overview"><span class="brand-mark">R<span class="brand-dot"></span></span><span>RALLY <b>INTERVIEWS</b></span></a><div class="topbar-context"><span class="topbar-dot"></span> RALLY MENOUFIA <span class="topbar-slash">/</span> OPERATIONS</div><div class="topbar-status">${ic('shield', 16)}<span id="save-indicator">محفوظ على الجهاز</span></div></header><main id="main-content" tabindex="-1">${content}</main><footer class="footer"><span>RALLY Interview Hub</span><span>Private to this browser · v1.0</span></footer></div></div>
  <nav class="mobile-tabbar" aria-label="التنقل السريع">${navItem('overview', 'الرئيسية', 'grid', active)}${navItem('bank', 'الأسئلة', 'book', active)}${navItem('results', 'النتائج', 'chart', active)}${navItem('settings', 'الإعدادات', 'settings', active)}</nav><div id="modal-root"></div>`;
    if (persistError)
        $('#main-content')?.insertAdjacentHTML('afterbegin', `<div class="notice danger" role="alert">${ic('info')} ${esc(persistError)}</div>`);
}
function statCard(label, value, sub, icon) { return `<div class="stat-card"><div class="stat-icon">${ic(icon, 19)}</div><span class="stat-label">${label}</span><div class="stat-value">${value}</div><span class="stat-sub">${sub}</span></div>`; }
function statusBadge(s) { return `<span class="status-badge ${esc(s)}"><span class="status-dot"></span>${esc(STATUS_LABEL[s] ?? s)}</span>`; }
function overview() {
    const complete = state.candidates.filter(c => c.status === 'completed').length;
    const started = state.candidates.filter(c => c.status === 'in_progress').length;
    const scored = state.candidates.filter(c => getScore(c) !== null).length;
    const filtered = state.candidates.filter(c => activeFilter === 'all' || c.status === activeFilter);
    shell(`<div class="page-head"><div><div class="eyebrow">OVERVIEW <span class="eyebrow-separator"></span> SEASON 2026</div><h1>المقابلات، <span>بشكل أوضح.</span></h1><p class="page-subtitle">كل متقدم، وكل سؤال، وكل تقييم في مكان واحد. علشان تركز في الإجابات مش في الورق.</p></div><button class="button primary head-button" data-action="add-candidate">${ic('plus')} إضافة متقدم</button></div>
  <section class="stats-grid" aria-label="ملخص المقابلات">${statCard('إجمالي المتقدمين', state.candidates.length, 'موجودين في القائمة', 'users')}${statCard('مقابلات مكتملة', complete, 'تم إنهاء المقابلة', 'check')}${statCard('قيد التنفيذ', started, 'يمكن استكمالها', 'clock')}${statCard('تقييمات كاملة', scored, 'الـ6 معايير اتقاسوا', 'chart')}</section>
  <div class="columns-layout"><section class="panel candidates-panel"><div class="section-bar"><div><div class="section-overline">CANDIDATES</div><h2>قائمة المتقدمين <span class="count-label">${filtered.length}</span></h2></div><div class="filter-wrap"><label class="sr-only" for="candidate-filter">فلترة المقابلات</label><select id="candidate-filter" data-change="filter" class="soft-select"><option value="all" ${activeFilter === 'all' ? 'selected' : ''}>الكل</option><option value="not_started" ${activeFilter === 'not_started' ? 'selected' : ''}>لم تبدأ</option><option value="in_progress" ${activeFilter === 'in_progress' ? 'selected' : ''}>جارية</option><option value="completed" ${activeFilter === 'completed' ? 'selected' : ''}>مكتملة</option></select></div></div>
  <div class="candidate-list">${filtered.map((c) => `<div class="candidate-row"><div class="candidate-avatar">${String(c.slot).padStart(2, '0')}</div><div class="candidate-meta"><strong>${esc(slotLabel(c))}</strong><span>${esc(c.committee)} <span class="dot-divider">·</span> ${c.startedAt ? 'تم البدء' : 'جاهز للمقابلة'}</span></div><div class="candidate-status">${statusBadge(c.status)}</div><button class="candidate-cta" data-action="open-candidate" data-id="${esc(c.id)}" aria-label="${c.status === 'completed' ? 'راجع' : 'افتح'} مقابلة ${esc(slotLabel(c))}">${c.status === 'not_started' ? 'ابدأ' : c.status === 'in_progress' ? 'كمّل' : 'راجع'} ${ic('arrow', 17)}</button></div>`).join('') || `<div class="empty-state">مفيش متقدمين في الفلتر ده.</div>`}</div></section>
  <aside class="aside-panel"><div class="briefing-panel"><div class="briefing-index"><span>INTERVIEW GUIDE</span><span>01 / 03</span></div><div class="briefing-icon">${ic('book', 24)}</div><h2>خليك مركز<br>في المهم.</h2><p>متوسط المقابلة 15 دقيقة. اختار 3 أسئلة متنوعة، وسجّل دليل واضح لكل معيار اتقاس.</p><div class="guide-detail"><span>المدة المقترحة</span><strong>15 min</strong></div><div class="guide-detail"><span>معايير التقييم</span><strong>06 criteria</strong></div><a href="#bank" class="guide-link">استعرض الأسئلة ${ic('arrow', 17)}</a></div><div class="local-note">${ic('info', 18)}<span>الحفظ حاليًا على نفس المتصفح والجهاز فقط. اعمل Backup بعد المقابلات.</span></div></aside></div>`, 'overview');
}
function panelHeading(kicker, title, trailing = '') { return `<div class="section-bar"><div><div class="section-overline">${kicker}</div><h2>${title}</h2></div>${trailing}</div>`; }
function formatTime(seconds) { const s = Math.floor(seconds); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function questionStep(c, id, index) { const q = QUESTIONS.find(q => q.id === id); return `<button class="step-tab ${c.questionIndex === index ? 'selected' : ''}" data-action="jump-question" data-index="${index}" ${c.questionIndex === index ? 'aria-current="step"' : ''}><span class="step-number">${String(index + 1).padStart(2, '0')}</span><span class="step-detail"><strong>${esc(q.id)}</strong><span>${esc(TYPE_LABEL[q.kind])}</span></span>${c.questionAsked[id] ? `<span class="step-checked">${ic('check', 14)}</span>` : ''}</button>`; }
function scoreCard(c) {
    return `<section class="panel score-panel" id="score-panel">${panelHeading('EVALUATION', 'معايير التقييم', `<span class="coverage-pill">${getCoverage(c)} / 6</span>`)}
  <button class="score-back" data-action="jump-question-area">${ic('arrow', 15)} الرجوع للسؤال</button><p class="score-intro">قيّم كل معيار من 0 إلى 5 بناءً على إجابات المتقدم. المعيار اللي متقاسش سيبه فاضي.</p>
  <div class="criteria-stack">${CRITERIA.map((criterion, i) => { const score = c.criteriaScores[criterion.id]; return `<div class="criterion" data-criterion="${criterion.id}"><div class="criterion-top"><div class="criterion-name"><span class="criterion-index">${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(criterion.label)}</strong><small>${esc(criterion.description)}</small></div></div><span class="weight-pill">${criterion.weight}%</span></div><div class="score-options" role="group" aria-label="تقييم ${esc(criterion.label)}">${Array.from({ length: 6 }, (_, n) => `<button type="button" class="score-option ${score === n ? 'selected' : ''}" data-action="rate" data-criterion="${criterion.id}" data-score="${n}" aria-label="${esc(criterion.label)}: ${n} من 5" aria-pressed="${score === n}">${n}</button>`).join('')}</div><div class="criterion-bottom"><span>${score === null ? 'لم يُقيَّم بعد' : `${score} من 5`}</span>${score !== null ? `<button class="link-button subtle" data-action="clear-rate" data-criterion="${criterion.id}">إلغاء التقييم</button>` : ''}</div><label class="sr-only" for="evidence-${criterion.id}">دليل أو ملاحظة معيار ${esc(criterion.label)}</label><input id="evidence-${criterion.id}" class="criterion-evidence" placeholder="دليل مختصر من الإجابة (اختياري)" data-bind="criterion-evidence" data-criterion="${criterion.id}" value="${esc(c.criteriaEvidence[criterion.id] ?? '')}"></div>`; }).join('')}</div>
  <div class="score-summary"><div><span>OVERALL SCORE</span><strong>${getScore(c) === null ? '— / 100' : `${getScore(c)} / 100`}</strong></div><p>${getScore(c) === null ? 'النتيجة النهائية هتظهر بعد تقييم المعايير الستة.' : 'تقييم موزون حسب الأوزان المعتمدة.'}</p></div></section>`;
}
function interview(id) {
    const c = findCandidate(id);
    if (!c) {
        go('overview');
        return;
    }
    if (c.status === 'not_started') {
        c.status = 'in_progress';
        c.startedAt = new Date().toISOString();
        c.timerRunningSince = Date.now();
        save();
    }
    const currentId = c.questions[c.questionIndex] ?? null;
    const q = QUESTIONS.find(q => q.id === currentId);
    shell(`<div class="interview-top"><button class="back-link" data-action="back-overview">${ic('arrow', 16)} كل المتقدمين</button><span class="interview-label">INTERVIEW ${String(c.slot).padStart(2, '0')} <span> / OPERATIONS</span></span></div>
  <div class="interview-heading"><div><div class="eyebrow">ACTIVE SESSION</div><div class="interview-title-row"><h1>${esc(slotLabel(c))}</h1><button class="icon-button name-edit" data-action="rename" aria-label="تعديل اسم المتقدم">${ic('edit', 18)}</button></div><div class="interview-description">${statusBadge(c.status)} <span>·</span> ${c.questions.length} أسئلة مختارة <span>·</span> ${getCoverage(c)} / 6 معايير</div></div><div class="interview-actions"><div class="timer-box">${ic('clock', 18)}<time id="timer-readout" aria-label="مدة المقابلة">${formatTime(getElapsed(c))}</time><button data-action="toggle-timer" class="timer-button" aria-label="${c.timerRunningSince ? 'إيقاف' : 'تشغيل'} المؤقت" title="${c.timerRunningSince ? 'إيقاف' : 'تشغيل'} المؤقت">${ic(c.timerRunningSince ? 'pause' : 'play', 17)}</button></div><button class="button finish-button" data-action="finish" ${c.status === 'completed' ? 'disabled' : ''}>${ic('check', 17)} ${c.status === 'completed' ? 'تم الإنهاء' : 'إنهاء المقابلة'}</button></div></div>
  <div class="interview-grid"><section class="interview-left"><div class="panel question-panel">${panelHeading('QUESTION SEQUENCE', 'الأسئلة المختارة', `<button class="small-action" data-action="pick-question">${ic('plus', 16)} إضافة سؤال</button>`)}<div class="question-steps">${c.questions.map((id, i) => questionStep(c, id, i)).join('')}</div>${q ? `<div class="live-question"><div class="question-topline"><div class="question-kind"><span>${esc(q.id)}</span><span>${esc(TYPE_LABEL[q.kind])}</span></div><span class="question-count">${c.questionIndex + 1} / ${c.questions.length}</span></div><p class="question-category">${esc(q.category)}</p><h2 class="question-text">${esc(q.text)}</h2><div class="question-tools"><button class="disclosure-button ${expandedTwist ? 'open' : ''}" data-action="toggle-twist" aria-expanded="${expandedTwist}">${ic('plus', 16)} Twist / متغير ${ic('chevron', 16)}</button><button class="disclosure-button ${expandedWatch ? 'open' : ''}" data-action="toggle-watch" aria-expanded="${expandedWatch}">${ic('info', 16)} Watch for ${ic('chevron', 16)}</button></div>${expandedTwist ? `<div class="reveal-box"><span>TWIST</span><p>${esc(q.twist)}</p></div>` : ''}${expandedWatch ? `<div class="reveal-box watch-box"><span>WATCH FOR</span><p>${esc(q.watch)}</p></div>` : ''}<div class="answer-notes"><div class="notes-label"><label for="question-notes">ملاحظاتك على الإجابة</label><span>يتم الحفظ تلقائيًا</span></div><textarea id="question-notes" data-bind="question-note" data-question="${q.id}" rows="4" placeholder="اكتب أهم النقاط أو القرارات اللي قالها المتقدم...">${esc(c.questionNotes[q.id] ?? '')}</textarea></div><div class="question-footer"><button class="asked-button ${c.questionAsked[q.id] ? 'asked' : ''}" data-action="mark-asked">${ic(c.questionAsked[q.id] ? 'check' : 'plus', 17)} ${c.questionAsked[q.id] ? 'تم طرح السؤال' : 'علّم السؤال كمطروح'}</button><div class="question-nav"><button class="icon-button" data-action="prev-question" aria-label="السؤال السابق" ${c.questionIndex === 0 ? 'disabled' : ''}>${ic('arrow', 18)}</button><button class="button primary next-button" data-action="next-question" ${c.questionIndex === c.questions.length - 1 ? 'disabled' : ''}>السؤال التالي ${ic('arrow', 18)}</button></div><button class="score-jump" data-action="jump-scores">${ic('chart', 17)} الانتقال للتقييم ${ic('arrow', 16)}</button></div></div>` : `<div class="empty-state">مفيش أسئلة حاليًا. ضيف سؤال من بنك الأسئلة.</div>`}</div>
    <section class="panel general-notes">${panelHeading('SESSION NOTES', 'ملاحظات عامة')}<label class="sr-only" for="general-notes">ملاحظات عامة على المتقدم</label><textarea id="general-notes" data-bind="general-notes" rows="3" placeholder="ملخص سريع عن نقاط القوة، نقاط التحسين، أو أي ملاحظة مهمة...">${esc(c.overallNotes)}</textarea></section></section>
  <aside>${scoreCard(c)}</aside></div>`, 'overview');
}
function bankQuestionCard(q, id) { return `<article class="bank-card"><div class="bank-card-header"><span class="question-code">${q.id}</span><span class="type-tag">${esc(TYPE_LABEL[q.kind])}</span></div><p class="bank-category">${esc(q.category)}</p><h3>${esc(q.text)}</h3><div class="bank-card-footer"><span>${ic('book', 15)} ${esc(CRITERIA.find(c => c.id === q.criterionId)?.label)}</span>${id ? `<button class="mini-button" data-action="add-question" data-id="${esc(id)}" data-question="${q.id}">${ic('plus', 15)} إضافة</button>` : ''}</div></article>`; }
function getFilteredQuestions() { return QUESTIONS.filter(q => (bankCategory === 'all' || q.criterionId === bankCategory) && (!bankQuery || [q.id, q.text, q.category, q.twist].some(t => t.toLowerCase().includes(bankQuery.toLowerCase())))); }
function bankCards() { return getFilteredQuestions().map(q => bankQuestionCard(q)).join('') || `<div class="empty-state">مفيش أسئلة مطابقة. جرّب كلمة بحث تانية.</div>`; }
function bank() { shell(`<div class="page-head"><div><div class="eyebrow">RESOURCE LIBRARY <span class="eyebrow-separator"></span> OPERATIONS</div><h1>بنك <span>الأسئلة.</span></h1><p class="page-subtitle">36 سؤال وموقف عملي من البنك المعتمد، مع متغيرات اختيارية وملاحظات للمحاور.</p></div><div class="head-counter">36 <span>QUESTION CARDS</span></div></div><div class="panel bank-container"><div class="bank-toolbar"><label class="search-input">${ic('search', 18)}<span class="sr-only">بحث في الأسئلة</span><input id="bank-search" placeholder="ابحث بكلمة أو كود السؤال..." value="${esc(bankQuery)}" autocomplete="off"/></label><div class="toolbar-caption">${ic('filter', 18)} فلترة حسب المعيار</div></div><div class="category-chips" role="group" aria-label="فلترة المعايير"><button class="chip ${bankCategory === 'all' ? 'selected' : ''}" data-action="bank-filter" data-category="all">كل الأسئلة</button>${CRITERIA.map(c => `<button class="chip ${bankCategory === c.id ? 'selected' : ''}" data-action="bank-filter" data-category="${c.id}">${esc(c.label)}</button>`).join('')}</div><div class="bank-grid" id="question-grid">${bankCards()}</div></div>`, 'bank'); }
function results() {
    const full = state.candidates.filter(c => c.status === 'completed' && getScore(c) !== null).sort((a, b) => getScore(b) - getScore(a));
    const partial = state.candidates.filter(c => c.status === 'completed' && getScore(c) === null);
    shell(`<div class="page-head"><div><div class="eyebrow">INTERVIEW OUTCOMES <span class="eyebrow-separator"></span> 2026</div><h1>النتائج <span>والقرارات.</span></h1><p class="page-subtitle">الترتيب بيظهر للمقابلات المكتملة في المعايير الستة فقط؛ أي معيار ناقص لا يتحسب بصفر.</p></div><button class="button primary head-button" data-action="export-csv">${ic('download', 18)} تصدير Excel / CSV</button></div>
 <section class="panel results-panel">${panelHeading('RANKING', 'الترتيب حسب التقييم الموزون', `<span class="count-label">${full.length} تقييم كامل</span>`)}<div class="results-table-wrap"><table class="results-table"><thead><tr><th>الترتيب</th><th>المتقدم</th><th>التغطية</th><th>النتيجة</th><th>القرار</th><th></th></tr></thead><tbody>${full.map((c, i) => `<tr><td><span class="rank">${String(i + 1).padStart(2, '0')}</span></td><td><strong>${esc(slotLabel(c))}</strong><small>${esc(c.committee)}</small></td><td>6 / 6</td><td><strong class="result-score">${getScore(c)} <span>/100</span></strong></td><td><select class="decision-select" aria-label="قرار ${esc(slotLabel(c))}" data-change="decision" data-id="${esc(c.id)}">${decisionOptions(c.decision)}</select></td><td><button class="row-open" data-action="open-candidate" data-id="${esc(c.id)}" aria-label="فتح مقابلة ${esc(slotLabel(c))}">${ic('arrow', 18)}</button></td></tr>`).join('') || `<tr><td colspan="6" class="table-empty">الترتيب هيظهر بعد إنهاء مقابلة وتقييم المعايير الستة.</td></tr>`}</tbody></table></div></section>
 <section class="panel partial-results">${panelHeading('REVIEW QUEUE', 'مقابلات تحتاج مراجعة', `<span class="count-label">${partial.length}</span>`)}<div class="partial-list">${partial.map(c => `<div><div><strong>${esc(slotLabel(c))}</strong><small>${getCoverage(c)} / 6 معايير · Not Evaluated</small></div><button class="small-action" data-action="open-candidate" data-id="${esc(c.id)}">استكمال التقييم ${ic('arrow', 16)}</button></div>`).join('') || '<p class="muted-p">لا توجد مقابلات مكتملة بتقييم ناقص.</p>'}</div></section>
 <div class="results-note">${ic('info', 18)} ملف CSV مناسب للفتح في Excel. لحفظ كل الملاحظات والأسئلة والمقابلات لاسترجاعها لاحقًا، استخدم Backup JSON من صفحة البيانات.</div>`, 'results');
}
function decisionOptions(current) { return Object.entries(DECISION_LABEL).map(([v, l]) => `<option value="${v}" ${v === current ? 'selected' : ''}>${esc(l)}</option>`).join(''); }
function settings() { shell(`<div class="page-head"><div><div class="eyebrow">DATA & PRIVACY</div><h1>بياناتك <span>في إيدك.</span></h1><p class="page-subtitle">النسخة الحالية مخصصة لاستخدام شخص واحد على جهاز واحد، من غير حسابات أو مزامنة سحابية.</p></div></div><div class="settings-grid"><section class="panel settings-panel">${panelHeading('BACKUP & RESTORE', 'النسخ الاحتياطي')}<p>صدّر نسخة JSON فيها كل المقابلات والدرجات والملاحظات. تقدر تسترجعها على نفس الجهاز أو جهاز تاني.</p><div class="setting-actions"><button class="button primary" data-action="export-json">${ic('download')} تحميل Backup JSON</button><button class="button secondary" data-action="import-json">${ic('upload')} استرجاع Backup</button></div><div class="notice"><span>${ic('info', 18)}</span> الاسترجاع بيستبدل البيانات الموجودة بالكامل، لذلك اعمل نسخة احتياطية الأول.</div></section><section class="panel settings-panel">${panelHeading('EXPORT', 'التقارير')}<p>حمّل تقرير التقييم النهائي أو تقرير مفصّل بالأسئلة اللي اخترتها والملاحظات المسجلة.</p><div class="setting-actions"><button class="button secondary" data-action="export-csv">${ic('download')} نتائج CSV</button><button class="button secondary" data-action="export-detail">${ic('download')} الأسئلة والملاحظات CSV</button></div></section><section class="panel settings-panel storage-panel">${panelHeading('STORAGE', 'طريقة الحفظ')}<div class="data-fact"><span>البيانات</span><strong>${state.candidates.length} متقدم</strong></div><div class="data-fact"><span>آخر حفظ</span><strong>${new Date(state.lastSavedAt).toLocaleString('ar-EG')}</strong></div><div class="data-fact"><span>المكان</span><strong>هذا المتصفح فقط</strong></div><p class="storage-warning">مسح بيانات المتصفح أو استخدام Incognito ممكن يمسح التقييمات. الموقع المنشور مش بيزامن البيانات بين الموبايل والكمبيوتر.</p></section><section class="panel settings-panel danger-zone">${panelHeading('DANGER ZONE', 'إعادة البدء')}<p>إرجاع القائمة الافتراضية المكونة من 12 مكان لمتقدمين، ومسح كل التقييمات والأسماء والملاحظات المحفوظة على الجهاز الحالي.</p><button class="button danger-button" data-action="reset-data">${ic('trash', 18)} مسح البيانات والبدء من جديد</button></section></div>`, 'settings'); }
function render() { const path = route(); expandedTwist = false; expandedWatch = false; if (path.startsWith('interview/'))
    interview(path.slice(10));
else if (path === 'bank')
    bank();
else if (path === 'results')
    results();
else if (path === 'settings')
    settings();
else
    overview(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function saveDownload(content, filename, mime) { const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
function showDialog(body, headline, footer = '') { const root = $('#modal-root'); if (!root)
    return; root.innerHTML = `<dialog class="app-dialog" aria-labelledby="dialog-title"><div class="dialog-header"><h2 id="dialog-title">${headline}</h2><button class="icon-button" data-action="close-dialog" aria-label="إغلاق">${ic('close', 19)}</button></div><div class="dialog-body">${body}</div>${footer ? `<div class="dialog-footer">${footer}</div>` : ''}</dialog>`; const el = root.querySelector('dialog'); el.addEventListener('click', e => { if (e.target === el)
    el.close(); }); el.addEventListener('close', () => { root.replaceChildren(); }); el.showModal(); el.querySelector('input,button')?.focus(); }
function closeDialog() { $('#modal-root dialog')?.close(); }
function pickQuestionDialog(candidate) { pickQuery = ''; const current = new Set(candidate.questions); showDialog(`<label class="search-input picker-search">${ic('search')}<span class="sr-only">بحث في الأسئلة</span><input id="picker-search" placeholder="ابحث في الـ36 سؤال..." autocomplete="off"></label><p class="picker-hint">الأسئلة اللي بالفعل في المقابلة مش هتظهر تاني.</p><div id="picker-list" class="picker-list">${QUESTIONS.filter(q => !current.has(q.id)).map(q => `<button class="picker-row" data-action="add-question" data-id="${esc(candidate.id)}" data-question="${q.id}"><span><b>${q.id}</b><small>${esc(q.text)}</small></span>${ic('plus', 18)}</button>`).join('')}</div>`, 'اختيار سؤال إضافي'); }
function endDialog(c) { const coverage = getCoverage(c); showDialog(`<div class="confirmation"><div class="confirm-icon">${ic(coverage === 6 ? 'check' : 'info', 25)}</div><p>${coverage === 6 ? 'تم تقييم المعايير الستة. يمكنك إنهاء الجلسة ومراجعة القرار من صفحة النتائج.' : `تم تقييم <b>${coverage} من 6</b> معايير فقط. تقدر تنهي الجلسة، لكن <b>مش هيظهر Total/100</b> لحد ما تكمل الباقي.`}</p></div>`, 'إنهاء المقابلة', `<button class="button secondary" data-action="close-dialog">إلغاء</button><button class="button primary" data-action="confirm-finish" data-id="${esc(c.id)}">تأكيد الإنهاء</button>`); }
function addCandidateDialog() { showDialog(`<form id="add-candidate-form"><label class="form-label" for="candidate-name">اسم المتقدم</label><input class="text-field" id="candidate-name" name="name" maxlength="200" placeholder="اكتب اسم المتقدم" required><label class="form-label" for="candidate-committee">اللجنة</label><input class="text-field" id="candidate-committee" name="committee" maxlength="100" value="Operations" required></form>`, 'إضافة متقدم', `<button class="button secondary" data-action="close-dialog">إلغاء</button><button class="button primary" data-action="save-candidate">إضافة للقائمة</button>`); }
function renameDialog(c) { showDialog(`<form id="rename-form"><label class="form-label" for="rename-input">اسم المتقدم</label><input class="text-field" id="rename-input" name="name" maxlength="200" required value="${esc(c.name)}" placeholder="اسم المتقدم"></form>`, 'تعديل اسم المتقدم', `<button class="button secondary" data-action="close-dialog">إلغاء</button><button class="button primary" data-action="save-name" data-id="${esc(c.id)}">حفظ الاسم</button>`); }
function importDialog() { showDialog(`<p>اختار ملف JSON أصلي تم تصديره من Rally Interview Hub. هنتأكد من صحته قبل الاستبدال.</p><label class="form-label" for="import-file">ملف النسخة الاحتياطية</label><input class="text-field file-field" id="import-file" type="file" accept=".json,application/json"><div class="notice danger">تنبيه: الاسترجاع بيستبدل كل البيانات الحالية. حمّل Backup الأول لو محتاجه.</div>`, 'استرجاع البيانات', `<button class="button secondary" data-action="close-dialog">إلغاء</button><button class="button primary" data-action="confirm-import">استرجاع الملف</button>`); }
function resetDialog() { showDialog(`<p>الخطوة دي هتمسح بيانات المتقدمين وتقييماتهم من المتصفح ده نهائيًا. اكتب <b>RESET</b> للتأكيد.</p><label class="form-label" for="reset-confirm">تأكيد الحذف</label><input id="reset-confirm" class="text-field" autocomplete="off" placeholder="RESET" />`, 'حذف البيانات', `<button class="button secondary" data-action="close-dialog">إلغاء</button><button class="button danger-button" data-action="confirm-reset">مسح نهائي</button>`); }
function currentCandidate() { return route().startsWith('interview/') ? findCandidate(route().slice(10)) : undefined; }
function updateQuestionView() { const c = currentCandidate(); if (c)
    interview(c.id); }
function action(action, el) {
    const id = el.dataset.id;
    const c = id ? findCandidate(id) : currentCandidate();
    switch (action) {
        case 'add-candidate':
            addCandidateDialog();
            break;
        case 'save-candidate': {
            const name = $('#candidate-name')?.value.trim() ?? '';
            const committee = $('#candidate-committee')?.value.trim() ?? '';
            if (!name || !committee) {
                $('#add-candidate-form').reportValidity();
                return;
            }
            const slot = Math.max(0, ...state.candidates.map(c => c.slot)) + 1;
            state.candidates.push(newCandidate(slot, name, committee));
            save();
            closeDialog();
            overview();
            toast('تمت إضافة المتقدم.');
            break;
        }
        case 'open-candidate':
            if (c) {
                go(`interview/${encodeURIComponent(c.id)}`);
            }
            break;
        case 'back-overview':
            go('overview');
            break;
        case 'rename':
            if (c)
                renameDialog(c);
            break;
        case 'save-name':
            if (c) {
                const v = $('#rename-input')?.value.trim() ?? '';
                if (!v) {
                    $('#rename-form').reportValidity();
                    return;
                }
                c.name = v;
                save();
                closeDialog();
                render();
            }
            break;
        case 'jump-scores':
            $('#score-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        case 'jump-question-area':
            $('.question-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        case 'toggle-timer':
            if (c) {
                if (c.timerRunningSince)
                    pauseTimer(c);
                else
                    c.timerRunningSince = Date.now();
                save();
                updateQuestionView();
            }
            break;
        case 'jump-question':
            if (c) {
                c.questionIndex = Number(el.dataset.index) || 0;
                save();
                updateQuestionView();
            }
            break;
        case 'next-question':
            if (c) {
                c.questionIndex = Math.min(c.questionIndex + 1, c.questions.length - 1);
                save();
                updateQuestionView();
            }
            break;
        case 'prev-question':
            if (c) {
                c.questionIndex = Math.max(c.questionIndex - 1, 0);
                save();
                updateQuestionView();
            }
            break;
        case 'toggle-twist':
            expandedTwist = !expandedTwist;
            el.classList.toggle('open', expandedTwist);
            el.setAttribute('aria-expanded', String(expandedTwist));
            {
                const question = QUESTIONS.find(q => q.id === currentCandidate()?.questions[currentCandidate()?.questionIndex ?? 0]);
                if (question) {
                    const box = $('.reveal-box:not(.watch-box)');
                    if (box)
                        box.remove();
                    else {
                        const watch = $('.watch-box');
                        (watch?.parentElement ?? $('.question-tools')?.parentElement)?.querySelector('.question-tools')?.insertAdjacentHTML('afterend', `<div class="reveal-box"><span>TWIST</span><p>${esc(question.twist)}</p></div>`);
                    }
                }
            }
            break;
        case 'toggle-watch': {
            expandedWatch = !expandedWatch;
            el.classList.toggle('open', expandedWatch);
            el.setAttribute('aria-expanded', String(expandedWatch));
            const question = QUESTIONS.find(q => q.id === currentCandidate()?.questions[currentCandidate()?.questionIndex ?? 0]);
            if (question) {
                const box = $('.watch-box');
                if (box)
                    box.remove();
                else
                    $('.question-tools')?.insertAdjacentHTML('afterend', `<div class="reveal-box watch-box"><span>WATCH FOR</span><p>${esc(question.watch)}</p></div>`);
            }
            break;
        }
        case 'mark-asked':
            if (c) {
                const code = c.questions[c.questionIndex];
                if (code) {
                    c.questionAsked[code] = !c.questionAsked[code];
                    save();
                    updateQuestionView();
                }
            }
            break;
        case 'rate':
            if (c) {
                const key = el.dataset.criterion, score = Number(el.dataset.score);
                if (CRITERIA.some(x => x.id === key) && Number.isInteger(score) && score >= 0 && score <= 5) {
                    c.criteriaScores[key] = score;
                    save();
                    updateQuestionView();
                }
            }
            break;
        case 'clear-rate':
            if (c) {
                const key = el.dataset.criterion;
                if (CRITERIA.some(x => x.id === key)) {
                    c.criteriaScores[key] = null;
                    save();
                    updateQuestionView();
                }
            }
            break;
        case 'pick-question':
            if (c)
                pickQuestionDialog(c);
            break;
        case 'add-question':
            if (c) {
                const code = el.dataset.question;
                if (QUESTIONS.some(q => q.id === code) && !c.questions.includes(code)) {
                    c.questions.push(code);
                    c.questionIndex = c.questions.length - 1;
                    save();
                    closeDialog();
                    updateQuestionView();
                    toast('اتضاف السؤال للمقابلة.');
                }
            }
            break;
        case 'finish':
            if (c)
                endDialog(c);
            break;
        case 'confirm-finish':
            if (c) {
                pauseTimer(c);
                c.status = 'completed';
                c.finishedAt = new Date().toISOString();
                save();
                closeDialog();
                go('results');
                toast('تم إنهاء المقابلة.');
            }
            break;
        case 'bank-filter':
            bankCategory = el.dataset.category ?? 'all';
            bank();
            break;
        case 'export-csv':
            saveDownload(resultsCsv(state), 'rally-interview-results.csv', 'text/csv;charset=utf-8');
            toast('تم تجهيز ملف النتائج.');
            break;
        case 'export-detail':
            saveDownload(detailedCsv(state), 'rally-interview-questions.csv', 'text/csv;charset=utf-8');
            break;
        case 'export-json':
            saveDownload(JSON.stringify(state, null, 2), 'rally-interview-backup.json', 'application/json;charset=utf-8');
            toast('تم تجهيز النسخة الاحتياطية.');
            break;
        case 'import-json':
            importDialog();
            break;
        case 'confirm-import': {
            const file = $('#import-file')?.files?.[0];
            if (!file) {
                toast('اختار ملف JSON أولًا.', 'error');
                return;
            }
            if (file.size > 2_000_000) {
                toast('الملف أكبر من الحد المسموح (2MB).', 'error');
                return;
            }
            file.text().then(text => { const restored = validateState(JSON.parse(text)); const previous = state; state = restored; try {
                persistState(state);
                persistError = null;
                closeDialog();
                go('overview');
                render();
                toast('تم استرجاع النسخة الاحتياطية.');
            }
            catch {
                state = previous;
                toast('مساحة التخزين غير كافية. لم تتغير البيانات الحالية.', 'error');
            } }).catch(e => toast(e instanceof Error ? e.message : 'تعذر قراءة الملف.', 'error'));
            break;
        }
        case 'reset-data':
            resetDialog();
            break;
        case 'confirm-reset':
            if ($('#reset-confirm')?.value === 'RESET') {
                state = initialState();
                persistError = null;
                save();
                closeDialog();
                go('overview');
                render();
                toast('تمت إعادة التهيئة.');
            }
            else
                toast('اكتب RESET للتأكيد.', 'error');
            break;
        case 'close-dialog':
            closeDialog();
            break;
    }
}
document.addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el && !el.hasAttribute('disabled')) {
    e.preventDefault();
    action(el.dataset.action, el);
} });
document.addEventListener('input', e => {
    const target = e.target;
    const bind = target.dataset.bind;
    const c = currentCandidate();
    if (bind && c) {
        if (bind === 'question-note' && target.dataset.question)
            c.questionNotes[target.dataset.question] = target.value;
        else if (bind === 'general-notes')
            c.overallNotes = target.value;
        else if (bind === 'criterion-evidence' && target.dataset.criterion)
            c.criteriaEvidence[target.dataset.criterion] = target.value;
        save();
    }
    if (target.id === 'bank-search') {
        bankQuery = target.value;
        const grid = $('#question-grid');
        if (grid)
            grid.innerHTML = bankCards();
    }
    if (target.id === 'picker-search') {
        pickQuery = target.value.toLowerCase();
        const c = currentCandidate();
        const list = $('#picker-list');
        if (c && list)
            list.innerHTML = QUESTIONS.filter(q => !c.questions.includes(q.id) && [q.id, q.text, q.category].some(v => v.toLowerCase().includes(pickQuery))).map(q => `<button class="picker-row" data-action="add-question" data-id="${esc(c.id)}" data-question="${q.id}"><span><b>${q.id}</b><small>${esc(q.text)}</small></span>${ic('plus', 18)}</button>`).join('') || '<div class="empty-state">مفيش نتائج.</div>';
    }
});
document.addEventListener('change', e => {
    const target = e.target;
    if (target.dataset.change === 'filter') {
        activeFilter = target.value;
        overview();
    }
    if (target.dataset.change === 'decision') {
        const c = findCandidate(target.dataset.id ?? '');
        if (c && target.value in DECISION_LABEL) {
            c.decision = target.value;
            save();
            toast('تم حفظ القرار.');
        }
    }
});
document.addEventListener('submit', e => { e.preventDefault(); const target = e.target; if (target.id === 'add-candidate-form')
    action('save-candidate', target); if (target.id === 'rename-form') {
    const c = currentCandidate();
    if (c) {
        const button = document.createElement('button');
        button.dataset.id = c.id;
        action('save-name', button);
    }
} });
window.addEventListener('hashchange', render);
window.addEventListener('storage', e => { if (e.key === 'rally-interview-hub-v1') {
    const latest = loadState();
    if (!latest.error) {
        state = latest.state;
        render();
        toast('اتحدثت البيانات من تبويب تاني.');
    }
} });
setInterval(() => { const c = currentCandidate(); if (c) {
    const timer = $('#timer-readout');
    if (timer)
        timer.textContent = formatTime(getElapsed(c));
} }, 1000);
render();