import { $T, GLOBAL_LANG_LABELS, type Lang, fetchTranslation, getBrowserLanguage, getCurrentLanguage } from 'client/library/translation'
import { tryReplaceLangPath } from 'client/shared/landing/common'
import { localStore } from 'utils/browserStorage'
import { reactive, ref } from 'vue'

const TRANSLATION_WARNED_KEY = 'TRANSLATION_LANG_WARNED'

/**
 * Make the scanner to find the following strings.
 * Change this must change the reference below.
 */
$T('We now support $1. Would you like to switch to the $1 version?')
$T('Switch')

/**
 * Detect whether to show the language header.
 * Condition:
 * - first time, aka no record in local storage
 * - language in local storage is different from browser language
 */
function shouldShowLangHeader() {
  const warned = localStore.get(TRANSLATION_WARNED_KEY)
  if (warned) {
    return false
  }
  const currentLang = getCurrentLanguage()
  const browserLang = getBrowserLanguage()
  return browserLang && currentLang !== browserLang
}

/**
 * The common logic about lang reused between landing and home.
 */
export function useLangHeader() {
  const visible = ref(shouldShowLangHeader())

  const browserLang = getBrowserLanguage()

  function close() {
    localStore.set(TRANSLATION_WARNED_KEY, '1')
    visible.value = false
  }

  async function switchAndClose() {
    tryReplaceLangPath(browserLang as Lang)
    close()
  }

  /**
   * Note: text here should use browser language
   */
  const text = reactive({
    description:
      browserLang && 'We now support $1. Would you like to switch to the $1 version?'.replace(/\$1/g, GLOBAL_LANG_LABELS[browserLang].title),
    switch: 'Switch',
  })

  browserLang &&
    fetchTranslation(browserLang as Lang).then(language => {
      text.description = language?.['We now support $1. Would you like to switch to the $1 version?'].replace(
        /\$1/g,
        GLOBAL_LANG_LABELS[browserLang].title,
      )
      text.switch = language?.Switch
    })

  return {
    visible,
    browserLang,
    close,
    switchAndClose,
    text,
  }
}
