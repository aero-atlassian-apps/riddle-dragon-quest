import { createRoom } from '@/utils/db';

export async function POST(req: Request) {
  try {
    const { sessionId, roomName, roomId, tokensLeft } = await req.json();

    if (!sessionId || !roomName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const room = await createRoom(sessionId, roomName, roomId, undefined, undefined, tokensLeft, tokensLeft);

    if (!room) {
      return new Response(JSON.stringify({ error: 'Failed to create room' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(room), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in createRoom API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}