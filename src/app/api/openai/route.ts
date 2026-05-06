import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const openai = getClient();
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI is not configured (missing OPENAI_API_KEY).' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({ 
      result: completion.choices[0].message.content 
    });
  } catch (error) {
    return NextResponse.json({ error: 'OpenAI API error' }, { status: 500 });
  }
}