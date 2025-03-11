// Adaptive processing based on system capabilities
export const getProcessingStrategy = () => {
  const cores = navigator.hardwareConcurrency || 4;
  return cores >= 6 ? 'parallel' : cores >= 4 ? 'balanced' : 'conservative';
};

// Web Worker-based NLP processing
export const createNLPWorker = () => {
  return new Worker(new URL('../workers/nlp.worker.ts', import.meta.url));
}; 