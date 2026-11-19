import test from 'node:test';
import assert from 'node:assert/strict';
import { CRITERIA, QUESTIONS, PACKS } from '../assets/data/bank.js';
import { initialState, newCandidate, getCoverage, getScore, csvCell, resultsCsv, validateState, getElapsed, pauseTimer } from '../assets/store.js';

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
  assert.equal(state.candidates[0].questions.join(','), 'OP-01,OP-13,OP-25');
  assert.equal(state.candidates[11].questions.join(','), 'OP-01,OP-08,OP-14');
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