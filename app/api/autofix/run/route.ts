import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { repo_id } = await req.json()
  return NextResponse.json({ ok: true, repo_id })
}
