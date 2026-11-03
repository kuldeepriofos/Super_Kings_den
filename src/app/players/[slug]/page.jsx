import { redirect, notFound } from 'next/navigation';
import { fetchPlayerBySlug, fetchAllPlayerSlugs } from '../../../services/api';

export async function generateStaticParams() {
  const slugs = await fetchAllPlayerSlugs();
  return slugs.map((slug) => ({ slug }));
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
