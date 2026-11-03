import { redirect, notFound } from 'next/navigation';
import { fetchPlayerBySlug, fetchAllPlayerSlugs } from '../../../services/api';

// Player profiles render on demand and are cached via ISR, avoiding a large
// prebuild of every slug (+ its -1/1 variants).
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function PlayerSlugRedirect({ params }) {
  const player = await fetchPlayerBySlug(params.slug);

  if (!player) {
    notFound();
  }

  redirect(`/${player.slug}/`);
}
