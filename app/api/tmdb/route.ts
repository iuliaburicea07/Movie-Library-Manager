import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  
  const params = new URLSearchParams({ api_key: apiKey });
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      params.set(key, value);
    }
  });

  const url = `${TMDB_BASE}${endpoint}?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
