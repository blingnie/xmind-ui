import { sessionStore } from 'utils/browserStorage'
import type { SettingsMenuModel } from '../copilot/settings-menu.vue'

export const TEMPLATE_PROMPT_HISTORY_KEY = 'templatePromptHistory'
export const TEMPLATE_LANGUAGE_HISTORY_KEY = 'templateLanguageHistory'

export function useTemplateAiHistory() {
  const getPromptHistory = () => (sessionStore.get(TEMPLATE_PROMPT_HISTORY_KEY) as string) || ''
  const setPromptHistory = (value: string) => sessionStore.set(TEMPLATE_PROMPT_HISTORY_KEY, value)
  const clearPromptHistory = () => sessionStore.remove(TEMPLATE_PROMPT_HISTORY_KEY)

  const getLanguageHistory = () =>
    ((sessionStore.get(TEMPLATE_LANGUAGE_HISTORY_KEY) as SettingsMenuModel['language']) ?? 'auto') as SettingsMenuModel['language']
  const setLanguageHistory = (value: SettingsMenuModel['language']) => sessionStore.set(TEMPLATE_LANGUAGE_HISTORY_KEY, value)
  const clearLanguageHistory = () => sessionStore.remove(TEMPLATE_LANGUAGE_HISTORY_KEY)

  const clearTemplateAiHistory = () => {
    clearPromptHistory()
    clearLanguageHistory()
  }

  return {
    getPromptHistory,
    setPromptHistory,
    clearPromptHistory,
    getLanguageHistory,
    setLanguageHistory,
    clearLanguageHistory,
    clearTemplateAiHistory,
  }
}
