# Operating the integration desk

Node 20 or newer. npm install and npm run demo create a fictional local PGlite database in .data/db. Set DATA_DIR for a different local location. Set DATABASE_URL for PostgreSQL, then npm run migrate. The shared seed command requires --demo-database. Use it only on an empty disposable database.

All currency values are stored as whole cents. JSON fields ending in _cents are cents. Human output shows currency units. HTML documents format them as currency units. Benefits are grouped by acquisition, currency and month. There is no foreign-exchange conversion or portfolio-wide currency sum. Savings and revenue add to net benefit; implementation costs subtract. An unreported actual is null, not zero. accepted_net_cents is the reviewed subset, not a forecast. The variance compares that subset with the full monthly plan, so review missing and held counts beside it. Future periods stay visible as plans and cannot be accepted early.

Baseline plans are insert-only through the CLI. The first baseline for an initiative/month remains the comparison. To change a baseline, use /customise to add an explicit versioned plan workflow and reconcile it before adoption. Claims can be corrected with /record-actual, an actor, reason and evidence. Every correction clears approval. A second reviewer must check the new value. Reopening a prerequisite puts linked reviewed benefits on hold. Completing it again restores acceptance if the claim and evidence were unchanged.

The dependency graph is within one acquisition. It rejects cycles and includes indirect prerequisites in blocker counts. Marking a task done requires evidence and all its prerequisites done. A completed dependent can remain labelled done after its predecessor reopens; the blocked count makes that inconsistency visible and excludes it from workstream completion and accepted benefits.

## Deployment responsibilities

This is a trusted-operator CLI. It has no web server, login, tenant isolation or enforced multi-user roles. Every domain table enables row-level security and revokes public access; only the database owner is intended to run this starter. Do not grant owner access to an untrusted user or expose database credentials to a browser. Use a separate database per organisation. Protect the host, restrict the data directory, encrypt backups, review agent access and test restores before live records arrive. Evidence fields store references; documents and their permissions remain in your controlled storage.

Actor labels support a change history but are not authentication. Append-only notes, imports and audit events resist ordinary update/delete statements, but a database administrator can change the schema. Do not describe this as a tamper-proof audit trail. CLI writes use transactions; no external action, payment, transfer or email occurs.

The export includes the original CSV rows, including unmapped columns. Minimise exports before import, keep them private and review retention. Generated drafts, HTML views and paperwork are internal snapshots. Keep them off public hosting and rerender after changes. File permissions are a useful local default; Windows access controls still require administrator configuration.
