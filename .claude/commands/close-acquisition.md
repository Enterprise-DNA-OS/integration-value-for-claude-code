# close-acquisition

Record the evidenced actual closing date. Do not use an expected close date.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- close-acquisition --acquisition="<acquisition>" --date="<date>" --evidence="<evidence>" --actor="<actor>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
