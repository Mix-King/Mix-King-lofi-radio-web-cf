import { NextResponse } from 'next/server';
import { stations } from '@/lib/stations';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json(stations);
}
