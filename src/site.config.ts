// Single place for site-wide settings and personal copy.
export const siteConfig = {
  name: 'Sam Armstrong',
  // TODO(sam): review or rewrite headline, intro, description, and about copy below.
  // Alternative headline options:
  //   - "Agents, evals, and software factories."
  //   - "Experiments on coding agents and evals."
  //   - "Every abstraction must fight for its life."
  headline: 'Notes on agents, evals, and software factories.',
  intro:
    'I work on agents, evals, infra, and security. I use this blog to write up experiments on coding agents, specs, code review, and verification.',
  description:
    'Notes and experiments on coding agents, evals, software factories, and verification by Sam Armstrong.',
  about: [
    'I work on agents, evals, infrastructure, and security.',
    'Most of my recent time has gone into software factories—running coding agents in automated loops from spec to implementation—and benchmarking how different prompts, specs, and review steps behave over long horizons.',
    'I try to automate whatever manual work I run into twice: either script it, hand it to an LLM, or drop the step altogether. Favorite prompt rule: "Every abstraction must fight for its life."',
  ],
  // Switch to a custom domain later: change this to e.g. 'https://example.com',
  // add public/CNAME containing the bare domain, and set the domain in
  // repo Settings > Pages. Also see the comment in .github/workflows/deploy.yml.
  url: 'https://samarmstrong.github.io',
  // Set any social link to an empty string ('') to hide its icon in the UI.
  links: {
    x: 'https://x.com/samarmstrongx',
    github: 'https://github.com/samarmstrong',
    cursor: 'https://cursor.com/@samx',
  },
};
