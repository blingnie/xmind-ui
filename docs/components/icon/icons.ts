import downloadDark from './fw-icons/toast/download-dark.svg'
import downloadLight from './fw-icons/toast/download-light.svg'
import error from './fw-icons/toast/error.svg'
import loadingDark from './fw-icons/toast/loading-dark.svg'
import loadingLight from './fw-icons/toast/loading-light.svg'
import success from './fw-icons/toast/success.svg'
import warning from './fw-icons/toast/warning.svg'
import uploadDark from './fw-icons/toast/upload-dark.svg'
import uploadLight from './fw-icons/toast/upload-light.svg'
import informationLight from './fw-icons/toast/information-light.svg'
import informationDark from './fw-icons/toast/information-dark.svg'
import blankSvg from './fw-icons/blank.svg'

const ICONS = {
  add: {
    component: () => import('./fw-icons/add.svg'),
  },
  adjustment: {
    component: () => import('./fw-icons/adjustment.svg'),
  },
  'ai-mindmap': {
    component: () => import('./fw-icons/ai-mindmap.svg'),
  },
  'xmind-ai': {
    component: () => import('./fw-icons/xmind-ai.svg'),
  },
  'xmind-ai-thinline': {
    component: () => import('./fw-icons/xmind-ai-thinline.svg'),
  },
  'xmind-ai-colorful': {
    component: () => import('./fw-icons/xmind-ai-colorful.svg'),
  },
  'ai-type': {
    component: () => import('./fw-icons/ai-type.svg'),
  },
  'ai-map-refine': {
    component: () => import('./fw-icons/ai-map-refine.svg'),
  },
  'add-outline': {
    component: () => import('./fw-icons/add-outline.svg'),
  },
  'add-topic': {
    component: () => import('./fw-icons/add-topic.svg'),
  },
  'add-subtopic': {
    component: () => import('./fw-icons/add-subtopic.svg'),
  },
  all: {
    component: () => import('./fw-icons/all.svg'),
  },
  apple: {
    component: () => import('./fw-icons/apple.svg'),
  },
  'arrow-down': {
    component: () => import('./fw-icons/arrow-down.svg'),
  },
  'arrow-leftward': {
    component: () => import('./fw-icons/arrow-leftward.svg'),
  },
  'arrow-rightward': {
    component: () => import('./fw-icons/arrow-rightward.svg'),
  },
  'arrow-up-arrow-down': {
    component: () => import('./fw-icons/arrow-up-arrow-down.svg'),
  },
  'arrow-up-left': {
    component: () => import('./fw-icons/arrow-up-left.svg'),
  },
  'arrow-upward': {
    component: () => import('./fw-icons/arrow-upward.svg'),
  },
  'arrow-fill-down': {
    component: () => import('./fw-icons/arrow-fill-down.svg'),
  },
  'arrow-fill-right': {
    component: () => import('./fw-icons/arrow-fill-right.svg'),
  },
  attachment: {
    component: () => import('./fw-icons/attachment.svg'),
  },
  'audio-note': {
    component: () => import('./fw-icons/audio-note.svg'),
  },
  'auto-generate': {
    component: () => import('./fw-icons/auto-generate.svg'),
  },
  bold: {
    component: () => import('./fw-icons/bold.svg'),
  },
  boundary: {
    component: () => import('./fw-icons/boundary.svg'),
  },
  brainstorm: {
    component: () => import('./fw-icons/brainstorm.svg'),
  },
  brush: {
    component: () => import('./fw-icons/brush.svg'),
  },
  calendar: {
    component: () => import('./fw-icons/calendar.svg'),
  },
  callout: {
    component: () => import('./fw-icons/callout.svg'),
  },
  camera: {
    component: () => import('./fw-icons/camera.svg'),
  },
  'checkmark-circle-fill': {
    component: () => import('./fw-icons/checkmark-circle-fill.svg'),
  },
  'checkmark-circle-outline': {
    component: () => import('./fw-icons/checkmark-circle-outline.svg'),
  },
  'chevron-backward': {
    component: () => import('./fw-icons/chevron-backward.svg'),
  },
  'chevron-double-backforward': {
    component: () => import('./fw-icons/chevron-double-backforward.svg'),
  },
  'chevron-double-forward': {
    component: () => import('./fw-icons/chevron-double-forward.svg'),
  },
  'chevron-downward': {
    component: () => import('./fw-icons/chevron-downward.svg'),
  },
  'chevron-forward': {
    component: () => import('./fw-icons/chevron-forward.svg'),
  },
  'chevron-upward': {
    component: () => import('./fw-icons/chevron-upward.svg'),
  },
  close: {
    component: () => import('./fw-icons/close.svg'),
  },
  'cloud-exclamation': {
    component: () => import('./fw-icons/cloud-exclamation.svg'),
  },
  'cloud-success': {
    component: () => import('./fw-icons/cloud-success.svg'),
  },
  'cloud-sync': {
    component: () => import('./fw-icons/cloud-sync.svg'),
  },
  'cloud-upload': {
    component: () => import('./fw-icons/cloud-upload.svg'),
  },
  'cloud-xmarks': {
    component: () => import('./fw-icons/cloud-xmarks.svg'),
  },
  cloud: {
    component: () => import('./fw-icons/cloud.svg'),
  },
  code: {
    component: () => import('./fw-icons/code.svg'),
  },
  'comment-add': {
    component: () => import('./fw-icons/comment-add.svg'),
  },
  'comment-badge': {
    component: () => import('./fw-icons/comment-badge.svg'),
  },
  comment: {
    component: () => import('./fw-icons/comment.svg'),
  },
  copy: {
    component: () => import('./fw-icons/copy.svg'),
  },
  creditcard: {
    component: () => import('./fw-icons/creditcard.svg'),
  },
  credits: {
    component: () => import('./fw-icons/credits.svg'),
  },
  'credits-notification': {
    component: () => import('./fw-icons/credits-notification.svg'),
  },
  crown: {
    component: () => import('./fw-icons/crown.svg'),
  },
  'crown-fill': {
    component: () => import('./fw-icons/crown-fill.svg'),
  },
  'data-masking': {
    component: () => import('./fw-icons/data-masking.svg'),
  },
  'double-arrow-1': {
    component: () => import('./fw-icons/double-arrow-1.svg'),
  },
  'double-arrow': {
    component: () => import('./fw-icons/double-arrow.svg'),
  },
  'download-1': {
    component: () => import('./fw-icons/download-1.svg'),
  },
  'download-2': {
    component: () => import('./fw-icons/download-2.svg'),
  },
  download: {
    component: () => import('./fw-icons/download.svg'),
  },
  'download-invoice': {
    component: () => import('./fw-icons/download-invoice.svg'),
  },
  drag: {
    component: () => import('./fw-icons/drag.svg'),
  },
  'dropbox-black': {
    component: () => import('./fw-icons/dropbox-black.svg'),
  },
  'dropbox-color': {
    component: () => import('./fw-icons/dropbox-color.svg'),
  },
  duplicate: {
    component: () => import('./fw-icons/duplicate.svg'),
  },
  edit: {
    component: () => import('./fw-icons/edit.svg'),
  },
  enter: {
    component: () => import('./fw-icons/enter.svg'),
  },
  enterprise: {
    component: () => import('./fw-icons/enterprise.svg'),
  },
  equation: {
    component: () => import('./fw-icons/equation.svg'),
  },
  'error-circular': {
    component: () => import('./fw-icons/error-circular.svg'),
  },
  'exit-full-screen': {
    component: () => import('./fw-icons/exit-full-screen.svg'),
  },
  explain: {
    component: () => import('./fw-icons/explain.svg'),
  },
  export: {
    component: () => import('./fw-icons/export.svg'),
  },
  facebook: {
    component: () => import('./fw-icons/facebook.svg'),
  },
  ['facebook-color']: {
    component: () => import('./fw-icons/facebook-color.svg'),
  },
  good: {
    component: () => import('./fw-icons/good.svg'),
  },
  bad: {
    component: () => import('./fw-icons/bad.svg'),
  },
  'good-fill': {
    component: () => import('./fw-icons/good-fill.svg'),
  },
  'bad-fill': {
    component: () => import('./fw-icons/bad-fill.svg'),
  },
  faq: {
    component: () => import('./fw-icons/faq.svg'),
  },
  feedback: {
    component: () => import('./fw-icons/feedback.svg'),
  },
  file: {
    component: () => import('./fw-icons/file.svg'),
  },
  'file-brainstorming': {
    component: () => import('./fw-icons/file-brainstorming.svg'),
  },
  'file-mindmap': {
    component: () => import('./fw-icons/file-mindmap.svg'),
  },
  'finish-to-start': {
    component: () => import('./fw-icons/finish-to-start.svg'),
  },
  'file-horizontal': {
    component: () => import('./fw-icons/file-horizontal.svg'),
  },
  'file-share': {
    component: () => import('./fw-icons/file-share.svg'),
  },
  'file-share-fill': {
    component: () => import('./fw-icons/file-share-fill.svg'),
  },
  'filter-1': {
    component: () => import('./fw-icons/filter-1.svg'),
  },
  filter: {
    component: () => import('./fw-icons/filter.svg'),
  },
  'folder-add': {
    component: () => import('./fw-icons/folder-add.svg'),
  },
  folder: {
    component: () => import('./fw-icons/folder.svg'),
  },
  'full-screen': {
    component: () => import('./fw-icons/full-screen.svg'),
  },
  'file-report': {
    component: () => import('./fw-icons/file-report.svg'),
  },
  'generate-on-demand': {
    component: () => import('./fw-icons/generate-on-demand.svg'),
  },
  'get-link': {
    component: () => import('./fw-icons/get-link.svg'),
  },
  gift: {
    component: () => import('./fw-icons/gift.svg'),
  },
  general: {
    component: () => import('./fw-icons/general.svg'),
  },
  global: {
    component: () => import('./fw-icons/global.svg'),
  },
  google: {
    component: () => import('./fw-icons/google.svg'),
  },
  'googledrive-black': {
    component: () => import('./fw-icons/googledrive-black.svg'),
  },
  'googledrive-color': {
    component: () => import('./fw-icons/googledrive-color.svg'),
  },
  grid: {
    component: () => import('./fw-icons/grid.svg'),
  },
  'gantt-chart': {
    component: () => import('./fw-icons/gantt-chart.svg'),
  },
  'hamburger-list': {
    component: () => import('./fw-icons/hamburger-list.svg'),
  },
  'home-fill': {
    component: () => import('./fw-icons/home-fill.svg'),
  },
  hyperlink: {
    component: () => import('./fw-icons/hyperlink.svg'),
  },
  import: {
    component: () => import('./fw-icons/import.svg'),
  },
  'instagram-fill': {
    component: () => import('./fw-icons/instagram-fill.svg'),
  },
  'information-fill': {
    component: () => import('./fw-icons/information-fill.svg'),
  },
  'information-outline': {
    component: () => import('./fw-icons/information-outline.svg'),
  },
  illustration: {
    component: () => import('./fw-icons/illustration.svg'),
  },
  italic: {
    component: () => import('./fw-icons/italic.svg'),
  },
  keyboard: {
    component: () => import('./fw-icons/keyboard.svg'),
  },
  lable: {
    component: () => import('./fw-icons/lable.svg'),
  },
  list: {
    component: () => import('./fw-icons/list.svg'),
  },
  'list-bullet': {
    component: () => import('./fw-icons/list-bullet.svg'),
  },
  loading: {
    component: () => import('./fw-icons/loading.svg'),
  },
  lock: {
    component: () => import('./fw-icons/lock.svg'),
  },
  'lock-pro': {
    component: () => import('./fw-icons/lock-pro.svg'),
  },
  'map-auto': {
    component: () => import('./fw-icons/map-auto.svg'),
  },
  'logic-chart-right': {
    component: () => import('./fw-icons/logic-chart-right.svg'),
  },
  'brace-map-right': {
    component: () => import('./fw-icons/brace-map-right.svg'),
  },
  'org-chart-down': {
    component: () => import('./fw-icons/org-chart-down.svg'),
  },
  'fishbone-right': {
    component: () => import('./fw-icons/fishbone-right.svg'),
  },
  'timeline-horizontal-right': {
    component: () => import('./fw-icons/timeline-horizontal-right.svg'),
  },
  'tree-chart-balance-down': {
    component: () => import('./fw-icons/tree-chart-balance-down.svg'),
  },
  'magic-wand': {
    component: () => import('./fw-icons/magic-wand.svg'),
  },
  'map-location': {
    component: () => import('./fw-icons/map-location.svg'),
  },
  marker: {
    component: () => import('./fw-icons/marker.svg'),
  },
  mention: {
    component: () => import('./fw-icons/mention.svg'),
  },
  minus: {
    component: () => import('./fw-icons/minus.svg'),
  },
  'minus-outline': {
    component: () => import('./fw-icons/minus-outline.svg'),
  },
  more: {
    component: () => import('./fw-icons/more.svg'),
  },
  music: {
    component: () => import('./fw-icons/music.svg'),
  },
  'move-to': {
    component: () => import('./fw-icons/move-to.svg'),
  },
  'my-works': {
    component: () => import('./fw-icons/my-works.svg'),
  },
  'my-works-fill': {
    component: () => import('./fw-icons/my-works-fill.svg'),
  },
  'new-cloud': {
    component: () => import('./fw-icons/new-cloud.svg'),
  },
  'new-feature': {
    component: () => import('./fw-icons/new-feature.svg'),
  },
  'new-file': {
    component: () => import('./fw-icons/new-file.svg'),
  },
  'new-sheet': {
    component: () => import('./fw-icons/new-sheet.svg'),
  },
  'new-subtopic': {
    component: () => import('./fw-icons/new-subtopic.svg'),
  },
  'new-topic': {
    component: () => import('./fw-icons/new-topic.svg'),
  },
  'note-link': {
    component: () => import('./fw-icons/note-link.svg'),
  },
  note: {
    component: () => import('./fw-icons/note.svg'),
  },
  ['note-release']: {
    component: () => import('./fw-icons/note-release.svg'),
  },
  'number-list': {
    component: () => import('./fw-icons/number-list.svg'),
  },
  'onedrive-black': {
    component: () => import('./fw-icons/onedrive-black.svg'),
  },
  'onedrive-color': {
    component: () => import('./fw-icons/onedrive-color.svg'),
  },
  'panel-left': {
    component: () => import('./fw-icons/panel-left.svg'),
  },
  'panel-right': {
    component: () => import('./fw-icons/panel-right.svg'),
  },
  'person-add': {
    component: () => import('./fw-icons/person-add.svg'),
  },
  'person-delete': {
    component: () => import('./fw-icons/person-delete.svg'),
  },
  'person-fill': {
    component: () => import('./fw-icons/person-fill.svg'),
  },
  'person-information': {
    component: () => import('./fw-icons/person-information.svg'),
  },
  'person-manage': {
    component: () => import('./fw-icons/person-manage.svg'),
  },
  'person-remove': {
    component: () => import('./fw-icons/person-remove.svg'),
  },
  'person-team': {
    component: () => import('./fw-icons/person-team.svg'),
  },
  'person-work-fill': {
    component: () => import('./fw-icons/person-work-fill.svg'),
  },
  person: {
    component: () => import('./fw-icons/person.svg'),
  },
  planned: {
    component: () => import('./fw-icons/planned.svg'),
  },
  photo: {
    component: () => import('./fw-icons/photo.svg'),
  },
  'pin-fill': {
    component: () => import('./fw-icons/pin-fill.svg'),
  },
  'pin-outline': {
    component: () => import('./fw-icons/pin-outline.svg'),
  },
  pitch: {
    component: () => import('./fw-icons/pitch.svg'),
  },
  plan: {
    component: () => import('./fw-icons/plan.svg'),
  },
  play: {
    component: () => import('./fw-icons/play.svg'),
  },
  'play-fill-reverse': {
    component: () => import('./fw-icons/play-fill-reverse.svg'),
  },
  'play-fill': {
    component: () => import('./fw-icons/play-fill.svg'),
  },
  'play-outline-reverse': {
    component: () => import('./fw-icons/play-outline-reverse.svg'),
  },
  'play-outline': {
    component: () => import('./fw-icons/play-outline.svg'),
  },
  'preview-slash': {
    component: () => import('./fw-icons/preview-slash.svg'),
  },
  preview: {
    component: () => import('./fw-icons/preview.svg'),
  },
  print: {
    component: () => import('./fw-icons/print.svg'),
  },
  'privacy-policy': {
    component: () => import('./fw-icons/privacy-policy.svg'),
  },
  'question-sign-fill': {
    component: () => import('./fw-icons/question-sign-fill.svg'),
  },
  'question-sign': {
    component: () => import('./fw-icons/question-sign.svg'),
  },
  recent: {
    component: () => import('./fw-icons/recent.svg'),
  },
  redo: {
    component: () => import('./fw-icons/redo.svg'),
  },
  'person-native-add': {
    component: () => import('./fw-icons/person-native-add.svg'),
  },
  relationship: {
    component: () => import('./fw-icons/relationship.svg'),
  },
  'remove-background': {
    component: () => import('./fw-icons/remove-background.svg'),
  },
  'make-image': {
    component: () => import('./fw-icons/make-image.svg'),
  },
  rename: {
    component: () => import('./fw-icons/rename.svg'),
  },
  reorganize: {
    component: () => import('./fw-icons/reorganize.svg'),
  },
  refresh: {
    component: () => import('./fw-icons/refresh.svg'),
  },
  'ratio-lock': {
    component: () => import('./fw-icons/ratio-lock.svg'),
  },
  'ratio-unlock': {
    component: () => import('./fw-icons/ratio-unlock.svg'),
  },
  'rotate-right': {
    component: () => import('./fw-icons/rotate-right.svg'),
  },
  retry: {
    component: () => import('./fw-icons/retry.svg'),
  },
  save: {
    component: () => import('./fw-icons/save.svg'),
  },
  'save-as-map': {
    component: () => import('./fw-icons/save-as-map.svg'),
  },
  search: {
    component: () => import('./fw-icons/search.svg'),
  },
  sticker: {
    component: () => import('./fw-icons/sticker.svg'),
  },
  setting: {
    component: () => import('./fw-icons/setting.svg'),
  },
  sharelink: {
    component: () => import('./fw-icons/sharelink.svg'),
  },
  'sheet-new': {
    component: () => import('./fw-icons/sheet-new.svg'),
  },
  switch: {
    component: () => import('./fw-icons/switch.svg'),
  },
  sheet: {
    component: () => import('./fw-icons/sheet.svg'),
  },
  signout: {
    component: () => import('./fw-icons/signout.svg'),
  },
  space: {
    component: () => import('./fw-icons/space.svg'),
  },
  sun: {
    component: () => import('./fw-icons/sun.svg'),
  },
  'skeleton-hand-drawn': {
    component: () => import('./fw-icons/skeleton-hand-drawn.svg'),
  },
  'sun-fill': {
    component: () => import('./fw-icons/sun-fill.svg'),
  },
  'star-outline-slash': {
    component: () => import('./fw-icons/star-outline-slash.svg'),
  },
  'star-outline': {
    component: () => import('./fw-icons/star-outline.svg'),
  },
  star: {
    component: () => import('./fw-icons/star.svg'),
  },
  stop: {
    component: () => import('./fw-icons/stop.svg'),
  },
  summary: {
    component: () => import('./fw-icons/summary.svg'),
  },
  'success-circular': {
    component: () => import('./fw-icons/success-circular.svg'),
  },
  task: {
    component: () => import('./fw-icons/task.svg'),
  },
  text: {
    component: () => import('./fw-icons/text.svg'),
  },
  tick: {
    component: () => import('./fw-icons/tick.svg'),
  },
  tiktok: {
    component: () => import('./fw-icons/tiktok.svg'),
  },
  'timeline-vertical': {
    component: () => import('./fw-icons/timeline-vertical.svg'),
  },
  topiclink: {
    component: () => import('./fw-icons/topiclink.svg'),
  },
  'trash-outline-slash': {
    component: () => import('./fw-icons/trash-outline-slash.svg'),
  },
  'trash-xmarks': {
    component: () => import('./fw-icons/trash-xmarks.svg'),
  },
  trash: {
    component: () => import('./fw-icons/trash.svg'),
  },
  'trash-fill': {
    component: () => import('./fw-icons/trash-fill.svg'),
  },
  triangle: {
    component: () => import('./fw-icons/triangle.svg'),
  },
  underline: {
    component: () => import('./fw-icons/underline.svg'),
  },
  undo: {
    component: () => import('./fw-icons/undo.svg'),
  },
  union: {
    component: () => import('./fw-icons/union.svg'),
  },
  unlimited: {
    component: () => import('./fw-icons/unlimited.svg'),
  },
  'version-history': {
    component: () => import('./fw-icons/version-history.svg'),
  },
  'warning-circular': {
    component: () => import('./fw-icons/warning-circular.svg'),
  },
  work: {
    component: () => import('./fw-icons/work.svg'),
  },
  x: {
    component: () => import('./fw-icons/x.svg'),
  },
  'xmark-fill': {
    component: () => import('./fw-icons/xmark-fill.svg'),
  },
  xmind: {
    component: () => import('./fw-icons/xmind.svg'),
  },
  'zoom-in': {
    component: () => import('./fw-icons/zoom-in.svg'),
  },
  'zoom-out': {
    component: () => import('./fw-icons/zoom-out.svg'),
  },
  twitter: {
    component: () => import('./fw-icons/twitter.svg'),
  },
  ['twitter-color']: {
    component: () => import('./fw-icons/twitter-color.svg'),
  },
  linkedin: {
    component: () => import('./fw-icons/linkedin.svg'),
  },
  ['linkedin-color']: {
    component: () => import('./fw-icons/linkedin-color.svg'),
  },
  'identity-provision': {
    component: () => import('./fw-icons/identity-provision.svg'),
  },
  mail: {
    component: () => import('./fw-icons/mail.svg'),
  },
  slack: {
    component: () => import('./fw-icons/slack.svg'),
  },
  'deepseek-r1': {
    component: () => import('./fw-icons/deepseek-r1.svg'),
  },
  alipay: {
    component: () => import('./fw-icons/alipay.svg'),
  },
  'wechat-pay': {
    component: () => import('./fw-icons/wechat-pay.svg'),
  },
  doc: {
    component: () => import('./fw-icons/doc.svg'),
  },
  todo: {
    component: () => import('./fw-icons/todo.svg'),
  },
  mindmaps: {
    component: () => import('./fw-icons/mindmaps.svg'),
  },
  language: {
    component: () => import('./fw-icons/language.svg'),
  },
  'work-breakdown': {
    component: () => import('./fw-icons/work-breakdown.svg'),
  },
  'file-text': {
    component: () => import('./fw-icons/file-text.svg'),
  },
  'actual-size': {
    component: () => import('./fw-icons/actual-size.svg'),
  },
  'fit-map': {
    component: () => import('./fw-icons/fit-map.svg'),
  },
  'show-branch-only': {
    component: () => import('./fw-icons/show-branch-only.svg'),
  },
  zone: {
    component: () => import('./fw-icons/zone.svg'),
  },
  toolbar: {
    component: () => import('./fw-icons/toolbar.svg'),
  },
  topic: {
    component: () => import('./fw-icons/topic.svg'),
  },
}

const SYNC_ICONS = {
  'download-dark': downloadDark,
  'download-light': downloadLight,
  error,
  'loading-dark': loadingDark,
  'loading-light': loadingLight,
  success,
  warning,
  'upload-dark': uploadDark,
  'upload-light': uploadLight,
  'information-light': informationLight,
  'information-dark': informationDark,
  blank: blankSvg,
}

export const getSyncIconComponent = (name: IconName) => {
  return SYNC_ICONS[name]
}

export const getAllIconNames = () => Object.keys(ICONS) as IconName[]

export const getIconComponent = (name: IconName) => ICONS[name]?.component || null

export type IconName = keyof typeof ICONS | keyof typeof SYNC_ICONS
