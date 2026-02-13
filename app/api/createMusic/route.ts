import { NextResponse } from 'next/server';

/**
 * This is a wrapper/proxy endpoint for the real music API endpoint.
 * In a real implementation, you would add authorization checks here.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to the actual music API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/study/music`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Return the response from the music API
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error forwarding music generation request:', error);
    return NextResponse.json(
      { error: 'Failed to generate music' },
      { status: 500 }
    );
  }
}