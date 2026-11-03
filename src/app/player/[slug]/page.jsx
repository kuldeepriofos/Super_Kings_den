import { redirect, notFound } from 'next/navigation';
import { fetchPlayerBySlug, fetchAllPlayerSlugs } from '../../../services/api';

// Rendered on demand + cached via ISR (this route also redirects legacy URLs).
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

export default async function LegacyPlayerRedirect({ params }) {
  const player = await fetchPlayerBySlug(params.slug);

  if (!player) {
    notFound();
  }

  redirect(`/${player.slug}/`);
}
