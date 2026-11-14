# update-task

Read tasks first. Record a status, owner or due-date change with a reason. Completion requires evidence and finished prerequisites.

Run the existing CLI using only supplied values. Use --json when analysing results. The flags below are available options; /help shows the command contract. Omit options that do not apply.

```bash
npm run integration -- update-task --task="<task>" --status="<status>" --owner="<owner>" --due="<due>" --evidence="<evidence>" --actor="<actor>" --reason="<reason>"
```

Read relevant records before any write. If a name is ambiguous, list the candidates and ask the operator. Report missing evidence explicitly. Never invent data or send anything.
