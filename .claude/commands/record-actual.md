# record-actual

Record a monthly actual with its evidence and reason. Corrections clear approval.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- record-actual --initiative="<initiative>" --period="<period>" --amount="<amount>" --evidence="<evidence>" --actor="<actor>" --reason="<reason>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
