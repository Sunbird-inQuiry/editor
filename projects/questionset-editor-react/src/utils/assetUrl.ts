/**
 * Rewrites a full blob-storage URL to the portal's /assets/public/ proxy path.
 *
 * The portal proxies blob storage through /assets/public/ for CORS/auth reasons.
 * context.cloudStorageUrls holds the list of blob origin prefixes to rewrite.
 *
 * Example:
 *   input:  https://eddevda72f12a.blob.core.windows.net/ed-dev-public-xxx/img.png
 *   output: /assets/public/img.png
 */
export function rewriteAssetUrl(url: string, cloudStorageUrls: string[] = []): string {
  for (const storageUrl of cloudStorageUrls) {
    if (url.startsWith(storageUrl)) {
      return '/assets/public/' + url.slice(storageUrl.length);
    }
  }
  return url;
}
