export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/wp-admin/',
          '/wp-includes/',
          '/wp-json/',
          '/xmlrpc.php',
          '/feed/',
          '/*/feed/',
          '*?replytocom=*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/wp-admin/',
          '/wp-includes/',
          '/wp-json/',
          '/xmlrpc.php',
          '/feed/',
          '/*/feed/',
          '*?replytocom=*',
        ],
      },
    ],
    sitemap: 'https://superkingsden.com/sitemap.xml',
  };
}
