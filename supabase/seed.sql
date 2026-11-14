do $$declare a uuid;b uuid;t1 uuid;t2 uuid;t3 uuid;i1 uuid;i2 uuid;i3 uuid;begin
if exists(select 1 from acquisitions where source_id='DEMO-101') then return;end if;
insert into acquisitions(source_id,name,owner,close_date,currency,purpose,access_review,retention_review)
 values('DEMO-101','Harbour Analytics acquisition','Alex Morgan',current_date-35,'NZD','Track post-close operating changes',current_date-3,current_date+90) returning id into a;
insert into acquisitions(source_id,name,owner,close_date,currency,purpose,access_review,retention_review)
 values('DEMO-102','Kowhai Services acquisition','Taylor Reed',current_date+5,'AUD','Prepare the integration plan',current_date+30,current_date-1) returning id into b;
insert into tasks(acquisition_id,name,workstream,owner,due_date,status,day_one,reviewed_at)
 values(a,'Confirm supplier transfer','Operations','Alex Morgan',current_date-10,'doing',true,current_date-20) returning id into t1;
insert into tasks(acquisition_id,name,workstream,owner,due_date,status,day_one,reviewed_at)
 values(a,'Consolidate supplier contracts','Finance','Taylor Reed',current_date-3,'open',false,current_date-2) returning id into t2;
insert into dependencies(task_id,prerequisite_id) values(t2,t1);
insert into tasks(acquisition_id,name,workstream,owner,due_date,status,evidence,reviewed_at)
 values(a,'Complete system handover','Technology','Jordan Ellis',current_date-15,'done','demo://handover/approved',current_date-15) returning id into t3;
insert into tasks(acquisition_id,name,workstream,owner,due_date,day_one) values(b,'Prepare employee access list','People','',current_date+2,true);
insert into initiatives(acquisition_id,name,owner,task_id,kind) values(a,'Supplier consolidation','Taylor Reed',t2,'saving') returning id into i1;
insert into initiatives(acquisition_id,name,owner,task_id,kind) values(a,'System operating costs','Jordan Ellis',t3,'saving') returning id into i2;
insert into initiatives(acquisition_id,name,owner,kind) values(a,'Transition support costs','Alex Morgan','cost') returning id into i3;
insert into benefit_periods(initiative_id,period,planned_cents,actual_cents,evidence,recorded_by) values(i1,date_trunc('month',current_date)::date,1500000,1200000,'demo://supplier/invoice','Taylor Reed');
insert into benefit_periods(initiative_id,period,planned_cents,actual_cents,evidence,recorded_by,reviewed_by,reviewed_at)
 values(i2,date_trunc('month',current_date)::date,600000,500000,'demo://system/invoice','Jordan Ellis','Alex Morgan',now()),
 (i3,date_trunc('month',current_date)::date,200000,250000,'demo://support/invoice','Alex Morgan','Taylor Reed',now());
insert into benefit_periods(initiative_id,period,planned_cents) values(i1,(date_trunc('month',current_date)+interval '1 month')::date,1500000);
insert into risks(acquisition_id,name,owner,severity,due_date) values(a,'Supplier consent outstanding','Alex Morgan','high',current_date-4),(b,'Access approval unfinished','Taylor Reed','medium',current_date+1);
insert into notes(acquisition_id,body,actor) values(a,'Synthetic records. Steering review must resolve supplier consent before consolidation.','Demo seed');
end$$;
