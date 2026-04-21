// Fix: Define missing Cloudflare Pages types to resolve compilation errors
type PagesFunction<T = any> = (context: any) => Promise<Response> | Response;

export const onRequest: PagesFunction = async ({ request, next }) => {
  const response = await next();
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Create a new response with the CORS headers added
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([name, value]) => {
    newResponse.headers.set(name, value);
  });

  return newResponse;
};
