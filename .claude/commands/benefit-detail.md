# benefit-detail

Read claim evidence, recorder and reviewer before accepting a benefit.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- benefit-detail --acquisition="<acquisition>" --period="<period>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
