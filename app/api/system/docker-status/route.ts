import { NextResponse } from 'next/server'
import { exec } from 'node:child_process'

export async function GET() {
  const running = await new Promise<boolean>((resolve) => {
    exec('docker info', { timeout: 2500 }, (error) => resolve(!error))
  })
  return NextResponse.json({ running })
}
