---
title: "If you have great specs, you don't need to prompt code review or live verification"
date: 2026-11-10
description: "tl;dr, semi-clickbait, but if you have great specs, you don't need to prompt code review or live verification."
tags: [agents, evals, software-factories]
banner: ../../assets/banners/great-specs-no-code-review.jpg
bannerAlt: "Two-panel meme: someone holds up a sheet of paper labeled CODE REVIEW and says \"Woah.\", then grins and says \"This is worthless!\""
---

tl;dr, semi-clickbait, but if you have great specs, you don't need to prompt code review or live verification.

It feels like we hit some kind of critical mass recently where everyone is talking about software factories. Maybe that's just my algorithm, basically posts from [@zachlloydtweets](https://x.com/zachlloydtweets), [@BHolmesDev](https://x.com/BHolmesDev), [@poteto](https://x.com/poteto), and [@dexhorthy](https://x.com/dexhorthy).

At the risk of stating the obvious, once you start taking that approach seriously, especially when you run it lights-off, you run into a question: how do we actually know our factories are doing well? That isn't a reason to avoid LLM automation. You have the exact same problem with human teams, where it is hard to tell how the system is actually performing until something breaks down the chain. The nice thing about agents is that because the loop is automated, we can feasibly evaluate it. Evaluating humans is expensive. Agents aren't cheap either to be honest, but if you are willing to spend the tokens, you can run the same experiment across hundreds of checkpoints in an afternoon.

I semi-shouted out above, but most of my thinking on benchmarking factories was sparked by Dex Horthy. When people evaluate coding agents, they usually think too short-term. Does the code work right now? What drew me to SlopCodeBench as an alternative is that it looks at the long horizon. A single change might pass today, but you want to see what happens as changes layer on top of each other one at a time.

I had been tasked to accelerate development on a relatively greenfield OSS project using [conveyor](https://github.com/samarmstrong/conveyor), as the factory engine, an instance of which is run as [Vigil Factory](https://github.com/Vigil-SOC/vigil-factory) to build [Vigil](https://github.com/Vigil-SOC/vigil). Because the project didn't have entrenched processes, we leaned hard into a lights-off factory with minimal human review. Anecdotally, it has been great.

"It feels great" is pretty unscientific, though. How do we know the codebase isn't regressing? Conveyor also takes some strong bets. The agent that writes a change has to run a live test, fix accordingly, and document blockers. [@poteto](https://x.com/poteto) was at least part of the inspiration here, in addition to my own intuition. Then, motivated in part by some informal benchmarks from other folks, we also completely removed all unit and integration tests. But I want a way to verify these decisions hold up.

## Step 1: Test our rules against SlopCodeBench

My first stop was setting up four different rule sets on SlopCodeBench to see how they interact over time. SlopCodeBench gives an agent a spec, and then the spec changes 3 to 8 times while the agent extends the code it wrote. Hidden tests grade each step, and the benchmark scores "erosion" (complexity piling into a few functions; lower is better).

I ran all four setups on Claude Sonnet 5.5 at medium effort in Claude Code across 20 problems, 101 checkpoints each, for about $185:

- Plain Claude Code (just the benchmark's default prompt)
- Conveyor's rules (run the program through its real entry point, fix what breaks, write down what ran, keep no tests, optional subagent diff check)
- Conveyor's rules plus a code reviewer that can send work back up to twice
- Tests first (write pytest before code and keep the suite green)

| Setup | Cost per checkpoint | Hidden tests passed | Erosion (lower is better) |
|---|---|---|---|
| Plain | $0.29 | 92.0% | 0.853 |
| Conveyor's rules | $0.30 | 90.3% | 0.843 |
| + reviewer | $0.44 | 91.4% | 0.850 |
| Tests first | $0.31 | 90.3% | 0.770 |

## Wait, what?

When I first looked at the table, I was confused. You don't need code review, and you don't even need verification?

Review added 52% to the cost per checkpoint with no ROI. Zach Lloyd recently shared that adversarial review in Warp's factory cost 140% more for 7.5% better output; his numbers came from different tasks and a different quality measure, but we couldn't reproduce a gain here. Our reviewer did spot bad code but it didn't result in better implementations.

Conveyor's live-verification rule had no ROI as well. Meanwhile, writing tests first was the one place that improved erosion.

Then I looked at the traces and realized what was going on.

SlopCodeBench hands the agent very specific, known-good specs. They run 150 to 1,500 words and almost always include worked examples with exact commands and expected input/output pairs. In the plain setup, the whole instruction was: "Implement a program that 100% solves the specification. That is all you need to do." It never mentioned testing or verification. Even so, in 89% of checkpoints the plain agent ran the program on its own anyway, usually by piping the spec's example input straight into it.

Because the benchmark starts from a known-good, detailed spec and works backwards from there, you basically don't need anything in your prompt other than "implement this spec." The agent already checks its work against the examples you gave it.

## Going from here

Working from a complete, known-good spec is a massive assumption. Most of the time in real projects, nobody hands the agent a 1,000-word spec with worked I/O examples. Despite its lack of real-world application, it's still a useful data point.

For next steps, we are going to keep building down this eval path to test setups that look closer to our actual project, where specs are rough and requirements are dubious.

We are also trying to make this accessible so other teams can benchmark their own setups without burning hundreds of millions of tokens just to get the same answers we already paid for. I'll be aiming to rerun this every month. The harness is open in [verification-layers](https://github.com/samarmstrong/verification-layers), the seed-1 configs and results are in [the deploy repo](https://github.com/Vigil-SOC/verification-layers-deploy/tree/main/results/seed-1), and the full agent traces are in [the seed-1 release](https://github.com/samarmstrong/verification-layers/releases/tag/seed-1). If you have a rule set you want us to test, feel free to contact me.
