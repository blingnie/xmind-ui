import { simplePath } from 'utils/import-file'

export const copilotImportFileMimeTypes: Record<string, string[]> = {
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], // powerpoint
  // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'], // excel
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.doc'], // word
  'application/markdown': ['.md'], // markdown
  'application/pdf': ['.pdf'], // pdf
  // 'application/csv': ['.csv'], // csv
  'text/plain': ['.txt'], // txt
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

export const computeCopilotImportFileMimeType = (file: File): string | undefined => {
  const suffix = simplePath.extname(file.name).toLowerCase()
  return Object.keys(copilotImportFileMimeTypes).find((mime: string) => copilotImportFileMimeTypes[mime].includes(suffix))
}

export const isImageMimeType = (mime: string): boolean => mime === 'image/jpeg' || mime === 'image/png'

export const getFileMimeTypeIconPath = (mime: string, isDark?: boolean) => {
  const basePath = '/assets/static/images/export-animation/light/'
  const darkBasePath = '/assets/static/images/export-animation/dark/'
  const currentPath = isDark ? darkBasePath : basePath
  switch (mime) {
    case 'application/markdown':
      return `${currentPath}Markdown.svg`
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return `${currentPath}Word.svg`
    // case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    //   return `${currentPath}Excel.svg`
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return `${currentPath}PowerPoint.svg`
    case 'application/pdf':
      return `${currentPath}PDF.svg`
    // case 'application/csv':
    //   return `${currentPath}CSV.svg`
    case 'text/plain':
      return `${currentPath}Text.svg`
    default:
      return `${currentPath}Error.svg`
  }
}
