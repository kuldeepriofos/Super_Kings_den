import { permanentRedirect } from 'next/navigation';

export default function StandingsRedirectPage() {
  permanentRedirect('/csk-fixtures/');
}
