# add-acquisition

Register the acquisition with the supplied owner, purpose, currency and actual close date.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- add-acquisition --name="<name>" --owner="<owner>" --close-date="<close-date>" --currency="<currency>" --purpose="<purpose>" --actor="<actor>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
