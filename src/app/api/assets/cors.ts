// Open to every origin: the Figma plugin runs in a null-origin iframe, and the data is public.
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export const CACHE = { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" };
export const options = () => new Response(null, { status: 204, headers: CORS });
