-- Run in the authorized Supabase SQL Editor only. Never expose results in public CI logs.
-- Review queue: no payment, CRM changes or outbound emails are authorized by this query.

-- Anonymized funnel health. No personal identifiers returned.
select
  workflow_category,
  review_priority,
  count(*)::int as awaiting_review,
  count(*) filter (where review_due_at < now())::int as review_overdue,
  round(avg(qualification_score),1) as avg_completeness_score
from public.leads
where source='website-b2b-automation' and status='new'
group by workflow_category, review_priority
order by workflow_category, review_priority;

-- Private staff review: contact fields are customer-submitted and UNVERIFIED.
-- This query must NOT be run from the public site or an unprivileged client.
select
  id, created_at, name, email, company,
  workflow_category, qualification_score, review_priority,
  review_due_at, budget,
  left(need,320) as brief_preview
from public.leads
where source='website-b2b-automation'
  and status='new'
order by
  case review_priority when 'review_first' then 0 else 1 end,
  review_due_at nulls last, created_at
limit 100;
