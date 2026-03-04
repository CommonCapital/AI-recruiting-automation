// app/api/interview/tts/route.ts
// Murf Falcon streaming TTS proxy — keeps API key server-side

import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { text, voiceId = "Matthew" } = await req.json();

  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "text is required" }), { status: 400 });
  }

  const murfRes = await fetch("https://global.api.murf.ai/v1/speech/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.MURF_API_KEY ?? "",
    },
    body: JSON.stringify({
      voiceId,
      text,
      multiNativeLocale: "en-US",
      model: "FALCON",
      format: "MP3",
      sampleRate: 24000,
      channelType: "MONO",
    }),
  });

  if (!murfRes.ok) {
    const err = await murfRes.text();
    return new Response(JSON.stringify({ error: err }), { status: murfRes.status });
  }

  // Stream the MP3 bytes straight back to the client
  return new Response(murfRes.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}