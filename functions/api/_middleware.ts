// Fix: Define missing Cloudflare Pages types to resolve compilation errors
type PagesFunction<T = any> = (context: any) => Promise<Response> | Response;

export const onRequest: PagesFunction = async ({ request, next }) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE, PUT",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  // Handle preflight requests BEFORE anything else
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const response = await next();
    
    // Create a new response with the CORS headers added
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([name, value]) => {
      newResponse.headers.set(name, value);
    });

    return newResponse;
  } catch (err) {
    // Ensure even error responses have CORS headers
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
};
