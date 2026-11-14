#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const commands={
 help:[],acquisitions:[],tasks:['acquisition'], 'day-one':['acquisition'],blockers:['acquisition'],
 workstreams:['acquisition'],initiatives:['acquisition'],benefits:['acquisition','period'],
 'benefit-detail':['acquisition','period'],risks:['acquisition'],attention:['acquisition'],
 compliance:['acquisition'],'weekly-review':['acquisition'],detail:['acquisition'],imports:[],audit:[],
 'add-acquisition':['name','owner','close-date','currency','purpose','actor'],
 'close-acquisition':['acquisition','date','evidence','actor'],
 'review-governance':['acquisition','owner','purpose','access-review','retention-review','actor','reason'],
 'add-task':['acquisition','name','workstream','owner','due','day-one','actor'],
 'update-task':['task','status','owner','due','evidence','actor','reason'],
 'depend':['task','on','actor'], 'add-initiative':['acquisition','name','owner','task','kind','actor'],
 'plan-benefit':['initiative','period','amount','actor'],
 'record-actual':['initiative','period','amount','evidence','actor','reason'],
 'review-benefit':['initiative','period','actor'],
 'add-risk':['acquisition','name','owner','severity','due','actor'],
 'resolve-risk':['risk','resolution','actor'],log:['acquisition','text','actor'],
 import:['file','mapping','dry-run','actor'],export:['out'], 'draft-steering-pack':['acquisition']
};
const writes=new Set(Object.keys(commands).filter(x=>/^(add-|update-|review-|plan-|record-|resolve-)/.test(x)).concat(['depend','log','import','close-acquisition']));
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
const iso=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`Invalid date: ${v}. Use YYYY-MM-DD`);return v;};
const month=v=>{iso(v);if(!v.endsWith('-01'))throw Error('Period must be the first day of a month');return v;};
const cents=v=>{if(!/^\d+(\.\d{1,2})?$/.test(v))throw Error('Amount must be nonnegative with at most two decimal places');const n=Math.round(Number(v)*100);if(!Number.isSafeInteger(n)||n>100000000000)throw Error('Amount exceeds limit');return n;};
const currency=v=>{if(!['NZD','AUD','USD','GBP','EUR'].includes(v))throw Error('Unsupported currency');return v;};
const today=()=>new Date().toISOString().slice(0,10);
function bool(v){if(v===undefined||v===false||v==='false')return false;if(v===true||v==='true')return true;throw Error('Boolean must be true or false');}
export function parse(args){
 const [command='help',...rest]=args;const options={},positional=[];
 for(const arg of rest){if(arg.startsWith('--')){const [k,...v]=arg.slice(2).split('=');if(k in options)throw Error(`Duplicate flag --${k}`);options[k]=v.length?v.join('='):true;}else positional.push(arg);}
 if(!(command in commands))throw Error(`Unknown command ${command}`);
 for(const k of Object.keys(options))if(!commands[command].includes(k)&&k!=='json')throw Error(`Unknown flag --${k} for ${command}`);
 if(positional.length&&!(command==='import'&&positional.length===1&&positional[0]==='midaxo'))throw Error('Unexpected positional argument');
 if(command==='import'&&positional[0]!=='midaxo')throw Error('Use import midaxo');
 return {command,options};
}
async function match(db,relation,value){
 if(!value)throw Error(`Select ${relation} by name or ID`);
 const rows=await db.query(`select * from ${relation} where lower(name)=lower($1) or id::text like $2 order by name,id`,[value,value.toLowerCase()+'%']);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${relation}:\n${rows.map(r=>`${r.id} ${r.name}`).join('\n')}`:`No ${relation} match: ${value}`);
 return rows[0];
}
async function audit(db,action,id,actor,detail){await db.query('insert into audit_events(action,record_id,actor,detail) values($1,$2,$3,$4)',[action,id,actor,JSON.stringify(detail)]);}
async function acqId(db,o){return o.acquisition?(await match(db,'acquisitions',o.acquisition)).id:null;}
async function read(db,cmd,o){
 const aid=await acqId(db,o);const params=[aid];const filter='($1::uuid is null or acquisition_id=$1)';
 if(cmd==='acquisitions')return db.query('select id,name,owner,close_date,currency,source_stage from acquisitions order by name');
 if(cmd==='tasks'||cmd==='day-one'||cmd==='blockers')return db.query(`select id,acquisition,name,workstream,owner,due_date,status,blockers,days_overdue,stale from task_board where ${filter} ${cmd==='day-one'?'and day_one':cmd==='blockers'?'and blockers>0':''} order by due_date,name`,params);
 if(cmd==='workstreams')return db.query(`select acquisition,workstream,count(*)::int as tasks,count(*) filter(where status='done' and blockers=0)::int as complete,count(*) filter(where blockers>0)::int as blocked,count(*) filter(where days_overdue>0)::int as overdue from task_board where ${filter} group by acquisition,workstream order by acquisition,workstream`,params);
 if(cmd==='initiatives')return db.query(`select i.id,a.name as acquisition,i.name,i.owner,i.kind,t.name as dependency from initiatives i join acquisitions a on a.id=i.acquisition_id left join tasks t on t.id=i.task_id where ($1::uuid is null or i.acquisition_id=$1) order by i.name`,params);
 if(cmd==='benefits'||cmd==='benefit-detail')return db.query(`select ${cmd==='benefits'?'acquisition,currency,period,planned_net_cents,reported_net_cents,accepted_net_cents,variance_cents,missing_actuals,held_actuals':'id,acquisition,initiative,kind,currency,period,planned_cents,actual_cents,evidence,recorded_by,reviewed_by,accepted'} from ${cmd==='benefits'?'benefit_summary':'benefit_detail'} where ${filter} and ($2::date is null or period=$2) order by acquisition,period`,[aid,o.period?month(o.period):null]);
 if(cmd==='risks')return db.query(`select id,name,owner,severity,due_date,status,resolution from risks where ${filter} order by due_date,name`,params);
 if(cmd==='compliance')return db.query(`select acquisition,rule,source from compliance_attention where ${filter} order by acquisition,rule`,params);
 if(cmd==='attention')return db.query(`select acquisition,name,'task_overdue' as reason from task_board where ${filter} and days_overdue>0 union all select acquisition,name,'task_stale' from task_board where ${filter} and status<>'done' and stale union all select acquisition,name,'owner_missing' from task_board where ${filter} and trim(owner)='' union all select acquisition,name,'dependency_open' from task_board where ${filter} and blockers>0 union all select a.name,r.name,'risk_overdue' from risks r join acquisitions a on a.id=r.acquisition_id where ${filter} and r.status='open' and r.due_date<current_date order by acquisition,name,reason`,params);
 if(cmd==='weekly-review')return {workstreams:await read(db,'workstreams',o),attention:await read(db,'attention',o),benefits:await read(db,'benefits',o),compliance:await read(db,'compliance',o)};
 if(cmd==='detail'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));
  return {acquisition:a,tasks:await read(db,'tasks',o),initiatives:await read(db,'initiatives',o),benefits:await read(db,'benefit-detail',o),risks:await read(db,'risks',o),notes:await db.query('select body,actor,created_at from notes where acquisition_id=$1 order by created_at,id',[a.id])};
 }
 if(cmd==='imports')return db.query('select id,source,fingerprint,row_count,actor,created_at from imports order by created_at,id');
 if(cmd==='audit')return db.query('select * from audit_events order by created_at,id');
 throw Error('Unknown read');
}
async function importProjects(db,o,actor){
 const file=required(o,'file'), raw=parseCsv(fs.readFileSync(file,'utf8'));
 if(!raw.length)throw Error('CSV has no records');
 const mapping=JSON.parse(fs.readFileSync(required(o,'mapping'),'utf8'));
 const allowed=['source_id','name','stage','owner','close_date','currency'];
 if(Object.keys(mapping).some(k=>!allowed.includes(k)))throw Error('Unknown mapping key');
 for(const k of ['source_id','name'])if(!mapping[k])throw Error(`Mapping needs ${k}`);
 for(const col of Object.values(mapping))if(typeof col!=='string'||!(col in raw[0]))throw Error(`Missing mapped column: ${col}`);
 const rows=raw.map((row,n)=>{
  const mapped=Object.fromEntries(Object.entries(mapping).map(([k,col])=>[k,String(row[col]).trim()]));
  if(!mapped.source_id||!mapped.name)throw Error(`Row ${n+2} requires source ID and name`);
  return {source_id:mapped.source_id,name:mapped.name,source_stage:mapped.stage||'',owner:mapped.owner||'',close_date:mapped.close_date?iso(mapped.close_date):null,currency:currency(mapped.currency||'NZD')};
 });
 for(const k of ['source_id','name'])if(new Set(rows.map(x=>x[k].toLowerCase())).size!==rows.length)throw Error(`Duplicate ${k} in CSV`);
 const fingerprint=createHash('sha256').update(JSON.stringify({raw,mapping})).digest('hex');
 if((await db.query('select id from imports where fingerprint=$1',[fingerprint])).length)return {already_imported:true,rows:rows.length};
 const actions=[];
 for(const row of rows){
  const existing=await db.query('select * from acquisitions where source_id=$1 or lower(name)=lower($2)',[row.source_id,row.name]);
  if(existing.length){
   const e=existing[0];if(existing.length!==1||e.source_id!==row.source_id||Object.keys(row).some(k=>row[k]!==e[k]))throw Error(`Source conflict for ${row.source_id}; existing records were not overwritten. Reconcile manually.`);
   actions.push({source_id:row.source_id,action:'unchanged'});
  }else actions.push({source_id:row.source_id,action:'insert'});
 }
 if(bool(o['dry-run']))return {dry_run:true,rows:rows.length,actions};
 for(let n=0;n<rows.length;n++)if(actions[n].action==='insert'){
  const row=rows[n];await db.query('insert into acquisitions(source_id,name,source_stage,owner,close_date,currency) values($1,$2,$3,$4,$5,$6)',Object.values(row));
 }
 const [record]=await db.query('insert into imports(fingerprint,kind,mapping,source,raw,row_count,actor) values($1,$2,$3,$4,$5,$6,$7) returning id',[fingerprint,'projects',JSON.stringify(mapping),'Midaxo CSV: '+path.basename(file),JSON.stringify(raw),raw.length,actor]);
 await audit(db,'import',record.id,actor,{rows:raw.length,fingerprint});return {id:record.id,rows:rows.length,actions};
}
async function mutate(db,cmd,o){
 const actor=required(o,'actor');let row;
 if(cmd==='import')return importProjects(db,o,actor);
 if(cmd==='add-acquisition') [row]=await db.query('insert into acquisitions(name,owner,close_date,currency,purpose) values($1,$2,$3,$4,$5) returning *',[required(o,'name'),required(o,'owner'),iso(required(o,'close-date')),currency(o.currency||'NZD'),required(o,'purpose')]);
 else if(cmd==='review-governance'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));required(o,'reason');
  [row]=await db.query('update acquisitions set owner=$2,purpose=$3,access_review=$4,retention_review=$5 where id=$1 returning *',[a.id,required(o,'owner'),required(o,'purpose'),iso(required(o,'access-review')),iso(required(o,'retention-review'))]);
 }else if(cmd==='close-acquisition'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));const date=iso(required(o,'date'));required(o,'evidence');
  if(date>today())throw Error('Actual close date cannot be in the future');
  [row]=await db.query('update acquisitions set close_date=$2 where id=$1 returning *',[a.id,date]);
 }else if(cmd==='add-task'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));
  [row]=await db.query('insert into tasks(acquisition_id,name,workstream,owner,due_date,day_one) values($1,$2,$3,$4,$5,$6) returning *',[a.id,required(o,'name'),required(o,'workstream'),required(o,'owner'),iso(required(o,'due')),bool(o['day-one'])]);
 }else if(cmd==='update-task'){
  const t=await match(db,'tasks',required(o,'task'));required(o,'reason');const status=o.status||t.status;
  if(!['open','doing','done'].includes(status))throw Error('Status must be open, doing or done');
  const evidence=o.evidence===undefined?t.evidence:required(o,'evidence');
  if(status==='done'){
   if(!evidence.trim())throw Error('Completion requires evidence');
   if((await db.query("select p.name from dependencies d join tasks p on p.id=d.prerequisite_id where d.task_id=$1 and p.status<>'done'",[t.id])).length)throw Error('Unfinished dependencies prevent completion');
  }
  [row]=await db.query('update tasks set status=$2,owner=$3,due_date=$4,evidence=$5,reviewed_at=current_date where id=$1 returning *',[t.id,status,o.owner===undefined?t.owner:required(o,'owner'),o.due?iso(o.due):t.due_date,evidence]);
 }else if(cmd==='depend'){
  const t=await match(db,'tasks',required(o,'task')),p=await match(db,'tasks',required(o,'on'));
  if(t.acquisition_id!==p.acquisition_id)throw Error('Dependencies must belong to the same acquisition');
  if(t.status==='done')throw Error('Reopen a completed task before changing its dependencies');
  const cycle=await db.query('with recursive chain(id) as (select $1::uuid union select d.prerequisite_id from dependencies d join chain c on c.id=d.task_id) select id from chain where id=$2',[p.id,t.id]);
  if(cycle.length)throw Error('Dependency cycle rejected');
  [row]=await db.query('insert into dependencies(task_id,prerequisite_id) values($1,$2) returning *',[t.id,p.id]);
 }else if(cmd==='add-initiative'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));const t=o.task?await match(db,'tasks',o.task):null;
  if(t&&t.acquisition_id!==a.id)throw Error('Task belongs to another acquisition');
  if(!['saving','revenue','cost'].includes(o.kind))throw Error('Kind must be saving, revenue or cost');
  [row]=await db.query('insert into initiatives(acquisition_id,name,owner,task_id,kind) values($1,$2,$3,$4,$5) returning *',[a.id,required(o,'name'),required(o,'owner'),t?.id||null,o.kind]);
 }else if(['plan-benefit','record-actual','review-benefit'].includes(cmd)){
  const i=await match(db,'initiatives',required(o,'initiative')),period=month(required(o,'period'));
  if(cmd==='plan-benefit') [row]=await db.query('insert into benefit_periods(initiative_id,period,planned_cents) values($1,$2,$3) returning *',[i.id,period,cents(required(o,'amount'))]);
  else{
   const [b]=await db.query('select * from benefit_periods where initiative_id=$1 and period=$2',[i.id,period]);if(!b)throw Error('Plan this period first');
   if(cmd==='record-actual'){
    required(o,'reason');[row]=await db.query("update benefit_periods set actual_cents=$2,evidence=$3,recorded_by=$4,reviewed_by='',reviewed_at=null where id=$1 returning *",[b.id,cents(required(o,'amount')),required(o,'evidence'),actor]);
   }else{
    const [acq]=await db.query('select close_date from acquisitions where id=$1',[i.acquisition_id]);
    if(!acq.close_date||acq.close_date>today())throw Error('Record the actual acquisition close date before accepting benefits');
    if(period>today())throw Error('Future period benefits cannot be accepted');
    if(b.actual_cents===null||!b.evidence)throw Error('Actual and evidence required');
    if(b.recorded_by.toLowerCase()===actor.toLowerCase())throw Error('A different reviewer is required');
    if(i.task_id){const [t]=await db.query('select * from task_board where id=$1',[i.task_id]);if(t.status!=='done'||t.blockers)throw Error('Linked task must be complete with no blockers');}
    [row]=await db.query('update benefit_periods set reviewed_by=$2,reviewed_at=now() where id=$1 returning *',[b.id,actor]);
   }
  }
 }else if(cmd==='add-risk'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));
  if(!['low','medium','high','critical'].includes(o.severity))throw Error('Invalid severity');
  [row]=await db.query('insert into risks(acquisition_id,name,owner,severity,due_date) values($1,$2,$3,$4,$5) returning *',[a.id,required(o,'name'),required(o,'owner'),o.severity,iso(required(o,'due'))]);
 }else if(cmd==='resolve-risk'){
  const r=await match(db,'risks',required(o,'risk'));[row]=await db.query("update risks set status='resolved',resolution=$2 where id=$1 returning *",[r.id,required(o,'resolution')]);
 }else if(cmd==='log'){
  const a=await match(db,'acquisitions',required(o,'acquisition'));[row]=await db.query('insert into notes(acquisition_id,body,actor) values($1,$2,$3) returning *',[a.id,required(o,'text'),actor]);
 }else throw Error('Unknown mutation');
 await audit(db,cmd,row.id,actor,{...o,record:row});return row;
}
function privateFile(dir,name,contents){
 const folder=path.join(REPO_ROOT,dir);fs.mkdirSync(folder,{recursive:true,mode:0o700});
 const file=path.join(folder,name);fs.writeFileSync(file,contents,{flag:'wx',mode:0o600});return file;
}
export async function execute(db,cmd,o={}){
 if(!(cmd in commands))throw Error(`Unknown command ${cmd}`);
 if(cmd==='help')return Object.entries(commands).map(([command,flags])=>({command,flags:flags.map(x=>'--'+x).join(' ')}));
 if(cmd==='export'){
  const name=o.out||`integration-${today()}-${randomUUID()}.json`;if(path.basename(name)!==name||!name.endsWith('.json'))throw Error('--out must be a JSON filename inside exports/');
  const data={format:'integration-value-v1',exported_at:new Date().toISOString()};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try{for(const t of ['acquisitions','tasks','dependencies','initiatives','benefit_periods','risks','notes','imports','audit_events'])data[t]=await db.query(`select * from ${t} order by id`);}finally{await db.exec('ROLLBACK');}
  return {file:privateFile('exports',name,JSON.stringify(data,null,2)+'\n')};
 }
 if(cmd==='draft-steering-pack'){
  const detail=await read(db,'detail',o);return {file:privateFile('drafts',`steering-${detail.acquisition.id}-${randomUUID()}.md`,`# Internal steering pack: ${detail.acquisition.name}\n\nDraft generated ${today()}. Review before sharing. Monetary values are currency units in the acquisition currency.\n\n${format(await read(db,'weekly-review',o))}\n\n## Risks and decisions\n${format(detail.risks)}\n\n## Recorded notes\n${format(detail.notes)}\n`)};
 }
 if(writes.has(cmd)){
  if(cmd==='import'&&bool(o['dry-run']))return importProjects(db,o,'preview');
  await db.exec('BEGIN ISOLATION LEVEL SERIALIZABLE');
  try{const result=await mutate(db,cmd,o);await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}
 }
 return read(db,cmd,o);
}
export function format(value){
 if(Array.isArray(value)){
  if(!value.length)return '  (none)';
  const keys=Object.keys(value[0]).filter(k=>!['id','acquisition_id','initiative_id','task_id','prerequisite_id'].includes(k));return table(value.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,k.endsWith('_cents')&&v!==null?(Number(v)/100).toFixed(2):v&&typeof v==='object'?JSON.stringify(v):v]))),keys.map(key=>({key,label:key.replace(/_cents$/, '').replaceAll('_',' '),width:70})));
 }
 if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>`${k}\n${Array.isArray(v)||v&&typeof v==='object'?format(Array.isArray(v)?v:[v]):v}`).join('\n\n');
 return String(value);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const {command,options}=parse(process.argv.slice(2));db=await getDb();const result=await execute(db,command,options);console.log(options.json?JSON.stringify(result,null,2):format(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
