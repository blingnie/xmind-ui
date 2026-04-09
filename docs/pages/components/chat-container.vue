<template>
  <div class="doc-page-layout">
    <!-- Main Content -->
    <div class="doc-page-content">
      <h1 class="text-xl">Chat Container</h1>
      <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 0;">A scrollable chat container with intelligent auto-scroll behavior. Composes UserMessage, AiMessage, and other AI components to create a complete conversational interface for mind map AI assistants.</p>

      <!-- Figma Link -->
      <PlatformLink
        href="https://www.figma.com/design/1Zb3WXCH66yxr6O4i7DFDg/xmind-UI-Components?node-id=16299-12076"
        label="Figma"
        :icon="FigmaIcon"
      />

      <!-- Default preview -->
      <section id="preview" class="doc-section">
        <div class="preview-card">
          <PreviewArea style="padding: 0; height: 800px; position: relative; background-color: var(--color-fill-container);">
            <ChatContainer ref="chatRef" style="height: 100%;">
              <template v-for="msg in messages" :key="msg.id">
                <!-- User Message -->
                <UserMessage v-if="msg.role === 'user'">
                  <template v-if="msg.attachments?.length" #attachments>
                    <Attachment
                      v-for="(att, ai) in msg.attachments"
                      :key="ai"
                      :type="att.type as any"
                      :title="att.title"
                      :subtitle="att.subtitle"
                      :file-type="att.fileType as any"
                      :thumbnail-url="att.thumbnailUrl"
                    />
                  </template>
                  <template v-if="msg.references?.length">
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                      <AiReference v-for="(ref, ri) in msg.references" :key="ri" :closable="false">
                        <template #icon>
                          <span v-html="TopicLinkIcon" />
                        </template>
                        {{ ref.label }}
                      </AiReference>
                    </div>
                  </template>
                  {{ msg.content }}
                </UserMessage>

                <!-- AI Message -->
                <AiMessage v-else>
                  <!-- Chain of Thought -->
                  <AiChainOfThought v-if="msg.steps?.length" :steps="msg.steps" />

                  <!-- Reasoning (思考过程显示在内容上方) -->
                  <AiReasoning
                    v-if="msg.reasoning"
                    :reasoning="false"
                    :content="msg.reasoning"
                    :default-expanded="false"
                  />

                  <!-- Text / Markdown content -->
                  <AiMarkdown v-if="msg.markdownContent" :content="msg.markdownContent" />
                  <p v-else-if="msg.content">{{ msg.content }}</p>

                  <!-- Actions -->
                  <template #actions>
                    <MessageActions @copy="handleCopyMessage(msg)" @feedback="(v) => handleFeedback(msg, v)" />
                  </template>
                </AiMessage>
              </template>

              <!-- Streaming indicator -->
              <AiMessage v-if="isStreaming">
                <AiChainOfThought v-if="streamingSteps.length" :steps="streamingSteps" />
                <AiReasoning
                  v-if="streamingReasoning"
                  :reasoning="streamingInThink"
                  :content="{ type: 'text', content: streamingReasoning }"
                  :default-expanded="true"
                />
                <AiMarkdown v-if="streamingContent" :content="streamingMarkdown" />
              </AiMessage>
            </ChatContainer>

            <!-- Bottom fade mask -->
            <div class="chat-input-mask" />

            <!-- Hidden file input -->
            <input
              ref="fileInputRef"
              type="file"
              multiple
              :accept="acceptTypes"
              style="display: none;"
              @change="handleFileSelect"
            />

            <!-- Input Area -->
            <div class="chat-input">
              <!-- Pending attachments -->
              <div v-if="pendingAttachments.length" class="chat-input__attachments">
                <Attachment
                  v-for="(att, i) in pendingAttachments"
                  :key="i"
                  :type="att.type as any"
                  :title="att.title"
                  :subtitle="att.subtitle"
                  :file-type="att.fileType as any"
                  :thumbnail-url="att.thumbnailUrl"
                  closable
                  @close="removePendingAttachment(i)"
                />
              </div>
              <div class="chat-input__textarea-wrap">
                <textarea
                  v-model="inputText"
                  class="chat-input__textarea"
                  rows="3"
                  @keydown.enter.exact.prevent="sendMessage"
                  @compositionstart="isComposing = true"
                  @compositionend="isComposing = false"
                />
                <span v-if="!inputText && !isComposing" class="chat-input__placeholder">{{ inputPlaceholder }}</span>
              </div>
              <div class="chat-input__toolbar">
                <div class="chat-input__toolbar-left">
                  <!-- Attachment button -->
                  <AiButton variant="outline" size="medium" icon-only @click="fileInputRef?.click()">
                    <template #icon-left>
                      <span v-html="AddIcon" />
                    </template>
                  </AiButton>
                  <!-- Model selector -->
                  <div v-if="availableModels.length > 0" class="chat-input__model-wrap">
                    <span class="chat-input__model-icon" v-html="selectedModelIcon" />
                    <div class="chat-input__model-sizer">
                      <span class="chat-input__model-mirror" aria-hidden="true">{{ selectedModelLabel }}</span>
                      <select v-model="selectedModel" class="chat-input__model">
                        <option value="simulate">Simulated</option>
                        <option v-for="m in availableModels" :key="m.id" :value="m.id">{{ m.label }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <AiButton
                  :variant="isStreaming ? 'outline' : 'default'"
                  size="medium"
                  icon-only
                  :disabled="!isStreaming && !inputText.trim() && !pendingAttachments.length"
                  @click="isStreaming ? stopStreaming() : sendMessage()"
                >
                  <template #icon-left>
                    <span v-html="isStreaming ? StopIcon : ArrowUpIcon" />
                  </template>
                </AiButton>
              </div>
            </div>
          </PreviewArea>
          <div class="pt-2 px-4 pb-4 border-t border-[var(--color-border-translucent)]">
            <Tabs v-model="activeTab" :tabs="['Usage', 'Source']" />
            <SimpleCodeBlock :code="activeTab === 'Usage' ? defaultUsage : componentSource" language="vue" height="280px" />
          </div>
        </div>
      </section>

      <!-- API Reference -->
      <section id="api" class="doc-section">
        <h2>API</h2>

        <!-- ChatContainer -->
        <h3 id="chat-container-props">ChatContainer</h3>
        <div class="api-table">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>autoScroll</code></span>
            <span data-label="Type"><code>boolean</code></span>
            <span data-label="Default"><code>true</code></span>
            <span data-label="Description">Enable auto-scroll to bottom when new content is added</span>
          </div>
        </div>

        <h4 style="margin-top: 16px;">Slots</h4>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>default</code></span>
            <span data-label="Description">Chat messages (UserMessage, AiMessage)</span>
          </div>
        </div>

        <h4 style="margin-top: 16px;">Expose</h4>
        <div class="api-table api-table--3-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>scrollToBottom</code></span>
            <span data-label="Type"><code>(smooth?: boolean) => void</code></span>
            <span data-label="Description">Programmatically scroll to the bottom</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>isAtBottom</code></span>
            <span data-label="Type"><code>Ref&lt;boolean&gt;</code></span>
            <span data-label="Description">Whether the container is scrolled to the bottom</span>
          </div>
        </div>

        <!-- UserMessage -->
        <h3 id="user-message-slots">UserMessage</h3>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>default</code></span>
            <span data-label="Description">Message text content</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>attachments</code></span>
            <span data-label="Description">File or image attachments above the message bubble</span>
          </div>
        </div>

        <!-- AiMessage -->
        <h3 id="ai-message-slots">AiMessage</h3>
        <div class="api-table api-table--2-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>default</code></span>
            <span data-label="Description">Message content (text, AiMarkdown, AiChainOfThought, AiReasoning)</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>actions</code></span>
            <span data-label="Description">Action buttons (copy, like, dislike) shown below the message</span>
          </div>
        </div>

        <!-- MessageActions -->
        <h3 id="message-actions-api">MessageActions</h3>
        <p class="text-sm text-[var(--color-text-tertiary)]" style="margin-bottom: 8px;">Bundled action bar with copy, good, bad buttons. Handles icon toggling and state internally.</p>
        <h4 style="margin-top: 16px;">Events</h4>
        <div class="api-table api-table--3-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Payload</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>copy</code></span>
            <span data-label="Payload">—</span>
            <span data-label="Description">Emitted when copy button is clicked. Icon switches to tick for 2 seconds.</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>feedback</code></span>
            <span data-label="Payload"><code>'good' | 'bad' | null</code></span>
            <span data-label="Description">Emitted when good/bad is toggled. Clicking the active button resets to null. Use for data collection or feedback forms.</span>
          </div>
        </div>
        <h4 style="margin-top: 16px;">Expose</h4>
        <div class="api-table api-table--3-cols">
          <div class="api-table__header">
            <span>Name</span>
            <span>Type</span>
            <span>Description</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>feedbackValue</code></span>
            <span data-label="Type"><code>Ref&lt;'good' | 'bad' | null&gt;</code></span>
            <span data-label="Description">Current feedback state. Read this to check user's selection.</span>
          </div>
          <div class="api-table__row">
            <span data-label="Name"><code>copied</code></span>
            <span data-label="Type"><code>Ref&lt;boolean&gt;</code></span>
            <span data-label="Description">Whether copy icon is in tick state</span>
          </div>
        </div>
      </section>

      <!-- Examples -->
      <section id="examples" class="doc-section">
        <h2>Examples</h2>

        <!-- User Message with Attachments -->
        <div id="example-user-attachments" class="example-block">
          <h3>User Message with Attachments</h3>
          <div class="preview-card">
            <PreviewArea>
              <UserMessage>
                <template #attachments>
                  <Attachment type="file" title="Sprint_Planning.pdf" subtitle="PDF" file-type="pdf" />
                  <Attachment type="preview" thumbnail-url="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop" />
                </template>
                Please analyze this sprint planning document and create a mind map that shows all the user stories grouped by epic.
              </UserMessage>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="userAttachmentsUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- AI Message with Chain of Thought -->
        <div id="example-ai-cot" class="example-block">
          <h3>AI Message with Chain of Thought</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiMessage>
                <AiChainOfThought :steps="exampleSteps" />
                <p>I've analyzed your mind map and reorganized the branches. The "Marketing Strategy" topic now has 4 sub-topics grouped by channel, and I've added timeline markers to each.</p>
                <template #actions>
                  <MessageActions />
                </template>
              </AiMessage>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="aiCotUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- AI Message with Markdown -->
        <div id="example-ai-markdown" class="example-block">
          <h3>AI Message with Markdown</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiMessage>
                <AiMarkdown :content="exampleMarkdown" />
                <template #actions>
                  <MessageActions />
                </template>
              </AiMessage>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="aiMarkdownUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- AI Message with Reasoning -->
        <div id="example-ai-reasoning" class="example-block">
          <h3>AI Message with Reasoning</h3>
          <div class="preview-card">
            <PreviewArea>
              <AiMessage>
                <AiReasoning
                  :reasoning="false"
                  :content="exampleReasoning"
                  :default-expanded="false"
                />
                <p>I've restructured the "Technical Architecture" branch of your mind map. The new layout separates frontend, backend, and infrastructure concerns into distinct sub-trees for better clarity.</p>
                <template #actions>
                  <MessageActions />
                </template>
              </AiMessage>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="aiReasoningUsage" language="vue" />
            </div>
          </div>
        </div>

        <!-- User Message with References -->
        <div id="example-user-references" class="example-block">
          <h3>User Message with Topic References</h3>
          <div class="preview-card">
            <PreviewArea>
              <UserMessage>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                  <AiReference :closable="false">
                    <template #icon>
                      <span v-html="TopicLinkIcon" />
                    </template>
                    Marketing Strategy
                  </AiReference>
                  <AiReference :closable="false">
                    <template #icon>
                      <span v-html="TopicLinkIcon" />
                    </template>
                    Q2 Launch Plan
                  </AiReference>
                </div>
                Can you merge these two topics and create a unified go-to-market timeline?
              </UserMessage>
            </PreviewArea>
            <div class="p-4 border-t border-[var(--color-border-translucent)]">
              <SimpleCodeBlock :code="userReferencesUsage" language="vue" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Table of Contents -->
    <DocTableOfContents :items="tocItems" class="hidden xl:block" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import ChatContainer from '../../../packages/components/ChatContainer/ChatContainer.vue'
import UserMessage from '../../../packages/components/ChatContainer/UserMessage.vue'
import AiMessage from '../../../packages/components/ChatContainer/AiMessage.vue'
import AiChainOfThought from '../../../packages/components/AiChainOfThought/AiChainOfThought.vue'
import AiMarkdown from '../../../packages/components/AiMarkdown/AiMarkdown.vue'
import AiReasoning from '../../../packages/components/AiReasoning/AiReasoning.vue'
import AiButton from '../../../packages/components/AiButton/AiButton.vue'
import MessageActions from '../../../packages/components/ChatContainer/MessageActions.vue'
import AiReference from '../../../packages/components/AiReference/AiReference.vue'
import Attachment from '../../../packages/components/Attachment/Attachment.vue'
import SimpleCodeBlock from '~/components/SimpleCodeBlock.vue'
import Tabs from '~/components/Tabs.vue'
import DocTableOfContents from '~/components/DocTableOfContents.vue'
import PlatformLink from '~/components/PlatformLink.vue'
import PreviewArea from '~/components/PreviewArea.vue'

import type { ChainOfThoughtStep } from '../../../packages/components/AiChainOfThought/AiChainOfThought.vue'
import type { ReasoningContent } from '../../../packages/components/AiReasoning/AiReasoning.vue'

// Icons
import TopicLinkIcon from '~/components/icon/fw-icons/topiclink.svg?raw'
import SearchIcon from '~/components/icon/fw-icons/search.svg?raw'
import GlobalIcon from '~/components/icon/fw-icons/global.svg?raw'
import MetaIcon from '~/components/icon/fw-icons/meta.svg?raw'
import WanIcon from '~/components/icon/fw-icons/wan.svg?raw'
import EditIcon from '~/components/icon/fw-icons/edit.svg?raw'
import ArrowUpIcon from '~/components/icon/fw-icons/arrow-upward.svg?raw'
import StopIcon from '~/components/icon/fw-icons/stop.svg?raw'
import AddIcon from '~/components/icon/fw-icons/add.svg?raw'

// Send icon (simple arrow SVG)
const SendIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// Figma icon
const FigmaIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.66667 18.3334C8.13943 18.3334 9.33333 17.1395 9.33333 15.6667V13.0001H6.66667C5.19391 13.0001 4 14.194 4 15.6667C4 17.1395 5.19391 18.3334 6.66667 18.3334Z" fill="#0ACF83"/>
  <path d="M4 10.0001C4 8.52728 5.19391 7.33337 6.66667 7.33337H9.33333V12.6667H6.66667C5.19391 12.6667 4 11.4728 4 10.0001Z" fill="#A259FF"/>
  <path d="M4.00001 4.66671C4.00001 3.19395 5.19392 2.00004 6.66668 2.00004H9.33334V7.33337H6.66668C5.19392 7.33337 4.00001 6.13947 4.00001 4.66671Z" fill="#F24E1E"/>
  <path d="M9.33334 2.00004H12C13.4728 2.00004 14.6667 3.19395 14.6667 4.66671C14.6667 6.13947 13.4728 7.33337 12 7.33337H9.33334V2.00004Z" fill="#FF7262"/>
  <path d="M14.6667 10.0001C14.6667 11.4728 13.4728 12.6667 12 12.6667C10.5272 12.6667 9.33334 11.4728 9.33334 10.0001C9.33334 8.52728 10.5272 7.33337 12 7.33337C13.4728 7.33337 14.6667 8.52728 14.6667 10.0001Z" fill="#1ABCFE"/>
</svg>`

definePageMeta({ layout: 'default' })

const activeTab = ref('Usage')
const chatRef = ref()
const inputText = ref('')
const isComposing = ref(false)
const inputPlaceholder = computed(() => {
  if (selectedModel.value === 'simulate') return 'Ask AI anything about your mind map'
  const model = availableModels.value.find(m => m.id === selectedModel.value)
  return model ? `Ask ${model.label} about your mind map` : 'Ask AI anything about your mind map'
})
const selectedModelLabel = computed(() => {
  if (selectedModel.value === 'simulate') return 'Simulated'
  const model = availableModels.value.find(m => m.id === selectedModel.value)
  return model?.label || 'Simulated'
})
const selectedModelIcon = computed(() => {
  if (selectedModel.value === 'groq') return MetaIcon
  if (selectedModel.value === 'qwen3') return WanIcon
  return GlobalIcon
})
const isStreaming = ref(false)
let abortController: AbortController | null = null
const streamingContent = ref('')
const streamingReasoning = ref('')
const streamingInThink = ref(false)
const streamingSteps = ref<ChainOfThoughtStep[]>([])

// 补全 streaming 中未闭合的 inline markdown 标记，让 marked 能正确解析
const completeMarkdown = (text: string): string => {
  if (!text) return text

  // 统计未闭合的 ** (bold)
  const boldCount = (text.match(/\*\*/g) || []).length
  if (boldCount % 2 !== 0) text += '**'

  // 统计未闭合的单 * (italic)，排除已配对的 **
  const cleaned = text.replace(/\*\*/g, '')
  const italicCount = (cleaned.match(/\*/g) || []).length
  if (italicCount % 2 !== 0) text += '*'

  // 统计未闭合的 ~~ (strikethrough)
  const strikeCount = (text.match(/~~/g) || []).length
  if (strikeCount % 2 !== 0) text += '~~'

  // 统计未闭合的 ` (inline code)，排除 ```
  const codeBlockCleaned = text.replace(/```/g, '')
  const backtickCount = (codeBlockCleaned.match(/`/g) || []).length
  if (backtickCount % 2 !== 0) text += '`'

  return text
}

const streamingMarkdown = computed(() => completeMarkdown(streamingContent.value))

// Model selection
interface ModelInfo { id: string; label: string; provider: string }
const availableModels = ref<ModelInfo[]>([])
const selectedModel = ref('simulate')

// ─── File Upload ─────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement>()

const FILE_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'text/markdown': 'md',
  'text/plain': 'txt',
}

const EXT_TYPE_MAP: Record<string, string> = {
  pdf: 'pdf', doc: 'doc', docx: 'doc', ppt: 'ppt', pptx: 'ppt', md: 'md', txt: 'txt',
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

const acceptTypes = [
  ...IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/markdown',
  'text/plain',
  '.md',
].join(',')

interface PendingAttachment {
  type: 'file' | 'preview'
  title: string
  subtitle: string
  fileType?: string
  thumbnailUrl?: string
}

const pendingAttachments = ref<PendingAttachment[]>([])

const getFileExtension = (name: string) => name.split('.').pop()?.toLowerCase() || ''

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  for (const file of Array.from(input.files)) {
    if (IMAGE_TYPES.includes(file.type)) {
      // Image → preview type with thumbnail
      const url = URL.createObjectURL(file)
      pendingAttachments.value.push({
        type: 'preview',
        title: file.name,
        subtitle: formatFileSize(file.size),
        thumbnailUrl: url,
      })
    } else {
      // File → file type with fileType
      const ext = getFileExtension(file.name)
      const fileType = FILE_TYPE_MAP[file.type] || EXT_TYPE_MAP[ext] || 'txt'
      pendingAttachments.value.push({
        type: 'file',
        title: file.name,
        subtitle: formatFileSize(file.size),
        fileType,
      })
    }
  }

  // Reset input so same file can be selected again
  input.value = ''
}

const removePendingAttachment = (index: number) => {
  const att = pendingAttachments.value[index]
  if (att.thumbnailUrl) URL.revokeObjectURL(att.thumbnailUrl)
  pendingAttachments.value.splice(index, 1)
}

onMounted(async () => {
  try {
    const data = await $fetch<{ models: ModelInfo[] }>('/api/chat-models')
    availableModels.value = data.models
    if (data.models.length > 0) {
      selectedModel.value = data.models[0].id
    }
  } catch {
    // Server routes not available, stay in simulate mode
  }
})

// Table of Contents
const tocItems = ref([
  { id: 'preview', text: 'Preview', level: 2 },
  { id: 'api', text: 'API', level: 2 },
  { id: 'chat-container-props', text: 'ChatContainer', level: 3 },
  { id: 'user-message-slots', text: 'UserMessage', level: 3 },
  { id: 'ai-message-slots', text: 'AiMessage', level: 3 },
  { id: 'message-actions-api', text: 'MessageActions', level: 3 },
  { id: 'examples', text: 'Examples', level: 2 },
  { id: 'example-user-attachments', text: 'With Attachments', level: 3 },
  { id: 'example-ai-cot', text: 'Chain of Thought', level: 3 },
  { id: 'example-ai-markdown', text: 'With Markdown', level: 3 },
  { id: 'example-ai-reasoning', text: 'With Reasoning', level: 3 },
  { id: 'example-user-references', text: 'Topic References', level: 3 },
])

// ─── Demo Messages ────────────────────────────────────────
interface DemoAttachment {
  type: string
  title: string
  subtitle?: string
  fileType?: string
  thumbnailUrl?: string
}

interface DemoReference {
  label: string
}

interface DemoMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  markdownContent?: string
  attachments?: DemoAttachment[]
  references?: DemoReference[]
  steps?: ChainOfThoughtStep[]
  reasoning?: ReasoningContent
}

const messages = ref<DemoMessage[]>([
  {
    id: '1',
    role: 'user',
    content: 'Please help me turn this product roadmap document into a well-structured mind map with key milestones and feature groups.',
    attachments: [
      { type: 'file', title: 'Product_Roadmap_2026.pdf', subtitle: 'PDF', fileType: 'pdf' },
    ],
  },
  {
    id: '2',
    role: 'assistant',
    content: '',
    steps: [
      { id: 's1', iconType: 'advanced', icon: SearchIcon, label: 'Reading document content', status: 'completed', detail: { type: 'content', content: 'Scanned 12 pages, extracted 47 feature items across 4 quarterly milestones.' } },
      { id: 's2', iconType: 'advanced', icon: GlobalIcon, label: 'Extracting key topics and milestones', status: 'completed', detail: { type: 'content', content: 'Identified 4 quarterly milestones, 12 epics, and 47 individual feature items from the document.' } },
      { id: 's3', iconType: 'advanced', icon: EditIcon, label: 'Organizing mind map hierarchy', status: 'completed', detail: { type: 'content', content: 'Created 4 main branches (Q1–Q4), 12 feature groups, and 47 leaf topics.' } },
      { id: 's4', iconType: 'basic', label: '', status: 'done' },
    ],
    markdownContent: `## Product Roadmap 2026

I've analyzed the document and organized it into the following mind map structure:

### Central Topic: Product Roadmap 2026

**Q1 — Foundation**
- User authentication & SSO integration
- Core REST API development
- Database schema design (PostgreSQL)
- CI/CD pipeline setup

**Q2 — AI Features**
- AI-powered topic suggestions
- Smart layout engine
- Natural language to mind map conversion
- Real-time collaboration (WebSocket)

**Q3 — Platform Expansion**
- Mobile app (iOS & Android)
- Offline mode with sync
- Third-party integrations (Jira, Notion, Slack)
- Export to PDF / Markdown / OPML

**Q4 — Scale & Polish**
- Performance optimization for large maps (10k+ nodes)
- Enterprise admin dashboard
- Custom theming engine
- Accessibility improvements (WCAG 2.1 AA)

The mind map has been created with **4 main branches**, **12 feature groups**, and **47 leaf topics**. Each quarterly branch is color-coded for easy identification.`,
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you expand this branch with more implementation details? I need technical architecture and estimated effort for each sub-task.',
    references: [
      { label: 'AI-powered topic suggestions' },
    ],
  },
  {
    id: '4',
    role: 'assistant',
    content: '',
    steps: [
      { id: 's5', iconType: 'advanced', icon: SearchIcon, label: 'Analyzing topic context in mind map', status: 'completed', detail: { type: 'content', content: 'Found "AI-powered topic suggestions" under Q2 branch, with 0 existing sub-topics. Parent context: AI Features group.' } },
      { id: 's6', iconType: 'advanced', icon: EditIcon, label: 'Expanding branch with technical details', status: 'completed', detail: { type: 'code', blocks: [{ lang: 'architecture', code: 'AI Topic Suggestions\n├── NLP Pipeline (spaCy + transformers)\n├── Embedding Service (sentence-transformers)\n├── Vector Store (pgvector)\n└── Suggestion API (FastAPI)' }] } },
      { id: 's7', iconType: 'basic', label: '', status: 'done' },
    ],
    markdownContent: `## AI-Powered Topic Suggestions — Technical Breakdown

Here's the expanded branch with architecture and effort estimates:

### 1. NLP Pipeline — *2 weeks*
- Tokenization and entity extraction using spaCy
- Topic classification model (fine-tuned BERT)
- Context window: analyzes parent + sibling topics for relevance

### 2. Embedding Service — *1 week*
- Sentence-transformers for semantic similarity
- Pre-compute embeddings for existing topics on map change
- Cosine similarity threshold: 0.75 for suggestions

### 3. Vector Store — *1 week*
- PostgreSQL with pgvector extension
- Index type: IVFFlat for fast approximate search
- Auto-cleanup of stale embeddings on topic deletion

### 4. Suggestion API — *1 week*
- FastAPI endpoint: \`POST /api/suggestions\`
- Input: current topic text + map context
- Output: ranked list of 5 suggestions with confidence scores
- Latency target: < 200ms p95

**Total estimated effort: 5 weeks**

The branch has been updated in your mind map with all sub-topics and effort labels.`,
    reasoning: {
      type: 'steps',
      steps: [
        { id: 'r1', iconType: 'advanced', icon: SearchIcon, label: 'Evaluated 3 NLP frameworks', status: 'completed', detail: { type: 'content', content: 'Compared spaCy, Hugging Face transformers, and OpenAI API. Selected spaCy + transformers for best balance of speed and accuracy in topic extraction.' } },
        { id: 'r2', iconType: 'advanced', icon: GlobalIcon, label: 'Researched vector database options', status: 'completed', detail: { type: 'content', content: 'Considered Pinecone, Weaviate, and pgvector. Chose pgvector for seamless PostgreSQL integration — no additional infrastructure needed.' } },
        { id: 'r3', iconType: 'advanced', icon: EditIcon, label: 'Estimated effort based on team velocity', status: 'completed', detail: { type: 'content', content: 'Based on team of 2 senior engineers, average velocity 8 story points/sprint. Total: 5 weeks across 4 workstreams.' } },
        { id: 'r4', iconType: 'basic', label: '', status: 'done' },
      ],
    },
  },
])

// ─── Streaming Simulation ─────────────────────────────────
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const simulatedResponses = [
  {
    steps: [
      { id: 'sim1', iconType: 'advanced' as const, icon: SearchIcon, label: 'Analyzing mind map structure', status: 'completed' as const, detail: { type: 'content' as const, content: 'Scanned 5 branches, 12 groups, 47 topics. Detected imbalance in Q2 branch depth.' } },
      { id: 'sim2', iconType: 'advanced' as const, icon: EditIcon, label: 'Generating suggestions', status: 'completed' as const, detail: { type: 'content' as const, content: 'Generated 3 structural improvements and 3 new topic suggestions.' } },
      { id: 'sim3', iconType: 'basic' as const, label: '', status: 'done' as const },
    ],
    content: `## Mind Map Enhancement Suggestions

Based on your current mind map structure, here are some improvements:

### Balance
- The "Q2 — AI Features" branch has significantly more depth than others. Consider splitting it into "AI Core" and "AI Integrations" for better visual balance.

### Missing Connections
- "Real-time collaboration" in Q2 and "Offline mode with sync" in Q3 share conflict resolution logic — consider adding a cross-link.

### Suggested New Topics
1. **Data Migration Strategy** — needed before Q1 database work
2. **Load Testing Plan** — should parallel Q4 performance work
3. **Design System** — supports both web and mobile consistency

Would you like me to apply any of these changes to the mind map?`,
  },
  {
    steps: [
      { id: 'sim4', iconType: 'advanced' as const, icon: SearchIcon, label: 'Reading topic content', status: 'completed' as const, detail: { type: 'content' as const, content: 'Read all 47 leaf topics and their parent relationships.' } },
      { id: 'sim5', iconType: 'advanced' as const, icon: GlobalIcon, label: 'Researching best practices', status: 'completed' as const, detail: { type: 'content' as const, content: 'Reviewed mind map organization patterns: MECE principle, dependency mapping, priority tagging.' } },
      { id: 'sim6', iconType: 'advanced' as const, icon: EditIcon, label: 'Updating mind map', status: 'completed' as const, detail: { type: 'content' as const, content: 'Added 1 new branch (Platform), moved 3 shared topics, added priority labels to all 47 features.' } },
      { id: 'sim7', iconType: 'basic' as const, label: '', status: 'done' as const },
    ],
    content: `## Topic Reorganization Complete

I've restructured the selected branches. Here's what changed:

### Before
- Topics were organized by timeline only
- Feature dependencies were not visible
- Priority levels were missing

### After
- Added **dependency arrows** between related features
- Each topic now has a priority tag: \`P0\` \`P1\` \`P2\`
- Grouped cross-cutting concerns (auth, monitoring, testing) into a shared "Platform" branch

### New Structure
\`\`\`
Product Roadmap 2026
├── Platform (shared)
│   ├── Authentication & SSO
│   ├── Monitoring & Alerting
│   └── Testing Framework
├── Q1 — Foundation
├── Q2 — AI Features
├── Q3 — Expansion
└── Q4 — Scale & Polish
\`\`\`

The mind map now has **5 main branches** instead of 4, with clearer separation of concerns.`,
  },
]

let responseIndex = 0

const handleCopyMessage = (msg: DemoMessage) => {
  const text = msg.markdownContent || msg.content
  if (text) {
    navigator.clipboard?.writeText(text)
  }
}

const handleFeedback = (msg: DemoMessage, value: 'good' | 'bad' | null) => {
  // Future: send feedback data to analytics
  console.log(`Feedback for message ${msg.id}:`, value)
}

// ─── Send Message ─────────────────────────────────────────
const sendMessage = async () => {
  const text = inputText.value.trim()
  if ((!text && !pendingAttachments.value.length) || isStreaming.value) return

  const msg: DemoMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: text,
  }

  if (pendingAttachments.value.length) {
    msg.attachments = pendingAttachments.value.map(a => ({
      type: a.type,
      title: a.title,
      subtitle: a.subtitle,
      fileType: a.fileType,
      thumbnailUrl: a.thumbnailUrl,
    }))
  }

  messages.value.push(msg)
  inputText.value = ''
  pendingAttachments.value = []
  abortController = new AbortController()
  isStreaming.value = true
  streamingContent.value = ''
  streamingReasoning.value = ''
  streamingInThink.value = false
  rawStreamBuffer.value = ''
  streamingSteps.value = []

  await nextTick()

  if (selectedModel.value === 'simulate') {
    await sendSimulated()
  } else {
    await sendToApi(selectedModel.value)
  }
}

const sendSimulated = async () => {
  const response = simulatedResponses[responseIndex % simulatedResponses.length]
  responseIndex++

  for (const step of response.steps) {
    if (!isStreaming.value) return
    streamingSteps.value = [
      ...streamingSteps.value,
      { ...step, status: 'processing' as const },
    ]
    await delay(600)
    if (!isStreaming.value) return
    streamingSteps.value = streamingSteps.value.map((s, i) =>
      i === streamingSteps.value.length - 1 ? { ...s, status: step.status } : s,
    )
    await delay(200)
  }

  const fullContent = response.content
  for (let i = 0; i < fullContent.length; i += 3) {
    if (!isStreaming.value) return
    streamingContent.value = fullContent.slice(0, i + 3)
    await delay(10)
  }
  if (!isStreaming.value) return
  streamingContent.value = fullContent

  finishStreaming()
}

// 累积原始流文本，用于检测 <think> 标签边界
const rawStreamBuffer = ref('')

const appendStreamingText = (text: string) => {
  rawStreamBuffer.value += text

  // 检测 <think> 开始
  if (!streamingInThink.value && !streamingReasoning.value) {
    const thinkStart = rawStreamBuffer.value.indexOf('<think>')
    if (thinkStart !== -1) {
      streamingInThink.value = true
      // <think> 之前的内容放入 content
      const before = rawStreamBuffer.value.slice(0, thinkStart)
      if (before.trim()) streamingContent.value = before
      // <think> 之后的内容放入 reasoning
      const afterTag = rawStreamBuffer.value.slice(thinkStart + 7)
      const endIdx = afterTag.indexOf('</think>')
      if (endIdx !== -1) {
        streamingReasoning.value = afterTag.slice(0, endIdx)
        streamingInThink.value = false
        streamingContent.value += afterTag.slice(endIdx + 8)
      } else {
        streamingReasoning.value = afterTag
      }
      return
    }
  }

  // 正在 <think> 内部
  if (streamingInThink.value) {
    const endIdx = rawStreamBuffer.value.indexOf('</think>')
    if (endIdx !== -1) {
      // think 结束
      const thinkStart = rawStreamBuffer.value.indexOf('<think>')
      streamingReasoning.value = rawStreamBuffer.value.slice(thinkStart + 7, endIdx)
      streamingInThink.value = false
      const afterThink = rawStreamBuffer.value.slice(endIdx + 8)
      streamingContent.value = afterThink
    } else {
      // 还在 think 中，更新 reasoning 内容
      const thinkStart = rawStreamBuffer.value.indexOf('<think>')
      streamingReasoning.value = rawStreamBuffer.value.slice(thinkStart + 7)
    }
    return
  }

  // think 已结束或无 think，后续都是正常内容
  if (streamingReasoning.value) {
    const endIdx = rawStreamBuffer.value.indexOf('</think>')
    streamingContent.value = rawStreamBuffer.value.slice(endIdx + 8)
  } else {
    streamingContent.value = rawStreamBuffer.value
  }
}

const formatApiError = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'The request was invalid. Please try rephrasing your message.',
    401: 'Authentication failed. Please check your API key configuration.',
    403: 'Access denied. Your API key may not have permission for this model.',
    404: 'The model endpoint was not found. Please try a different model.',
    429: 'Rate limit reached. Please wait a moment and try again.',
    500: 'The server encountered an internal error. Please try again later.',
    502: 'The server is temporarily unavailable. Please try again later.',
    503: 'The service is currently overloaded. Please try again later.',
  }
  return messages[status] || `Something went wrong (${status}). Please try again.`
}

const sendToApi = async (model: string) => {
  // Build conversation history for context
  const chatHistory = messages.value
    .filter(m => m.content || m.markdownContent)
    .map(m => ({
      role: m.role,
      content: m.markdownContent || m.content,
    }))

  try {
    const response = await fetch(`/api/chat-${model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
      signal: abortController?.signal,
    })

    if (!response.ok) {
      streamingContent.value = formatApiError(response.status)
      finishStreaming()
      return
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              appendStreamingText(parsed.text)
            }
          } catch {
            // skip
          }
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return
    streamingContent.value = 'Unable to connect to the server. Please check your network and try again.'
    finishStreaming()
    return
  }

  finishStreaming()
}

const stopStreaming = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  finishStreaming()
}

const finishStreaming = () => {
  const msg: DemoMessage = {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: '',
    steps: streamingSteps.value.length ? [...streamingSteps.value] : undefined,
    markdownContent: streamingContent.value,
  }

  if (streamingReasoning.value) {
    msg.reasoning = { type: 'text', content: streamingReasoning.value }
  }

  messages.value.push(msg)

  isStreaming.value = false
  streamingContent.value = ''
  streamingReasoning.value = ''
  streamingInThink.value = false
  rawStreamBuffer.value = ''
  streamingSteps.value = []
}

// ─── Example Data ─────────────────────────────────────────
const exampleSteps: ChainOfThoughtStep[] = [
  { id: 'e1', iconType: 'advanced', icon: SearchIcon, label: 'Analyzing mind map structure', status: 'completed', detail: { type: 'content', content: 'Found 4 main branches with 12 sub-topics. "Marketing Strategy" has the most depth (8 leaves).' } },
  { id: 'e2', iconType: 'advanced', icon: EditIcon, label: 'Reorganizing branches', status: 'completed', detail: { type: 'content', content: 'Regrouped by channel: Social, Content, Paid, Events. Added timeline markers to each sub-topic.' } },
  { id: 'e3', iconType: 'basic', label: '', status: 'done' },
]

const exampleMarkdown = `## Mind Map Structure

Here's the recommended structure for your project:

### Main Branches
1. **Research** — Literature review, competitive analysis
2. **Design** — Wireframes, prototypes, user testing
3. **Development** — Frontend, backend, infrastructure
4. **Launch** — Marketing, documentation, support

Each branch can be expanded with \`Cmd+Enter\` to add sub-topics.`

const exampleReasoning: ReasoningContent = {
  type: 'steps',
  steps: [
    { id: 'er1', iconType: 'advanced', icon: SearchIcon, label: 'Analyzed current branch structure', status: 'completed', detail: { type: 'content', content: 'Found 3 main branches with uneven depth. Frontend branch has 8 leaves while Backend has only 2.' } },
    { id: 'er2', iconType: 'advanced', icon: EditIcon, label: 'Balanced the hierarchy', status: 'completed', detail: { type: 'content', content: 'Moved shared concerns (auth, API gateway) to a "Platform" parent. Split Backend into "Services" and "Infrastructure".' } },
    { id: 'er3', iconType: 'basic', label: '', status: 'done' },
  ],
}

// ─── Code Examples ────────────────────────────────────────
const defaultUsage = `<ChatContainer ref="chatRef" style="height: 500px;">
  <UserMessage>
    <template #attachments>
      <Attachment type="file" title="Roadmap.pdf" subtitle="PDF" file-type="pdf" />
    <\/template>
    Turn this document into a mind map.
  </UserMessage>

  <AiMessage>
    <AiChainOfThought :steps="steps" />
    <AiMarkdown :content="markdownContent" />

    <template #actions>
      <MessageActions @copy="handleCopy" @feedback="handleFeedback" />
    <\/template>
  </AiMessage>
</ChatContainer>`

const componentSource = `<template>
  <div
    ref="containerRef"
    class="chat-container"
    @scroll="handleScroll"
  >
    <div class="chat-container__content">
      <slot />
    </div>
    <div ref="anchorRef" class="chat-container__anchor" />
  </div>
<\/template>

<script setup>
// Auto-scroll: MutationObserver + ResizeObserver
// Tracks stickToBottom state based on scroll position
// Exposes scrollToBottom() and isAtBottom
<\/script>`

const userAttachmentsUsage = `<UserMessage>
  <template #attachments>
    <Attachment type="file" title="Sprint_Planning.pdf" subtitle="PDF" file-type="pdf" />
    <Attachment type="preview" thumbnail-url="/path/to/screenshot.png" />
  <\/template>
  Please analyze this sprint planning document and create a mind map.
</UserMessage>`

const aiCotUsage = `<AiMessage>
  <AiChainOfThought :steps="[
    { iconType: 'advanced', icon: SearchIcon, label: 'Analyzing mind map', status: 'completed' },
    { iconType: 'advanced', icon: EditIcon, label: 'Reorganizing branches', status: 'completed' },
    { iconType: 'basic', label: '', status: 'done' },
  ]" />
  <p>I've reorganized the branches of your mind map.</p>

  <template #actions>
    <MessageActions @copy="handleCopy" @feedback="handleFeedback" />
  <\/template>
</AiMessage>`

const aiMarkdownUsage = `<AiMessage>
  <AiMarkdown :content="markdownContent" />

  <template #actions>
    <MessageActions @copy="handleCopy" @feedback="handleFeedback" />
  <\/template>
</AiMessage>`

const aiReasoningUsage = `<AiMessage>
  <AiReasoning
    :reasoning="false"
    :content="{ type: 'steps', steps: reasoningSteps }"
    :default-expanded="false"
  />
  <p>I've restructured the "Technical Architecture" branch.</p>

  <template #actions>
    <MessageActions @copy="handleCopy" @feedback="handleFeedback" />
  <\/template>
</AiMessage>`

const userReferencesUsage = `<UserMessage>
  <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
    <AiReference :closable="false">
      <template #icon>
        <span v-html="TopicLinkIcon" />
      <\/template>
      Marketing Strategy
    </AiReference>
    <AiReference :closable="false">
      <template #icon>
        <span v-html="TopicLinkIcon" />
      <\/template>
      Q2 Launch Plan
    </AiReference>
  </div>
  Can you merge these two topics?
</UserMessage>`
</script>

<style scoped>
/* ─── Disable hover on sent message attachments ───────── */
:deep(.user-message .attachment--template:hover),
:deep(.user-message .attachment--file:hover) {
  background: var(--color-mask-overlays);
}

:deep(.user-message .attachment--preview:hover::after) {
  opacity: 0;
}

/* ─── Override ChatContainer internal padding ─────────── */
:deep(.chat-container__content) {
  padding: var(--spacing-margin-margin-xxxl-48);
  padding-bottom: 240px; /* 留出底部空间给悬浮的 input 卡片 + mask */
}

/* ─── Bottom fade mask ────────────────────────────────── */
.chat-input-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(180deg, rgba(250, 251, 252, 0.00) 0%, var(--color-fill-container, #EDF0F2) 20%);
  pointer-events: none;
  z-index: 9;
}

/* ─── Chat Input (PromptInput) — 绝对定位叠在底部 ──── */
.chat-input {
  position: absolute;
  bottom: var(--spacing-padding-xxl-24);
  left: var(--spacing-padding-xxl-24);
  right: var(--spacing-padding-xxl-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-padding-l-16);
  padding: var(--spacing-padding-l-16);
  border: 1px solid var(--color-border-translucent);
  border-radius: var(--radius-xl-24);
  background-color: var(--color-fill-surface-desktop);
  backdrop-filter: blur(6px);
  box-shadow: var(--elevation-l2);
  z-index: 10;
}

/* Pending Attachments */
.chat-input__attachments {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-padding-s-8);
}

.chat-input__attachments :deep(.attachment--file) {
  height: 64px;
  box-sizing: border-box;
}

/* Textarea wrap */
.chat-input__textarea-wrap {
  position: relative;
  width: 100%;
}

.chat-input__textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.56px;
  color: var(--color-text-primary);
  font-family: inherit;
  padding: 0 var(--spacing-padding-xs-4);
}

/* Animated placeholder overlay */
.chat-input__placeholder {
  position: absolute;
  top: 0;
  left: var(--spacing-padding-xs-4);
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.56px;
  font-family: inherit;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    var(--color-text-quaternary) 25%,
    var(--color-text-secondary) 50%,
    var(--color-text-quaternary) 75%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: placeholder-shimmer 2.5s linear infinite;
}

@keyframes placeholder-shimmer {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

/* Bottom Toolbar */
.chat-input__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-input__toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-padding-s-8);
}

/* Model Select wrapper (icon + select) */
.chat-input__model-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 var(--spacing-padding-xs-4);
  border-radius: var(--radius-s-8);
  cursor: pointer;
  height: 32px;
}

.chat-input__model-wrap:hover {
  background-color: var(--color-mask-overlays);
}

.chat-input__model-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-icon-secondary);
}

.chat-input__model-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.chat-input__model-sizer {
  position: relative;
  display: inline-flex;
}

.chat-input__model-mirror {
  visibility: hidden;
  white-space: nowrap;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.56px;
  font-family: inherit;
}

.chat-input__model {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 0.56px;
  color: var(--color-text-secondary);
  background: transparent;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}


</style>
