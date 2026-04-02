import { $T, CopilotLanguage, CopilotOutputLanguages } from 'client/library/translation'

export interface CopilotLanguageOption {
  key: CopilotLanguage | 'auto'
  label: string
}

export function buildLanguageOptions(): CopilotLanguageOption[] {
  const options: CopilotLanguageOption[] = Object.keys(CopilotOutputLanguages).map(key => ({
    key: key as CopilotLanguage,
    label: CopilotOutputLanguages[key as CopilotLanguage],
  }))
  options.unshift({ key: 'auto', label: $T('Auto') })
  return options
}
