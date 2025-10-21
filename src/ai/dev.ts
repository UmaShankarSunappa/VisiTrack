import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'zod';

export const ai = genkit({
  plugins: [googleAI()],
});

// Define a simple chat flow
export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({ 
      message: z.string() 
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const result = await ai.generate({
        prompt: input.message,
        model: 'gemini-1.5-flash-latest',
    });
    const text = result.text();
    if (text === undefined) {
      // Handle the case where text() returns undefined
      // For example, by throwing an error or returning a default string
      throw new Error("No text was generated.");
    }
    return text;
  }
);
