import { getCollection } from 'astro:content';

// Drafts show in `astro dev` and are hidden from production builds.
export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
