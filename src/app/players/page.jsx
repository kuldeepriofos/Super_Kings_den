import { redirect } from 'next/navigation';

export const metadata = {
  title: 'CSK Players Directory | Super Kings Den',
  robots: {
    index: false,
    follow: true,
  },
};

export default function PlayersRedirect() {
  redirect('/csk-team/');
}
