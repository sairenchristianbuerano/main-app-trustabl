import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ finding_id: string }> }) {
  const { finding_id } = await params
  return NextResponse.json({ ok: true, finding_id })
}
