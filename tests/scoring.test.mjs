import test from 'node:test';
import assert from 'node:assert/strict';
import { CRITERIA, QUESTIONS, PACKS } from '../assets/data/bank.js';
import { initialState, newCandidate, getCoverage, getScore, getCriterionScore, mergeCandidateRoster, csvCell, resultsCsv, validateState, getElapsed, pauseTimer } from '../assets/store.js';

test('Approved source cardinality and weights', () => {
  assert.equal(CRITERIA.length, 6);
  assert.equal(CRITERIA.reduce((sum,c)=>sum+c.weight,0),100);
  assert.equal(QUESTIONS.length, 36);
  assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,36);
  assert.equal(PACKS.length,12);
  for(const set of PACKS) {assert.equal(set.length,3);for(const code of set)assert(QUESTIONS.some(q=>q.id===code));}
});
test('Missing is not zero; full scoring is weighted', () => {
  const c = newCandidate(1);
  assert.equal(getCoverage(c),0);assert.equal(getScore(c),null);
  for(const crit of CRITERIA)c.criteriaScores[crit.id]=0;
  assert.equal(getScore(c),0);
  for(const crit of CRITERIA)c.criteriaScores[crit.id]=5;
  assert.equal(getScore(c),100);
  c.criteriaScores.c1=0;
  assert.equal(getScore(c),85); // c1 weight 15%
  c.criteriaScores.c6=null;
  assert.equal(getScore(c),null);
});
test('Creates only blank 12 slots and preserves source packages',()=>{
  const state=initialState();assert.equal(state.candidates.length,12);
  assert(state.candidates.every(c=>c.name===''));
  assert.equal(state.candidates[0].questions.slice(0,3).join(','), 'OP-01,OP-13,OP-25');
  assert.equal(state.candidates[11].questions.slice(0,3).join(','), 'OP-01,OP-08,OP-14');
  assert(state.candidates.every(c=>c.questions.length===36));
  assert.equal(validateState(JSON.parse(JSON.stringify(state))).candidates.length,12);
});
test('Rejects malformed or duped state',()=>{
  const state=initialState();state.candidates[1].id=state.candidates[0].id;
  assert.throws(()=>validateState(state));
  const valid=initialState();valid.candidates[0].criteriaScores.c1=9;
  assert.throws(()=>validateState(valid));
});
test('Export cannot inject spreadsheet formula',()=>{
  assert.equal(csvCell('=cmd|\'/C calc\'!A0'), '"\'=cmd|\'/C calc\'!A0"');
  const state=initialState();state.candidates[0].name='=2+2';
  assert(resultsCsv(state).includes('"\'=2+2"'));
});
test('Timer semantics are stable',()=>{
  const c=newCandidate(1);
  c.elapsedSeconds=8;c.timerRunningSince=1_000;
  assert.equal(getElapsed(c,6000),13);
  pauseTimer(c,6000);
  assert.equal(c.timerRunningSince,null);
  assert.equal(c.elapsedSeconds,13);
});


test('Question ratings affect only their linked criterion, average repeated evidence',()=>{
  const c=newCandidate(1);
  c.questionScores['OP-01']=5;
  assert.equal(getCriterionScore(c,'c1'),5);
  assert.equal(getCriterionScore(c,'c2'),null);
  assert.equal(getCoverage(c),1);assert.equal(getScore(c),null);
  c.questionScores['OP-02']=3;
  assert.equal(getCriterionScore(c,'c1'),4);
  for (const cr of CRITERIA.filter(x=>x.id!=='c1')) {
    const q=QUESTIONS.find(x=>x.criterionId===cr.id);
    c.questionScores[q.id]=5;
  }
  assert.equal(getScore(c),97);
});

test('Old three-card backups gain full queue without losing notes or scores',()=>{
  const c=newCandidate(1);c.questions=c.questions.slice(0,3);c.questionNotes['OP-01']='keep me';c.criteriaScores.c1=4;
  const state={version:1,candidates:[c],lastSavedAt:new Date().toISOString()};
  const loaded=validateState(JSON.parse(JSON.stringify(state))).candidates[0];
  assert.equal(loaded.questions.length,36);
  assert.equal(loaded.questionNotes['OP-01'],'keep me');
  assert.equal(getCriterionScore(loaded,'c1'),4);
});

test('Roster import merges safely, is idempotent, preserves existing interview work',()=>{
  const state=initialState();
  state.candidates[0].status='in_progress';state.candidates[0].name='Custom started';
  state.candidates[0].questionNotes['OP-01']='important';
  const entries=Array.from({length:13},(_,i)=>({sourceId:`OP-${i+2}`,name:`Candidate ${i+1}`,committee:'Operations'}));
  const first=mergeCandidateRoster(state,entries);
  assert.equal(first.imported,13);assert.equal(state.candidates.length,14);
  assert.equal(state.candidates[0].name,'Custom started');
  assert.equal(state.candidates[0].questionNotes['OP-01'],'important');
  assert.equal(mergeCandidateRoster(state,entries).existing,13);
  assert.equal(state.candidates.length,14);
  const restored=validateState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.candidates.filter(c=>c.rosterKey).length,13);
  assert.throws(()=>mergeCandidateRoster(restored,[entries[0],entries[0]]));
});