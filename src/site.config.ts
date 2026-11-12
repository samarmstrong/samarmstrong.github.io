// Single place for site-wide settings and personal copy.
export const siteConfig = {
  name: 'Sam Armstrong',
  // TODO(sam): review or rewrite headline, intro, description, and about copy below.
  // Alternative headline options:
  //   - "Agents, evals, and software factories."
  //   - "Testing how coding agents actually hold up."
  //   - "Every abstraction must fight for its life."
  headline: 'Building software factories and testing what actually matters.',
  intro:
    'I work on agents, evals, infra, and security at DeepTempo (previously Uber and Amazon). Mostly writing here as I run experiments on coding agents, specs, and how to automate the parts of software engineering I never want to do by hand again.',
  description:
    'Notes and experiments on coding agents, evals, software factories, and verification by Sam Armstrong.',
  about: [
    "I'm an engineer working on agents, evals, infrastructure, and security at DeepTempo. Before that, I worked at Uber and Amazon.",
    "Lately I've been building lights-off software factories—loops of coding agents that take a spec, write the change, and verify it with minimal human intervention—and running benchmarks to see which rules and verification layers actually earn their token cost.",
    'I\'m pretty automation-happy: every manual task makes me ask how to never do it again, whether an LLM can handle it, or whether it needs to happen at all. Favorite prompt rule: "Every abstraction must fight for its life."',
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
