import test from 'node:test';
import assert from 'node:assert/strict';
import { CRITERIA, QUESTIONS } from '../assets/data/bank.js';
import { initialState, newCandidate, questionRound, nextInterviewQuestion, previousInterviewQuestion, questionAttemptKey, getCoverage, getScore, getCriterionScore, mergeCandidateRoster, csvCell, resultsCsv, detailedCsv, validateState, getElapsed, pauseTimer } from '../assets/store.js';

const APPROVED = ['OP-01','OP-02','OP-07','OP-08','OP-10','OP-13','OP-15','OP-16','OP-19','OP-22','OP-25','OP-26','OP-30','OP-31','OP-33'];
function seeded(seed=12345){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};}
const category = (code) => QUESTIONS.find(q=>q.id===code)?.criterionId;

test('Bank matches the fifteen president-approved scenarios and all six weighted criteria',()=>{
  assert.deepEqual(QUESTIONS.map(q=>q.id),APPROVED);
  assert.deepEqual(QUESTIONS.map(q=>q.boardNumber),Array.from({length:15},(_,i)=>i+1));
  assert.equal(QUESTIONS.length,15);
  assert.equal(CRITERIA.length,6);
  assert.equal(CRITERIA.reduce((n,c)=>n+c.weight,0),100);
  assert.deepEqual(CRITERIA.map(c=>QUESTIONS.filter(q=>q.criterionId===c.id).length),[2,3,3,2,3,2]);
});

test('Every random six-question round covers six distinct criteria',()=>{
 for(let seed=0;seed<150;seed++){
  const rng=seeded(seed+1);let history=[];
  for(let round=0;round<7;round++){
   const six=questionRound(history,rng);
   assert.equal(six.length,6);
   assert.equal(new Set(six.map(category)).size,6,`seed ${seed}, round ${round}`);
   assert(six.every(code=>APPROVED.includes(code)));
   history.push(...six);
  }
 }
});

test('Questions are not repeated within a criterion until every approved alternative has been used',()=>{
 for(let seed=1;seed<100;seed++){
  let history=[],rng=seeded(seed);
  for(let i=0;i<6;i++){
   const next=questionRound(history,rng);
   history.push(...next);
  }
  for(const criterion of CRITERIA){
   const picked=history.filter(q=>category(q)===criterion.id);
   const unique=QUESTIONS.filter(q=>q.criterionId===criterion.id).length;
   assert.equal(new Set(picked.slice(0,unique)).size,unique);
  }
 }
});

test('New and existing blank candidates start with six covered criteria; round two starts on demand',()=>{
 const state=initialState();assert.equal(state.candidates.length,12);
 for(const c of state.candidates){
  assert.equal(c.name,'');assert.equal(c.bankVersion,2);
  assert.equal(c.questions.length,6);
  assert.equal(new Set(c.questions.map(category)).size,6);
 }
 const c=newCandidate(17);
 c.questionIndex=5;
 nextInterviewQuestion(c,seeded(9));
 assert.equal(c.questionIndex,6);
 assert.equal(c.questions.length,12);
 assert.equal(new Set(c.questions.slice(6,12).map(category)).size,6);
 previousInterviewQuestion(c);
 assert.equal(c.questionIndex,5);
 nextInterviewQuestion(c);
 assert.equal(c.questionIndex,6);
 assert.equal(c.questions.length,12); // no duplicate round after navigation backwards
 previousInterviewQuestion(c);previousInterviewQuestion(c);previousInterviewQuestion(c);previousInterviewQuestion(c);previousInterviewQuestion(c);previousInterviewQuestion(c);
 assert.equal(c.questionIndex,0);previousInterviewQuestion(c);assert.equal(c.questionIndex,0); // no wrap
});

test('Continuous rounds preserve separate notes and scores if a card repeats',()=>{
 const c=newCandidate(1);
 for(let i=0;i<24;i++)nextInterviewQuestion(c,seeded(i+1));
 assert.equal(c.questions.length,30);
 assert.equal(c.questionIndex,24);
 const first=c.questions[0], repeat=c.questions.findIndex((code,i)=>i>0 && code===first);
 assert(repeat>0);
 const key1=questionAttemptKey(c,0),key2=questionAttemptKey(c,repeat);
 assert.notEqual(key1,key2);
 c.questionScores[key1]=5;c.questionScores[key2]=1;
 c.questionNotes[key1]='first';c.questionNotes[key2]='second';
 assert.equal(getCriterionScore(c,category(first)),3);
 const valid=validateState(JSON.parse(JSON.stringify({version:1,candidates:[c],lastSavedAt:new Date().toISOString()}))).candidates[0];
 assert.equal(valid.questionScores[key1],5);
 assert.equal(valid.questionScores[key2],1);
 assert.equal(valid.questionNotes[key1],'first');
 assert.equal(valid.questionNotes[key2],'second');
 assert(detailedCsv({version:1,candidates:[valid],lastSavedAt:new Date().toISOString()}).includes(key2));
});

test('Each card only affects its linked criterion and weighting handles missing separately from zero',()=>{
 const c=newCandidate(1);
 assert.equal(getCoverage(c),0);assert.equal(getScore(c),null);
 for(let i=0;i<6;i++){
  const code=c.questions[i],key=questionAttemptKey(c,i);
  c.questionScores[key]=5;
  assert.equal(getCoverage(c),i+1);
 }
 assert.equal(getScore(c),100);
 const first=c.questions[0],key=questionAttemptKey(c,0),w=CRITERIA.find(cr=>cr.id===category(first)).weight;
 c.questionScores[key]=0;
 assert.equal(getScore(c),100-w);
 delete c.questionScores[key];
 assert.equal(getScore(c),null);
});

test('Legacy 36-question backup migrates without dropping completed scores or notes',()=>{
 const c=newCandidate(1);
 c.bankVersion=undefined;
 c.questions=Array.from({length:36},(_,i)=>`OP-${String(i+1).padStart(2,'0')}`);
 c.questionIndex=16;
 c.status='in_progress';c.startedAt=new Date().toISOString();
 c.questionScores={'OP-14':2,'OP-01':4,'OP-25':5};
 c.questionAsked={'OP-14':true,'OP-01':true};
 c.questionNotes={'OP-14':'historical crisis','OP-01':'previous note'};
 const beforeScore=getCriterionScore(c,'c3');
 const migrated=validateState({version:1,candidates:[c],lastSavedAt:new Date().toISOString()}).candidates[0];
 assert.equal(migrated.bankVersion,2);
 assert.equal(migrated.archivedQuestions.length,36);
 assert(migrated.questions.every(code=>APPROVED.includes(code)));
 assert.equal(migrated.questionScores['OP-14'],2);
 assert.equal(migrated.questionNotes['OP-14'],'historical crisis');
 assert.equal(getCriterionScore(migrated,'c3'),beforeScore);
 assert(detailedCsv({version:1,candidates:[migrated],lastSavedAt:new Date().toISOString()}).includes('historical crisis'));
 const again=validateState({version:1,candidates:[migrated],lastSavedAt:new Date().toISOString()}).candidates[0];
 assert.deepEqual(again.questions,migrated.questions); // one-time migration only
});

test('Legacy untouched slots migrate to random complete rounds while keeping roster identities',()=>{
 const c=newCandidate(4,'Test Person');c.bankVersion=undefined;
 c.questions=Array.from({length:36},(_,i)=>`OP-${String(i+1).padStart(2,'0')}`);
 c.rosterKey='OP-12';
 const restored=validateState({version:1,candidates:[c],lastSavedAt:new Date().toISOString()}).candidates[0];
 assert.equal(restored.rosterKey,'OP-12');
 assert.equal(restored.name,'Test Person');
 assert.equal(restored.questions.length,6);
 assert.equal(new Set(restored.questions.map(category)).size,6);
});

test('Validation rejects incorrect attempt keys, scores and candidate duplicates',()=>{
 const state=initialState();state.candidates[1].id=state.candidates[0].id;assert.throws(()=>validateState(state));
 const s=initialState();s.candidates[0].questionScores['OP-01~2']=6;assert.throws(()=>validateState(s));
 s.candidates[0].questionScores={'OP-37':3};assert.throws(()=>validateState(s));
});

test('Roster merge stays idempotent and preserves interview work',()=>{
 const state=initialState();state.candidates[0].name='Custom started';state.candidates[0].status='in_progress';state.candidates[0].questionNotes[state.candidates[0].questions[0]]='important';
 const entries=Array.from({length:13},(_,i)=>({sourceId:`OP-${i+2}`,name:`Candidate ${i+1}`,committee:'Operations'}));
 assert.equal(mergeCandidateRoster(state,entries).imported,13);
 assert.equal(state.candidates.length,14);
 assert.equal(state.candidates[0].name,'Custom started');
 assert.equal(mergeCandidateRoster(state,entries).existing,13);
 assert.equal(validateState(JSON.parse(JSON.stringify(state))).candidates.filter(c=>c.rosterKey).length,13);
});

test('Export formula-injection protection and timer remain correct',()=>{
 assert.equal(csvCell('=2+2'),"\"'=2+2\"");
 const s=initialState();s.candidates[0].name='=2+2';assert(resultsCsv(s).includes("\"'=2+2\""));
 const c=newCandidate(1);c.elapsedSeconds=8;c.timerRunningSince=1000;
 assert.equal(getElapsed(c,6000),13);pauseTimer(c,6000);assert.equal(c.elapsedSeconds,13);
});