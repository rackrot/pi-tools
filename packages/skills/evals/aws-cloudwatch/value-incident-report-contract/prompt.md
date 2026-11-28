---
name: value-incident-report-contract
description: "Value case. An alarm-driven Lambda throttling incident with the evidence already pulled. Measures the skill's report contract and two rules, not AWS knowledge: severity High for an error rate above 5 percent on a degraded but available service, the cause labelled resource limits, confidence from confirmed/likely/unknown, the only deploy (after onset) not named as the cause, remediation split into immediate/short-term/long-term, and log lines read with logs start-query rather than tail or filter-log-events."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our checkout-errors CloudWatch alarm fired at 13:58 UTC today in eu-west-1 (profile prod-readonly) and checkout has been flaky since. I already pulled what I could, it's below. can you finish the investigation from this and write up your findings for the incident channel, including what we should do about it? you can't run anything yourself here, so where you still need data just tell me the command.

- alarm: `Errors` on the `checkout` Lambda, period 60, 5 of 5 datapoints, OK -> ALARM at 13:58
- `Invocations`: about 1,200/min until 13:50, about 2,500/min from 13:51 on (the spring sale email went out at 13:50)
- `Throttles`: 0 until 13:51, 150-220/min since 13:52
- `ConcurrentExecutions`: flat at 50 since 13:52; the function has reserved concurrency 50
- `Errors` / `Invocations`: under 0.2% before, about 8% since 13:52. most checkouts still go through
- `Duration` p99: unchanged, about 900 ms
- same hour last week: 1,100 invocations/min, 0 throttles, 0.1% errors
- CloudTrail write events for 12:50-14:05: exactly one, `UpdateFunctionCode` on `checkout` at 14:03 by the `ci-deploy` role
- I have not looked at the function's log lines yet

end your reply with exactly these five lines, filled in with the rating, category and confidence wording you use for these reports:

SEVERITY: <rating>
CAUSE-CATEGORY: <category>
CONFIDENCE: <level>
CORRELATED-CHANGE: <the CloudTrail event name, or NONE>
LOG-COMMAND: <the `aws logs` subcommand I should run to see the error lines>
