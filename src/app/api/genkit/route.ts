import {createApiHandler} from '@genkit-ai/next/server';
import {ai} from '@/ai/genkit';

export const {POST} = createApiHandler({
    ai
});
