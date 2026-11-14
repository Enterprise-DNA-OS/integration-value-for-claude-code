create table acquisitions (
 id uuid primary key default gen_random_uuid(), source_id text unique, name text not null unique check(trim(name)<>''),
 owner text not null default '', close_date date, currency text not null default 'NZD' check(currency in ('NZD','AUD','USD','GBP','EUR')),
 source_stage text not null default '', purpose text not null default '', access_review date, retention_review date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table tasks (
 id uuid primary key default gen_random_uuid(), acquisition_id uuid not null references acquisitions(id), source_id text,
 name text not null check(trim(name)<>''), workstream text not null, owner text not null default '', due_date date not null,
 status text not null default 'open' check(status in ('open','doing','done')), day_one boolean not null default false,
 evidence text not null default '', reviewed_at date, unique(acquisition_id,source_id), unique(acquisition_id,name),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table dependencies (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references tasks(id), prerequisite_id uuid not null references tasks(id),
 check(task_id<>prerequisite_id), unique(task_id,prerequisite_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table initiatives (
 id uuid primary key default gen_random_uuid(), acquisition_id uuid not null references acquisitions(id), name text not null check(trim(name)<>''),
 owner text not null, task_id uuid references tasks(id), kind text not null check(kind in ('saving','revenue','cost')),
 unique(acquisition_id,name), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table benefit_periods (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references initiatives(id), period date not null check(extract(day from period)=1),
 planned_cents bigint not null check(planned_cents between 0 and 100000000000), actual_cents bigint check(actual_cents between 0 and 100000000000),
 evidence text not null default '', recorded_by text not null default '', reviewed_by text not null default '', reviewed_at timestamptz,
 check(reviewed_at is null or (actual_cents is not null and trim(evidence)<>'' and trim(reviewed_by)<>'' and lower(reviewed_by)<>lower(recorded_by))),
 unique(initiative_id,period), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table risks (
 id uuid primary key default gen_random_uuid(), acquisition_id uuid not null references acquisitions(id), name text not null,
 owner text not null, severity text not null check(severity in ('low','medium','high','critical')), due_date date not null,
 status text not null default 'open' check(status in ('open','resolved')), resolution text not null default '',
 unique(acquisition_id,name), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notes (
 id uuid primary key default gen_random_uuid(), acquisition_id uuid not null references acquisitions(id), body text not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), fingerprint text not null unique, kind text not null, mapping jsonb not null, source text not null,
 raw jsonb not null, row_count int not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), action text not null, record_id uuid, actor text not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function touch_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now(); return new; end$$;
create function append_only() returns trigger language plpgsql as $$begin raise exception 'Append-only record'; end$$;
do $$declare n text;begin foreach n in array array['acquisitions','tasks','dependencies','initiatives','benefit_periods','risks','notes','imports','audit_events'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',n);
 execute format('alter table %I enable row level security',n);
 execute format('revoke all on %I from public',n);
end loop;
foreach n in array array['notes','imports','audit_events'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function append_only()',n);
end loop;end$$;
create index tasks_acquisition on tasks(acquisition_id);
create view task_board as
 select t.*,a.name as acquisition,a.currency,a.close_date,
 (with recursive chain(id) as (select prerequisite_id from dependencies where task_id=t.id union select d.prerequisite_id from dependencies d join chain c on c.id=d.task_id) select count(*)::int from chain c join tasks p on p.id=c.id where p.status<>'done') as blockers,
 case when t.status<>'done' then greatest(current_date-t.due_date,0) else 0 end as days_overdue,
 (t.reviewed_at is null or t.reviewed_at<current_date-14) as stale
 from tasks t join acquisitions a on a.id=t.acquisition_id;
create view benefit_detail as
 select b.*,i.name as initiative,i.kind,i.owner,i.acquisition_id,i.task_id,a.name as acquisition,a.currency,
 (b.reviewed_at is not null and a.close_date<=current_date and b.period<=current_date and (i.task_id is null or (t.status='done' and t.blockers=0))) as accepted,
 (case when i.kind='cost' then -1 else 1 end*b.planned_cents) as signed_plan,
 (case when i.kind='cost' then -1 else 1 end*coalesce(b.actual_cents,0)) as signed_actual
 from benefit_periods b join initiatives i on i.id=b.initiative_id join acquisitions a on a.id=i.acquisition_id
 left join task_board t on t.id=i.task_id;
create view benefit_summary as
 select acquisition_id,acquisition,currency,period,sum(signed_plan)::bigint as planned_net_cents,
 sum(signed_actual) filter(where actual_cents is not null)::bigint as reported_net_cents,
 coalesce(sum(signed_actual) filter(where accepted),0)::bigint as accepted_net_cents,
 (coalesce(sum(signed_actual) filter(where accepted),0)-sum(signed_plan))::bigint as variance_cents,
 count(*) filter(where actual_cents is null)::int as missing_actuals,
 count(*) filter(where actual_cents is not null and not accepted)::int as held_actuals
 from benefit_detail group by acquisition_id,acquisition,currency,period;
create view compliance_attention as
 select id as acquisition_id,name as acquisition,'access_review_due' as rule,'NZ-IPP5 / AU-APP11.1' as source from acquisitions where access_review is null or access_review<current_date
 union all select id,name,'retention_review_due','NZ-IPP9 / AU-APP11.2' from acquisitions where retention_review is null or retention_review<current_date
 union all select id,name,'purpose_missing','NZ-IPP1' from acquisitions where trim(purpose)=''
 union all select id,name,'accountable_owner_missing','Internal governance policy' from acquisitions where trim(owner)='';
revoke all on task_board,benefit_detail,benefit_summary,compliance_attention from public;
