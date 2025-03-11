/// <reference lib="webworker" />
import { processInput } from '../services/nlpProcessor';

addEventListener('message', ({ data }) => {
  const result = processInput(data, { mentionedEntities: [], history: [] });
  postMessage(result);
}); 