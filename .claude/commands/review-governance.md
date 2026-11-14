# review-governance

Record purpose and next access/retention review dates after an actual review, with a reason.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- review-governance --acquisition="<acquisition>" --owner="<owner>" --purpose="<purpose>" --access-review="<access-review>" --retention-review="<retention-review>" --actor="<actor>" --reason="<reason>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
