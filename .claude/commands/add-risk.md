# add-risk

Register the risk, severity, owner and decision deadline.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- add-risk --acquisition="<acquisition>" --name="<name>" --owner="<owner>" --severity="<severity>" --due="<due>" --actor="<actor>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
