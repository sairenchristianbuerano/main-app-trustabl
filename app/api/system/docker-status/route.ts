import { NextResponse } from 'next/server'

// Mocked like the rest of this prototype (scans, autofix runs, LLM connect all
// simulate rather than hit a real system). The first check reports "not
// running", every check after that reports "running" — so the retry flow is
// demoable regardless of how long the user takes to click Retry.
let checkCount = 0

export async function GET() {
  checkCount++
  return NextResponse.json({ running: checkCount >= 2 })
}
