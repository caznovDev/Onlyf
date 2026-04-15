import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  let dbStatus = "unknown";
  let tables: any[] = [];
  let error: string | null = null;

  let db: any;
  try {
    db = getRequestContext().env.DB;
    if (db) {
      dbStatus = "connected";
      // Try to list tables to verify actual connection
      const { results } = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      tables = results.map((r: any) => r.name);
    } else {
      dbStatus = "missing_binding";
    }
  } catch (e: any) {
    dbStatus = "error";
    error = e.message;
  }

  return NextResponse.json({
    status: dbStatus,
    binding_name: "DB",
    tables: tables,
    error: error,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
