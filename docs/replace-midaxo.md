# Bring Midaxo project records across

Midaxo's [Importing Pipeline Data help article](https://support.midaxo.com/s/article/Configure-Pipeline-Data-in-Excel-and-Import) describes exporting the Grid view to Excel and preserving Project ID in its leftmost column. The article was available through the search index on 14 November 2026. Direct access returned the support site's loading/error shell. Confirm the current export control with your tenant administrator.

1. Export the authorised projects from Midaxo's Grid view to Excel. Preserve the Project ID, Project Name, stage and your selected fields. Keep the untouched workbook privately.
2. Save the relevant sheet as UTF-8 CSV. Convert mapped dates to YYYY-MM-DD. A source workbook with several sheets is not a single flat export. Do not relabel a planned closing date as actual closing evidence.
3. Copy fixtures/project-mapping.json into imports/ and change each value to the exact heading in your export. Only source_id and name are required. Optional mappings are stage, owner, close_date and currency. Leave close_date unmapped until you have verified that field means actual close. Omitted currency defaults to NZD, so map it explicitly for mixed portfolios.
4. Run the preview, reconcile IDs and counts, then run the same import without --dry-run.

```bash
npm run integration -- import midaxo --file=imports/projects.csv --mapping=imports/mapping.json --dry-run --json
npm run integration -- import midaxo --file=imports/projects.csv --mapping=imports/mapping.json --actor="Your name" --json
npm run integration -- acquisitions
npm run integration -- compliance
```

After the export and mapping, one import command brings the selected project records into the database. A repeated identical file is a no-op. An existing source ID with changed mapped values fails the whole import instead of overwriting local work. An unchanged existing record can appear in a later file. Case-insensitive duplicate names or IDs, malformed dates and broken CSV are rejected. The original rows, mapping and fingerprint are retained privately in imports for reconciliation.

## What maps

Project ID becomes source_id. Project Name becomes the acquisition name. The vendor stage is retained as source_stage without guessing whether the deal closed. Owner, currency and a verified actual close date use the explicit mapping. New project records have no completed governance reviews.

## What needs separate work

This importer does not read XLSX directly or import task trees, dependencies, value-tracker periods, documents, permissions, messages or historical approvals. The source fixture is synthetic, not a captured tenant export. Enterprise DNA maps and reconciles the additional authorised exports for an installed version. The free commands can create workstreams, tasks, benefit periods and risks after import. Keep the existing system until the records and required workflows are accepted.

The historical Midaxo Value Tracker PDF described Excel import/export but its old URL now returns 404. It is not evidence that today's export has our chosen headings. We do not promise a complete Midaxo migration from a project export.

## Export your version

npm run integration -- export writes a private JSON archive under exports/. All business records, raw import rows and audit events are included. The filename cannot escape that folder and an existing file is never overwritten. This is a portable archive, not an automatic database-restore command. Test your database backup and restore separately.
