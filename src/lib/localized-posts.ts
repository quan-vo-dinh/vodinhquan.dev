import type { Locale } from "@/i18n/locale";

type LocalizedPost = {
  locale: Locale;
  slug: string;
};

export function selectLocalizedPosts<T extends LocalizedPost>(
  posts: readonly T[],
  locale: Locale,
) {
  const postsBySlug = new Map<string, T>();

  for (const post of posts) {
    const existing = postsBySlug.get(post.slug);

    if (
      post.locale === locale ||
      (!existing && post.locale === "vi")
    ) {
      postsBySlug.set(post.slug, post);
    }
  }

  return Array.from(postsBySlug.values());
}

export function findLocalizedPost<T extends LocalizedPost>(
  posts: readonly T[],
  slug: string,
  locale: Locale,
) {
  return (
    posts.find((post) => post.slug === slug && post.locale === locale) ??
    posts.find((post) => post.slug === slug && post.locale === "vi")
  );
}
