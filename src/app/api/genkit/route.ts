'use server';
import { appRoute } from '@genkit-ai/next';
import { chatFlow } from '@/ai/dev';

export const POST = appRoute({
  flow: chatFlow,
});
