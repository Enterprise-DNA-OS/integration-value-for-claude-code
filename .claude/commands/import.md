# import

Read docs/replace-midaxo.md. Map actual CSV headings, preview with --dry-run, reconcile counts, then import with the operator label.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- import midaxo --file="<file>" --mapping="<mapping>" --actor="<actor>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
