'use server';
/**
 * @fileOverview A voice-to-order AI agent.
 *
 * - voiceToOrder - A function that transcribes and parses audio into order details.
 * - VoiceOrderInput - The input type containing the audio data URI.
 * - VoiceOrderOutput - The structured order details.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VoiceOrderInputSchema = z.object({
  audioDataUri: z.string().describe(
    "A recording of a waiter taking an order, as a data URI. Expected format: 'data:audio/<mimetype>;base64,<encoded_data>'."
  ),
});
export type VoiceOrderInput = z.infer<typeof VoiceOrderInputSchema>;

const VoiceOrderOutputSchema = z.object({
  customer_name: z.string().optional().describe('The name of the customer mentioned.'),
  table_no: z.string().optional().describe('The table number mentioned.'),
  phone_number: z.string().optional().describe('Any phone number mentioned.'),
  items: z.array(z.object({
    item_name: z.string().describe('The name of the menu item.'),
    quantity: z.number().describe('The number of items ordered.'),
  })).optional().describe('A list of items and their quantities.'),
});
export type VoiceOrderOutput = z.infer<typeof VoiceOrderOutputSchema>;

export async function voiceToOrder(input: VoiceOrderInput): Promise<VoiceOrderOutput> {
  return voiceToOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceToOrderPrompt',
  input: { schema: VoiceOrderInputSchema },
  output: { schema: VoiceOrderOutputSchema },
  prompt: `You are an expert order-taking assistant for "Dipti's Orders", a busy cafe.
  
Listen to the provided audio recording of a waiter taking an order. Extract the customer's name, table number, phone number, and the list of items they want to order with their quantities.

Be smart about identifying items. For example, if they say "two lattes", the item name is "Latte" and quantity is 2.

Return the data in a structured format. If a detail isn't mentioned, leave it out.

Audio: {{media url=audioDataUri}}`,
});

const voiceToOrderFlow = ai.defineFlow(
  {
    name: 'voiceToOrderFlow',
    inputSchema: VoiceOrderInputSchema,
    outputSchema: VoiceOrderOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
