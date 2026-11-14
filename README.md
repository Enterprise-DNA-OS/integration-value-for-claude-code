# Integration Value for Claude Code

Own your acquisition integration records: workstream tasks, dependencies, monthly benefit claims, evidence and steering decisions in one database.

## Three ways to use it

- **Do it yourself:** free MIT source, with Claude Code, Codex, OpenCode or Cursor.
- **We customise it:** Enterprise DNA maps your exports and builds your fields, rules, screens and connections. One setup fee, then a retainer.
- **We run it for you:** installed and operated through **Omni by Enterprise DNA**. One setup fee, then a retainer. [Talk to Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=midaxo&utm_medium=readme).

## Start with fictional records

Node 20 or newer.

```bash
npm install
npm run demo
npm run integration -- day-one
npm run integration -- workstreams
npm run integration -- benefit-detail
npm run integration -- weekly-review --json
npm run view
npm run docs
npm test
```

Two fictional acquisitions include overdue supplier work, a blocked cost-saving claim, accepted benefits, transition costs and a future unreported period. The seed is idempotent. DATABASE_URL selects PostgreSQL; otherwise local PGlite needs no service.

## The integration week

Start with /day-one and /blockers. Ask /workstreams who owes a decision. Record claimed benefits with /record-actual, inspect /benefit-detail and use /review-benefit after reviewing evidence. /weekly-review combines task attention, monthly benefit totals and governance flags. /draft-steering-pack writes a local paper. Nothing sends.

Tasks cannot complete without evidence and finished prerequisites. Dependencies reject cycles. Accepted benefits require a closed acquisition, a current or past period, evidence, a different reviewer label and completed linked work. Corrections clear approval; reopened dependencies put benefits back on hold. Costs subtract from savings and revenue. Each acquisition keeps its own currency. Actor labels are not authenticated identities.

## Ten questions answered by the working build

1. Which acquisition has overdue day-one tasks?
2. Which benefit claims are held by unfinished integration work?
3. Which completed tasks became blocked after a prerequisite reopened?
4. What accepted net benefit remains after transition costs?
5. Which claims changed after a reviewer accepted them?
6. Which workstreams have stale updates as well as overdue tasks?
7. Which future periods have plans but no reported actuals?
8. Which acquisitions need access or retention reviews?
9. Who recorded and reviewed the evidence behind each accepted amount?
10. Which source projects imported unchanged, and which would conflict?

These are working analyses you can change, not a claim that Midaxo cannot produce equivalent reports. The value is owning the records and definitions behind them.

## Bring your history

The [replace guide](docs/replace-midaxo.md) covers Midaxo Grid-to-Excel project exports, CSV conversion and explicit mapping. One import command loads the selected project records after preview and reconciliation. Task trees, documents and value history need separate mapping. The fixture is synthetic. Keep Midaxo until the required records and workflows are accepted.

## Commands

- /help: List commands and their flags.
- /acquisitions: Review acquisition owners, source stages, actual close dates and currencies.
- /tasks: Review the workstream task register.
- /day-one: Check the handover tasks due around acquisition close.
- /blockers: Find tasks held by unfinished direct or indirect prerequisites.
- /workstreams: Compare completed, blocked and overdue work by function.
- /initiatives: Review benefit owners and the work needed to deliver each benefit.
- /benefits: Compare monthly baseline, reported and accepted net benefits in each currency.
- /benefit-detail: Read claim evidence, recorder and reviewer before accepting a benefit.
- /risks: Read the integration risk register and recorded resolutions.
- /attention: Find overdue work, stale updates, missing owners and late risk decisions.
- /compliance: Read docs/compliance.md. Report missing purpose and overdue access or retention reviews without claiming legal compliance.
- /weekly-review: Prepare Monday steering decisions from workstreams, attention, benefits and compliance. Read risks and detail for context.
- /detail: Read an acquisition and its tasks, benefits, risks and notes before a change.
- /imports: Reconcile import counts, fingerprints and source files.
- /audit: Read the operator-labelled change history.
- /add-acquisition: Register the acquisition with the supplied owner, purpose, currency and actual close date.
- /close-acquisition: Record the evidenced actual closing date. Do not use an expected close date.
- /review-governance: Record purpose and next access/retention review dates after an actual review, with a reason.
- /add-task: Add an integration task with a function, owner and due date.
- /update-task: Read tasks first. Record a status, owner or due-date change with a reason. Completion requires evidence and finished prerequisites.
- /depend: Read both tasks, then link a prerequisite within the same acquisition. Cycles are rejected.
- /add-initiative: Add a saving, revenue or implementation-cost initiative, its owner and optional task dependency.
- /plan-benefit: Record the original monthly baseline. Amounts are currency units with up to two decimals. Existing baselines cannot be overwritten.
- /record-actual: Record a monthly actual with its evidence and reason. Corrections clear approval.
- /review-benefit: Read the claim and evidence. A different reviewer label must accept it after close and completion of linked work. Labels are not authenticated identities.
- /add-risk: Register the risk, severity, owner and decision deadline.
- /resolve-risk: Read risks first. Record the actual resolution, never an invented decision.
- /log: Record the supplied steering decision or review note.
- /import: Read docs/replace-midaxo.md. Map actual CSV headings, preview with --dry-run, reconcile counts, then import with the operator label.
- /export: Write a private complete archive in exports/. It includes original source rows and must not be shared publicly.
- /draft-steering-pack: Read detail and weekly-review. Write a local draft for internal review. Never send it.
- /customise: Add a field or operating rule through a migration and behavioural checks.
- /new-view: Add a read-only branded dashboard.

Every CLI command supports --json. Unknown flags fail. IDs accept prefixes; names match without case. Ambiguous names list candidates and exit 1. All database writes require an actor label.

## Documents and views

Edit brand.json once. npm run docs writes an acquisition steering pack and benefit evidence record for each acquisition. npm run view renders the integration week, monthly values and decision queue. HTML shows currency units; JSON _cents fields are cents. Human output shows currency units. Generated snapshots stay private and must be rerendered after changes.

## Your first hour: ten things to ask for

1. Put our business name and colours on the steering pack.
2. Import a small project export as a preview.
3. Reconcile the imported project IDs.
4. Record an acquisition close with evidence.
5. Add our first day-one checklist.
6. Link the work that must finish first.
7. Record a monthly saving and its implementation cost.
8. Correct a claim and show why it needs another review.
9. Draft the steering meeting pack.
10. Add our internal integration reference with /customise.

## Scope and operation

This is an integration and benefit-evidence desk. Midaxo also provides sourcing, diligence, document controls and broader collaboration. This build has no hosted document room or user authentication. [Operations](docs/operations.md) explains access, backups, money, baseline rules and deployment. [Compliance](docs/compliance.md) cites evidence checks and their limits. [Why no front end](docs/why-no-front-end.md) explains the screen differences. [Research](docs/research.md) records the selection evidence. Hosting, agent subscriptions and operations remain costs.

MIT. Not affiliated with Midaxo or Anthropic.
