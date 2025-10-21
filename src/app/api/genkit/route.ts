import {createApiHandler} from '@genkit-ai/next/api';
import {ai} from '@/ai/genkit';

export const {POST} = createApiHandler({
    ai
});
