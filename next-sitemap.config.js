/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    generateRobotsTxt: true, // Generates robots.txt alongside sitemap
    sitemapSize: 7000, // default max URLs per sitemap file
    changefreq: 'weekly',
    priority: 0.7,
    exclude: ['/secret-page'], // optional pages to exclude
  };
  