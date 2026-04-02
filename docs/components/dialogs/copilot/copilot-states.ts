import { type CopilotLanguageOption } from './copilot-language'
import { type PredefinedSkeletonGroupId } from './copilot-skeleton'

export type TaskOption = 'project-plan' | 'todo'

export interface CopilotDialogStatesSnapshot {
  inputText: string
  fileName: string | null
  fileContent: string | null
  file: File | null
  fileMimeType: string | null
  fileId: string | null
  isEnableThinking: boolean
  task: TaskOption | null
  language: CopilotLanguageOption['key']
  skeletonGroupId: PredefinedSkeletonGroupId
  spaceId: string | null
}
