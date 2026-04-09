export default defineEventHandler(() => {
  const models = []

  if (process.env.GEMINI_API_KEY) {
    models.push({ id: 'gemini', label: 'Gemini 2.0 Flash', provider: 'Google' })
  }
  if (process.env.GROQ_API_KEY) {
    models.push({ id: 'groq', label: 'Llama 3.3', provider: 'Groq' })
    models.push({ id: 'qwen3', label: 'Qwen3', provider: 'Groq' })
  }

  return { models }
})
