-- Conservative intake triage. These labels are suggestions, not verified leads or AI decisions.
alter table public.leads
  add column if not exists workflow_category text not null default 'unclassified',
  add column if not exists qualification_score smallint not null default 0,
  add column if not exists review_priority text not null default 'standard',
  add column if not exists triage_state text not null default 'not_applicable',
  add column if not exists triaged_at timestamptz,
  add column if not exists review_due_at timestamptz;

alter table public.leads
  add constraint taskforge_lead_qualification_range check (qualification_score between 0 and 100),
  add constraint taskforge_lead_workflow_category check (workflow_category in ('unclassified','sales_crm','invoice_order','support_inbox','other')),
  add constraint taskforge_lead_review_priority check (review_priority in ('standard','review_first','request_details')),
  add constraint taskforge_lead_triage_state check (triage_state in ('not_applicable','awaiting_human_review'));

create or replace function public.taskforge_triage_b2b_lead()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  lead_text text := lower(coalesce(new.need,''));
  first_line text := lower(split_part(coalesce(new.need,''), E'\n', 1));
  score integer := 0;
begin
  if new.source is distinct from 'website-b2b-automation' then
    return new;
  end if;

  -- Always ignore any client-provided qualification, status or review fields.
  new.status := 'new';
  new.workflow_category := case
    when first_line like 'lead intake and crm routing%' then 'sales_crm'
    when first_line like 'invoice and purchase order intake%' then 'invoice_order'
    when first_line like 'support inbox triage%' then 'support_inbox'
    else 'other'
  end;

  if new.workflow_category <> 'other' then score := score + 20; end if;
  if coalesce(length(btrim(new.company)),0)>0 then score := score + 10; end if;
  if new.budget in ('Under USD 500','USD 500-2000','USD 2000-10000','USD 10000+') then score := score + 20; end if;
  if position('weekly volume:' in lead_text)>0 and position('weekly volume: not specified' in lead_text)=0 then score := score + 20; end if;
  if position('existing tools:' in lead_text)>0 and position('existing tools: not specified' in lead_text)=0 then score := score + 15; end if;
  if length(coalesce(new.need,''))>=180 then score := score + 15; end if;

  new.qualification_score := least(score,100);
  new.review_priority := case when score>=65 then 'review_first' else 'request_details' end;
  new.triage_state := 'awaiting_human_review';
  new.triaged_at := now();
  new.review_due_at := now() + case when score>=65 then interval '2 days' else interval '5 days' end;
  return new;
end;
$$;

create trigger taskforge_b2b_lead_triage_on_insert
before insert on public.leads
for each row execute function public.taskforge_triage_b2b_lead();

create index if not exists taskforge_leads_review_queue_idx
on public.leads (review_priority, review_due_at, created_at desc)
where source='website-b2b-automation' and status='new';

-- No policy grants are added. The existing anon role may INSERT through RLS,
-- but may not SELECT or UPDATE lead records. Operators review with authorized access.
