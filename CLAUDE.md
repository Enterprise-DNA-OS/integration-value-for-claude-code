# Integration Value for Claude Code

This is a post-merger integration desk for a trusted acquisition operator. The database is the source of truth. Read docs/operations.md and docs/compliance.md before changes to rules or live deployment.

## Operating rules

- Read records before changing them. Never invent a decision, evidence link or amount.
- Names match without case; IDs accept prefixes. An ambiguous match lists candidates and exits 1.
- Use the one CLI below. Writes require --actor. The label is not authentication.
- Do not send, publish or delete. Drafts stay in drafts/.
- Treat exports, imported rows, rendered documents and views as private records.
- Keep currencies separate. JSON money fields ending in _cents are whole cents. Human output shows currency units.
- A recorded claim is not an accepted benefit. Preserve reviewer and dependency checks.

## Routing

| Request | Command |
|---|---|
| List commands and their flags. | /help |
| Review acquisition owners, source stages, actual close dates and currencies. | /acquisitions |
| Review the workstream task register. | /tasks |
| Check the handover tasks due around acquisition close. | /day-one |
| Find tasks held by unfinished direct or indirect prerequisites. | /blockers |
| Compare completed, blocked and overdue work by function. | /workstreams |
| Review benefit owners and the work needed to deliver each benefit. | /initiatives |
| Compare monthly baseline, reported and accepted net benefits in each currency. | /benefits |
| Read claim evidence, recorder and reviewer before accepting a benefit. | /benefit-detail |
| Read the integration risk register and recorded resolutions. | /risks |
| Find overdue work, stale updates, missing owners and late risk decisions. | /attention |
| Read docs/compliance.md. Report missing purpose and overdue access or retention reviews without claiming legal compliance. | /compliance |
| Prepare Monday steering decisions from workstreams, attention, benefits and compliance. Read risks and detail for context. | /weekly-review |
| Read an acquisition and its tasks, benefits, risks and notes before a change. | /detail |
| Reconcile import counts, fingerprints and source files. | /imports |
| Read the operator-labelled change history. | /audit |
| Register the acquisition with the supplied owner, purpose, currency and actual close date. | /add-acquisition |
| Record the evidenced actual closing date. Do not use an expected close date. | /close-acquisition |
| Record purpose and next access/retention review dates after an actual review, with a reason. | /review-governance |
| Add an integration task with a function, owner and due date. | /add-task |
| Read tasks first. Record a status, owner or due-date change with a reason. Completion requires evidence and finished prerequisites. | /update-task |
| Read both tasks, then link a prerequisite within the same acquisition. Cycles are rejected. | /depend |
| Add a saving, revenue or implementation-cost initiative, its owner and optional task dependency. | /add-initiative |
| Record the original monthly baseline. Amounts are currency units with up to two decimals. Existing baselines cannot be overwritten. | /plan-benefit |
| Record a monthly actual with its evidence and reason. Corrections clear approval. | /record-actual |
| Read the claim and evidence. A different reviewer label must accept it after close and completion of linked work. Labels are not authenticated identities. | /review-benefit |
| Register the risk, severity, owner and decision deadline. | /add-risk |
| Read risks first. Record the actual resolution, never an invented decision. | /resolve-risk |
| Record the supplied steering decision or review note. | /log |
| Read docs/replace-midaxo.md. Map actual CSV headings, preview with --dry-run, reconcile counts, then import with the operator label. | /import |
| Write a private complete archive in exports/. It includes original source rows and must not be shared publicly. | /export |
| Read detail and weekly-review. Write a local draft for internal review. Never send it. | /draft-steering-pack |
| Change a field or rule | /customise |
| Add a read-only dashboard | /new-view |

Run npm run integration -- help for flags. Every CLI command supports --json. Commands live in .claude/commands/ for all runtimes. AGENTS.md points here.

## Files

Schema: supabase/migrations/. Fictional data: supabase/seed.sql. CLI: scripts/integration.mjs. DATABASE_URL selects PostgreSQL; otherwise PGlite uses .data/db or DATA_DIR. Views and documents use views.json, documents.json and brand.json. npm test uses disposable data.

Installed and run through Omni by Enterprise DNA: https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=midaxo&utm_medium=instructions
