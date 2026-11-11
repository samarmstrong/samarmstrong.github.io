---
title: "Code review is not worth it? v2"
description: "Last time I found that code review and live verification didn't improve anything, mostly because the benchmark specs came with exact input/output examples. I stripped those out and reran everything."
tags: [agents, evals, software-factories]
date: 2026-11-11
banner: ../../assets/banners/code-review-not-worth-it-v2.png
bannerAlt: "Two-panel meme: someone holds up a sheet of paper labeled CODE REVIEW and says \"Woah.\", then looks at it uncertainly and says \"This is... useful?\""
---

tl;dr - it still comes down to the spec

[Yesterday](https://samarmstrong.github.io/posts/great-specs-no-code-review/) I reported that prompting an agent for code review and live verification didn't actually improve anything. When I looked into why, I noticed the specs in SlopCodeBench are pretty unusual. They almost always contain worked input/output examples, which you rarely get in the real world, so the plain agent just pipes those examples into its program and checks its own work without being told to.

For this second run, I wanted to make the specs more realistic without making them dumb. I kept the schemas, field tables, and error definitions, and just stripped out the worked examples.

Even with the examples gone, having comprehensive schemas and tables is still a lot more detail than you find in most tasks people hand to agents. That is the trick with evals. You can't really build a one-size-fits-all benchmark that matches every real workflow, because real tasks vary too much, so I still don't know how far these numbers generalize. Still, taking the examples out brings it down a notch. I wanted to see what happens when we do.

Since a single run on 20 problems also has plenty of rerun noise (something [@joelniklaus](https://x.com/joelniklaus) showed on his [Harness Leaderboard](https://huggingface.co/spaces/joelniklaus/harness-leaderboard)), I reran all four original setups on Claude Sonnet 5.5 alongside the two new setups without examples.

| Setup | Cost per checkpoint | Hidden tests passed | Erosion (lower is better) |
|---|---|---|---|
| Plain | $0.27 | 92.4% | 0.870 |
| Live verification | $0.29 | 90.1% | 0.830 |
| Code review | $0.41 | 90.5% | 0.817 |
| Tests first | $0.34 | 91.9% | 0.780 |
| Plain (no examples) | $0.27 | 85.4% | 0.852 |
| Code review (no examples) | $0.43 | 87.4% | 0.840 |

## What actually happened

Taking the worked examples out hurt. When the spec stops showing what the output is supposed to look like, the plain agent has a harder time verifying its own work.

Without the examples, adding a code reviewer did give a minor improvement on hidden tests over plain Claude Code, though on the full specs it still didn't help at all. Live verification actually didn't look too bad here either. Looking at codebase erosion, the lowest was tests first, the second was code review, and the third was live verification, all coming in cleaner than plain Claude Code.

## Is the extra cost worth it?

Not really. Code review still adds about 50% to 60% to the cost.

I guess it depends on whether you are trying to optimize for passing hidden tests or keeping erosion down over time, and it isn't easy to say for sure which one is better when you are running a real repo. There is definitely something to be said for keeping erosion low as changes pile up. Even then, writing tests first actually gets you the lowest erosion for a lot less tokens than a reviewer.

## Where this leaves me

Stripping out examples is only one step toward how people actually prompt agents day to day. Most of the drop when I removed the examples actually came from a handful of problems while the rest barely moved, which makes me think some specs really lean on examples to resolve ambiguity and others don't. Next I want to look closer at why those failed, and test specs that look more like normal (lazy) GitHub issues.

Everything from this run is up in the repo: [results](https://github.com/samarmstrong/verification-layers/tree/main/results/seed-2), [full agent traces](https://github.com/samarmstrong/verification-layers/releases/tag/seed-2), and the harness in [verification-layers](https://github.com/samarmstrong/verification-layers). 
