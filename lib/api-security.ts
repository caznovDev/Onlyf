import { NextRequest, NextResponse } from 'next/server';

export interface ApiAuthResult {
  allowed: boolean;
  status: number;
  message: string;
  isFirstParty: boolean;
  isApiKey: boolean;
  isAdmin: boolean;
}

// Default fallback keys if not defined in environment
const DEFAULT_API_KEYS = ['freeof-secret-api-key-2026', 'freeof-secret-api-key-2025'];

function cleanKey(val: string): string {
  return val.trim().replace(/^["']|["']$/g, '');
}

/**
 * Retrieves valid API keys from environment variables
 */
export function getConfiguredApiKeys(): { standardKeys: string[]; adminKeys: string[] } {
  const standardKeys = new Set<string>();
  const adminKeys = new Set<string>();

  // Check admin keys first
  const adminEnvVars = [process.env.ADMIN_API_KEY, process.env.ADMIN_KEY];
  for (const envVal of adminEnvVars) {
    if (envVal) {
      envVal.split(',').map(cleanKey).filter(Boolean).forEach(k => {
        adminKeys.add(k);
        standardKeys.add(k);
      });
    }
  }

  // Check standard keys
  const standardEnvVars = [process.env.API_SECRET_KEY, process.env.API_KEY, process.env.SECRET_KEY];
  for (const envVal of standardEnvVars) {
    if (envVal) {
      envVal.split(',').map(cleanKey).filter(Boolean).forEach(k => {
        standardKeys.add(k);
      });
    }
  }

  // If standard keys were provided but NO admin key was explicitly configured,
  // allow standard keys to perform admin duties so single-key setups work immediately.
  if (adminKeys.size === 0 && standardKeys.size > 0) {
    standardKeys.forEach(k => adminKeys.add(k));
  }

  // If no keys at all are specified in environment, provide default development keys
  if (standardKeys.size === 0) {
    DEFAULT_API_KEYS.forEach(k => {
      standardKeys.add(k);
      adminKeys.add(k);
    });
  }

  return {
    standardKeys: Array.from(standardKeys),
    adminKeys: Array.from(adminKeys),
  };
}

/**
 * Checks if the request's origin or referer is on the allowed origins list
 */
export function isAllowedOrigin(originOrHost: string | null, requestHost: string | null): boolean {
  if (!originOrHost) return false;

  const normalized = originOrHost.toLowerCase().trim();

  // Allow production domains
  if (
    normalized === 'https://freeonlyfans.qzz.io' ||
    normalized === 'http://freeonlyfans.qzz.io' ||
    normalized.endsWith('.qzz.io')
  ) {
    return true;
  }

  // Allow Google Cloud Run domains
  if (normalized.includes('.run.app')) {
    return true;
  }

  // Allow localhost & 127.0.0.1 in local development
  if (
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1')
  ) {
    return true;
  }

  // Allow same host
  if (requestHost) {
    const hostOnly = requestHost.split(':')[0].toLowerCase();
    if (normalized.includes(hostOnly)) {
      return true;
    }
  }

  // Check custom allowed origins from environment
  if (process.env.ALLOWED_ORIGINS) {
    const allowed = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().toLowerCase());
    if (allowed.some(a => normalized.startsWith(a) || normalized === a)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates whether an incoming request to /api/* is authorized
 */
export function validateApiAccess(
  request: Request | NextRequest,
  options: { requireAdmin?: boolean } = {}
): ApiAuthResult {
  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const headers = request.headers;

  // 1. Extract API key from headers or query parameters
  const apiKeyHeader = headers.get('x-api-key');
  const authHeader = headers.get('authorization');
  let bearerToken: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    bearerToken = authHeader.slice(7).trim();
  }
  const queryApiKey = url.searchParams.get('api_key') || url.searchParams.get('apiKey');

  const rawProvidedKey = apiKeyHeader || bearerToken || queryApiKey;
  const providedKey = rawProvidedKey ? cleanKey(rawProvidedKey) : null;
  const { standardKeys, adminKeys } = getConfiguredApiKeys();

  const isAdminKey = !!providedKey && adminKeys.includes(providedKey);
  const isValidApiKey = !!providedKey && standardKeys.includes(providedKey);

  // If a valid API key was provided
  if (isValidApiKey) {
    if (options.requireAdmin && !isAdminKey) {
      return {
        allowed: false,
        status: 403,
        message: 'Forbidden: Admin API key required for this operation.',
        isFirstParty: false,
        isApiKey: true,
        isAdmin: false,
      };
    }

    return {
      allowed: true,
      status: 200,
      message: 'Authorized via API key',
      isFirstParty: false,
      isApiKey: true,
      isAdmin: isAdminKey,
    };
  }

  // 2. First-party browser validation
  // Check Sec-Fetch-Site (modern browsers forbid script spoofing of Sec-Fetch-* headers)
  const secFetchSite = headers.get('sec-fetch-site')?.toLowerCase();
  const origin = headers.get('origin');
  const referer = headers.get('referer');
  const host = headers.get('host');
  const clientSource = headers.get('x-client-source');

  const isSameOriginSecFetch = secFetchSite === 'same-origin' || secFetchSite === 'same-site';
  const isOriginAllowed = origin ? isAllowedOrigin(origin, host) : false;
  const isRefererAllowed = referer ? isAllowedOrigin(referer, host) : false;
  const isInternalClient = clientSource === 'freeof-web';

  const isLegitimateFirstParty = 
    isSameOriginSecFetch || 
    isOriginAllowed || 
    (isRefererAllowed && (isInternalClient || !origin));

  if (isLegitimateFirstParty) {
    // For mutating methods (POST, PUT, PATCH, DELETE), require admin or first-party same-origin
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (options.requireAdmin && !isSameOriginSecFetch && !isInternalClient) {
        return {
          allowed: false,
          status: 403,
          message: 'Forbidden: Mutating operations require valid authentication.',
          isFirstParty: true,
          isApiKey: false,
          isAdmin: false,
        };
      }
    }

    return {
      allowed: true,
      status: 200,
      message: 'Authorized via first-party application origin',
      isFirstParty: true,
      isApiKey: false,
      isAdmin: true,
    };
  }

  // If neither a valid API key nor an authorized first-party origin was verified:
  return {
    allowed: false,
    status: providedKey ? 403 : 401,
    message: providedKey 
      ? 'Forbidden: Invalid API key provided.' 
      : 'Unauthorized: Access restricted to authorized callers. Provide a valid API key via x-api-key or Authorization header.',
    isFirstParty: false,
    isApiKey: false,
    isAdmin: false,
  };
}

/**
 * Constructs security and CORS headers tailored to the caller
 */
export function getSecurityHeaders(request: Request | NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const allowed = origin && isAllowedOrigin(origin, host);

  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Vary': 'Origin, Accept, Authorization, x-api-key',
  };

  if (allowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-api-key, x-client-source, x-requested-with';
    headers['Access-Control-Max-Age'] = '86400';
  }

  return headers;
}

/**
 * Standardized unauthorized JSON response
 */
export function createUnauthorizedResponse(authResult: ApiAuthResult, request: Request | NextRequest) {
  const secHeaders = getSecurityHeaders(request);
  return NextResponse.json(
    {
      error: authResult.status === 403 ? 'Forbidden' : 'Unauthorized',
      message: authResult.message,
      statusCode: authResult.status,
    },
    {
      status: authResult.status,
      headers: {
        ...secHeaders,
        'WWW-Authenticate': 'Bearer realm="FreeOF API", charset="UTF-8"',
      },
    }
  );
}
