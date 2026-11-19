import { CRITERIA, PACKS, QUESTIONS } from './data/bank.js';

export type InterviewStatus = 'not_started' | 'in_progress' | 'completed';
export type Decision = 'pending' | 'accepted' | 'rejected' | 'waitlist';
export interface Candidate {
  id: string;
  slot: number;
  name: string;
  committee: string;
  status: InterviewStatus;
  questions: string[];
  questionIndex: number;
  questionNotes: Record<string, string>;
  questionAsked: Record<string, boolean>;
  questionScores: Record<string, number>;
  rosterKey?: string;
  criteriaScores: Record<string, number | null>;
  criteriaEvidence: Record<string, string>;
  overallNotes: string;
  decision: Decision;
  startedAt: string | null;
  finishedAt: string | null;
  elapsedSeconds: number;
  timerRunningSince: number | null;
}
export interface AppState { version: 1; candidates: Candidate[]; lastSavedAt: string }
export const STORAGE_KEY = 'rally-interview-hub-v1';
export const CRITERION_IDS: string[] = CRITERIA.map(c => c.id);
export const QUESTION_IDS: string[] = QUESTIONS.map(q => q.id);

export function questionSequence(slot: number): string[] {
  const first: string[] = [...(PACKS[(slot-1)%PACKS.length] ?? PACKS[0])];
  for (const criterion of CRITERIA) {
    if (!first.some(id=>QUESTIONS.find(q=>q.id===id)?.criterionId===criterion.id)) {
      const option = QUESTIONS.find(q=>q.criterionId===criterion.id && !first.includes(q.id));
      if (option) first.push(option.id);
    }
  }
  // A complete queue from day one, without requiring manual card additions.
  for (let index=0;index<6;index++) {
    const criterion=CRITERIA[(index+slot-1)%CRITERIA.length];
    for (const question of QUESTIONS.filter(q=>q.criterionId===criterion.id)) {
      if (!first.includes(question.id)) first.push(question.id);
    }
  }
  return first;
}

const QUESTION_SET = new Set(QUESTION_IDS);

export function newCandidate(slot: number, name = '', committee = 'Operations'): Candidate {
  const scores: Record<string, number|null> = {};
  const evidence: Record<string, string> = {};
  CRITERIA.forEach(c => { scores[c.id] = null; evidence[c.id] = ''; });
  return { id: `candidate-${slot}-${Math.random().toString(36).slice(2, 10)}`, slot, name, committee,
    status: 'not_started', questions: questionSequence(slot),
    questionIndex: 0, questionNotes: {}, questionAsked: {}, questionScores: {}, criteriaScores: scores,
    criteriaEvidence: evidence, overallNotes: '', decision: 'pending', startedAt: null,
    finishedAt: null, elapsedSeconds: 0, timerRunningSince: null };
}

export function initialState(): AppState {
  return { version: 1, candidates: Array.from({length:12},(_,index)=>newCandidate(index+1)), lastSavedAt: new Date().toISOString() };
}

export function validateState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') throw new Error('ملف النسخة الاحتياطية غير صالح.');
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1 || !Array.isArray(obj.candidates) || obj.candidates.length > 1000) throw new Error('نسخة غير مدعومة أو حجمها غير صالح.');
  const seen = new Set<string>();
  const candidates = obj.candidates.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error('فيه سجل متقدم غير صالح.');
    const c = entry as Record<string, unknown>;
    if (typeof c.id !== 'string' || c.id.length > 100 || seen.has(c.id)) throw new Error('معرّف متقدم غير صالح أو متكرر.');
    seen.add(c.id);
    if (typeof c.name !== 'string' || c.name.length > 200 || typeof c.committee !== 'string' || c.committee.length > 100) throw new Error('بيانات متقدم غير صالحة.');
    if (!['not_started','in_progress','completed'].includes(String(c.status))) throw new Error('حالة المقابلة غير صالحة.');
    if (!['pending','accepted','rejected','waitlist'].includes(String(c.decision))) throw new Error('قرار المقابلة غير صالح.');
    if (!Array.isArray(c.questions) || c.questions.length > QUESTION_IDS.length || c.questions.some(q=>typeof q !== 'string' || !QUESTION_SET.has(q)) || new Set(c.questions).size!==c.questions.length) throw new Error('قائمة الأسئلة غير صالحة.');
    if (!Number.isSafeInteger(c.slot) || Number(c.slot) <= 0 || !Number.isInteger(c.questionIndex)) throw new Error('ترقيم المقابلة غير صالح.');
    const scores: Record<string,number|null> = {};
    for (const id of CRITERION_IDS) {
      const score = (c.criteriaScores as Record<string, unknown> | undefined)?.[id];
      if (score !== null && !(typeof score === 'number' && Number.isInteger(score) && score >=0 && score<=5)) throw new Error('درجات تقييم غير صالحة.');
      scores[id] = score as number|null;
    }
    const strRecord = (v: unknown):Record<string,string>=> {
      if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('ملاحظات غير صالحة.');
      const out:Record<string,string>={};
      for (const [k,val] of Object.entries(v)) {if (typeof val !== 'string' || val.length > 15000) throw new Error('حقل ملاحظات غير صالح.'); out[k]=val;}
      return out;
    };
    const questionNotes = strRecord(c.questionNotes);
    if (Object.keys(questionNotes).some(k=>!QUESTION_SET.has(k))) throw new Error('ملاحظات مرتبطة بسؤال غير معروف.');
    const scoreRecord = c.questionScores === undefined ? {} : c.questionScores;
    if (!scoreRecord || typeof scoreRecord !== 'object' || Array.isArray(scoreRecord)) throw new Error('درجات الأسئلة غير صالحة.');
    const questionScores: Record<string,number> = {};
    for (const [key,value] of Object.entries(scoreRecord)) {
      if (!QUESTION_SET.has(key) || typeof value !== 'number' || !Number.isInteger(value) || value<0 || value>5) throw new Error('درجة سؤال غير صالحة.');
      questionScores[key]=value;
    }
    const rosterKey = c.rosterKey === undefined ? undefined : c.rosterKey;
    if (rosterKey !== undefined && (typeof rosterKey !== 'string' || !/^OP-[0-9]{1,4}$/.test(rosterKey))) throw new Error('معرّف القائمة غير صالح.');
    const criteriaEvidence = strRecord(c.criteriaEvidence);
    if (Object.keys(criteriaEvidence).some(k=>!CRITERION_IDS.includes(k))) throw new Error('دليل مرتبط بمعيار غير معروف.');
    if (!c.questionAsked || typeof c.questionAsked !== 'object' || Array.isArray(c.questionAsked)) throw new Error('حالة الأسئلة غير صالحة.');
    const questionAsked: Record<string, boolean> = {};
    for (const [key,val] of Object.entries(c.questionAsked)) {if (!QUESTION_SET.has(key) || typeof val !== 'boolean') throw new Error('حالة سؤال غير صالحة.'); questionAsked[key]=val;}
    if (typeof c.overallNotes !== 'string' || c.overallNotes.length > 15000) throw new Error('الملاحظات العامة غير صالحة.');
    const elapsed = Number(c.elapsedSeconds);
    if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 1e9) throw new Error('وقت المقابلة غير صالح.');
    const since = c.timerRunningSince;
    if (since !== null && !(typeof since === 'number' && Number.isFinite(since) && since>0)) throw new Error('المؤقت غير صالح.');
    const date = (value:unknown):string|null=>value===null?null:(typeof value==='string' && !Number.isNaN(Date.parse(value)) ? value:(()=>{throw new Error('تاريخ غير صالح.');})());
    return {
      id:c.id as string, slot: c.slot as number, name:c.name as string, committee:c.committee as string,
      status:c.status as InterviewStatus, questions:[...(c.questions as string[]), ...questionSequence(c.slot as number).filter(id=>!(c.questions as string[]).includes(id))],
      questionIndex: Math.max(0, Math.min(Number(c.questionIndex), Math.max(0,c.questions.length-1))),
      questionNotes, questionAsked, questionScores, rosterKey:rosterKey as string|undefined, criteriaScores:scores, criteriaEvidence,
      overallNotes:c.overallNotes as string, decision:c.decision as Decision,
      startedAt: date(c.startedAt), finishedAt: date(c.finishedAt),
      elapsedSeconds:elapsed, timerRunningSince: since as number|null
    } as Candidate;
  });
  return { version:1, candidates, lastSavedAt: typeof obj.lastSavedAt === 'string' ? obj.lastSavedAt : new Date().toISOString() };
}

export function loadState(): {state: AppState; error: string|null} {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    return serialized ? {state:validateState(JSON.parse(serialized)),error:null} : {state:initialState(),error:null};
  } catch { return {state:initialState(),error:'تعذر قراءة البيانات المحفوظة. لم يتم استبدال الملف القديم، صدّر نسخة احتياطية قبل أي تعديل.'}; }
}
export function persistState(state: AppState): void {
  state.lastSavedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
export function getCriterionScore(candidate: Candidate, criterionId: string): number|null {
  const ratings = Object.entries(candidate.questionScores??{})
    .filter(([id]) => QUESTIONS.find(q=>q.id===id)?.criterionId===criterionId)
    .map(([,score])=>score);
  if (ratings.length) return Math.round((ratings.reduce((a,b)=>a+b,0)/ratings.length)*10)/10;
  // Preserve legacy manual ratings from interviews recorded in the previous release.
  return candidate.criteriaScores[criterionId]??null;
}
export function getCoverage(candidate:Candidate):number {return CRITERIA.filter(c=>getCriterionScore(candidate,c.id)!==null).length;}
export function getScore(candidate:Candidate):number|null {
  if (getCoverage(candidate)!==CRITERIA.length) return null;
  const score= CRITERIA.reduce((sum,c)=>sum+((getCriterionScore(candidate,c.id) ?? 0)/5)*c.weight,0);
  return Math.round(score*10)/10;
}

export interface RosterEntry { sourceId:string; name:string; committee:'Operations' }
export function mergeCandidateRoster(state:AppState, entries:RosterEntry[]):{imported:number; linked:number; existing:number} {
  if (!Array.isArray(entries)||entries.length===0||entries.length>100) throw new Error('قائمة المتقدمين غير صالحة.');
  const ids=new Set<string>();const names=new Set<string>();
  const normalize=(name:string)=>name.trim().toLocaleLowerCase().replace(/\s+/g,' ');
  let imported=0,linked=0,existing=0;
  for (const row of entries) {
    if (!row || typeof row.sourceId!=='string'||!/^OP-[0-9]{1,4}$/.test(row.sourceId)||typeof row.name!=='string'||!row.name.trim()||row.name.length>200||row.committee!=='Operations') throw new Error('بيانات القائمة غير صالحة.');
    const name=normalize(row.name);
    if(ids.has(row.sourceId)||names.has(name))throw new Error('فيه متقدم مكرر في الملف.');
    ids.add(row.sourceId);names.add(name);
  }
  for(const row of entries){
    const byId=state.candidates.find(c=>c.rosterKey===row.sourceId);
    if(byId){existing++;continue;}
    const match=state.candidates.find(c=>normalize(c.name)===normalize(row.name)&&c.committee==='Operations');
    if(match){match.rosterKey=row.sourceId;linked++;continue;}
    const empty=state.candidates.find(c=>!c.name.trim()&&c.status==='not_started'&&!c.startedAt&&c.decision==='pending'&&Object.keys(c.questionScores??{}).length===0&&Object.values(c.questionNotes).every(x=>!x)&&!c.overallNotes);
    if(empty){empty.name=row.name.trim();empty.rosterKey=row.sourceId;empty.committee='Operations';}
    else{const slot=Math.max(0,...state.candidates.map(c=>c.slot))+1;const candidate=newCandidate(slot,row.name.trim());candidate.rosterKey=row.sourceId;state.candidates.push(candidate);}
    imported++;
  }
  return {imported,linked,existing};
}
export function getElapsed(candidate:Candidate, now=Date.now()):number {
  return Math.max(0, candidate.elapsedSeconds + (candidate.timerRunningSince?Math.max(0,(now-candidate.timerRunningSince)/1000):0));
}
export function pauseTimer(candidate:Candidate,now=Date.now()):void {
  candidate.elapsedSeconds=getElapsed(candidate,now);candidate.timerRunningSince=null;
}
export function csvCell(value:unknown):string {
  let str=String(value??'');
  // Prevent spreadsheet formula injection in exported free-text cells.
  if (/^[\s]*[=+@-]/.test(str)) str="'"+str;
  return '"'+str.replace(/"/g,'""')+'"';
}
export function resultsCsv(state:AppState):string {
  const head=['Slot','Name','Committee','Status','Decision','Coverage','Score / 100',...CRITERIA.map(c=>c.label),'Asked questions','Notes'];
  const rows=state.candidates.map(c=>[c.slot,c.name,c.committee,c.status,c.decision,`${getCoverage(c)}/6`,getScore(c)??'Not Evaluated',...CRITERIA.map(cr=>getCriterionScore(c,cr.id)??'Not Evaluated'),c.questions.filter(q=>c.questionAsked[q]).join('; '),c.overallNotes]);
  return '\uFEFF'+[head,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');
}
export function detailedCsv(state:AppState):string {
  const rows:Array<(string|number)[]>=[['Slot','Name','Question code','Type','Question','Asked','Question score / 5','Criterion','Interviewer notes']];
  for (const c of state.candidates) for (const code of c.questions) {
    const q=QUESTIONS.find(x=>x.id===code);
    if(q)rows.push([c.slot,c.name,code,q.kind,q.text,c.questionAsked[code]?'Yes':'No',c.questionScores?.[code]??'Not Evaluated',CRITERIA.find(cr=>cr.id===q.criterionId)?.label??'',c.questionNotes[code]??'']);
  }
  return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}