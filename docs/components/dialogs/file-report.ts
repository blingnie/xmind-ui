import { REGION } from 'client/constants'
import { $T } from 'client/library/translation'

export type FileReportConfig = {
  title: string
  reportReasonsTitle: string
  reportReasons: string[]
  reportDetailTitle: string
  reportDetailInputHint: string
  buttonText: string
}

export const fileReportConfig: FileReportConfig =
  REGION === 'cn'
    ? {
        title: '举报',
        reportReasonsTitle: '为什么举报这个文件（必选）',
        reportReasons: ['政治敏感', '违法违规', '色情低俗', '涉及未成年人有害信息'],
        reportDetailTitle: '举报说明（必填）',
        reportDetailInputHint: '请描述举报原因（5 - 200字）',
        buttonText: '举报',
      }
    : {
        title: $T('Report'),
        reportReasonsTitle: 'What type of issue are you reporting?',
        reportReasons: [$T('Phishing or spam'), $T('Inappropriate or offensive content'), $T('Sexual or obscene content'), $T('Other')],
        reportDetailTitle: $T('Report details (required)'),
        reportDetailInputHint: 'Tell us what happened (5–200 characters)',
        buttonText: $T('Submit'),
      }
