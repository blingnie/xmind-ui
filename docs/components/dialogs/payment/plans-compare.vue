<template>
  <div class="plans-compare">
    <table
      class="sticky z-10 w-full border-collapse border border-transparent-dark-3 dark:border-transparent-dark-3"
      :class="{ 'top-[63px]': windowWidth > 795, 'top-[56px]': windowWidth <= 795 }"
    >
      <tr>
        <template v-for="(header, headerIndex) in plansHeaderTable" :key="headerIndex">
          <th
            v-if="header.isEmpty"
            class="border border-transparent-dark-3 bg-white px-[12px] py-[24px] dark:border-transparent-white-3 dark:bg-[#1D123C] sm:px-[16px]"
            :class="plansHeaderTableWidthClass"
          ></th>
          <th
            v-else
            class="border border-transparent-dark-3 bg-white px-[12px] py-[24px] text-[20px] font-[700] leading-[30px] dark:border-transparent-white-3 dark:bg-[#1D123C] sm:px-[16px]"
            :class="plansHeaderTableWidthClass"
          >
            <div class="flex flex-col items-center justify-center gap-[16px] text-grey-9">
              <span v-if="windowWidth > 1024 || plansHeaderDropdownOptions === null">{{ $T(header.text) }}</span>
              <drop-menu
                v-else
                :selected="header.id"
                :options="plansHeaderDropdownOptions"
                @select="handleSelectDropMenu(header.id, headerIndex, $event)"
              ></drop-menu>
              <button
                class="tw-button-large w-full text-[16px]"
                :class="{
                  'tw-button-primary': header.buttonClass === 'primary',
                  'tw-button-landing-default': header.buttonClass === 'default',
                  'upgrade-gradient-button': header.buttonClass === 'gradient',
                }"
                @click="header.buttonAction"
              >
                <span>{{ $T(header.buttonText) }}</span>
              </button>
            </div>
          </th>
        </template>
      </tr>
    </table>
    <table class="border-collapse border-x border-b border-transparent-dark-3 dark:border-transparent-white-3">
      <tr v-for="(row, rowIndex) in plansTableRows" :key="rowIndex">
        <template v-for="(cell, cellIndex) in row" :key="cellIndex">
          <th
            v-if="cell.type === 'head' && cell.text"
            class="px-[12px] py-[24px] text-[20px] font-[700] leading-[30px] text-grey-9 sm:px-[16px]"
            :class="`${cell.textClass}`"
            :colspan="row.length"
          >
            {{ $T(cell.text) }}
          </th>
          <td
            v-else-if="cell.type !== 'head'"
            class="border border-transparent-dark-3 p-[12px] text-desktop-body-1 dark:border-transparent-white-3 sm:px-[16px]"
            :class="`${cell.textClass} ${plansTableRowsWidthClass}`"
          >
            {{ $T(cell.text) }}
            <img v-if="cell.tick" uk-svg class="cell-tick" :data-src="$toResourceURL('/assets/static/images/home/check_circle.svg')" />
          </td>
        </template>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, ref, watch } from 'vue'
import { useWindowResize } from 'client/composables/window-resize'
import DropMenu from 'client/components/dialogs/payment/plans-drop-menu.vue'
import { PlanId } from 'client/library/payment/plans-card-data'
import { personalPlansTableData, teamPlansTableData } from 'client/library/payment/plans-table-data'
import { $T } from 'client/library/translation'

type TableCell = {
  text: string
  type?: string
  tick?: boolean
  textClass?: string
}

type TableHeader = {
  isEmpty: boolean
  id: PlanId
  text: string
  buttonText: string
  buttonClass: 'default' | 'primary' | 'gradient'
  buttonAction: () => void
}

type TableColumn = {
  id: string
  cells: TableCell[]
}

const props = defineProps<{
  handleClickStartNow: () => void
  handleClickUpgrade: () => void
  handleClickEssentialUpgrade: () => void
  handleClickBusinessUpgrade: () => void
  handleClickEnterpriseContactSales: () => void
  selectedPlanTab: 'personal' | 'team'
  showTryItFree: boolean
}>()

const upgradeButtonLabel = computed(() => (props.showTryItFree ? 'Try It Free' : 'Upgrade'))

const personalPlansTableHeaderData: ComputedRef<Partial<TableHeader>[]> = computed(() => [
  { isEmpty: true },
  { id: 'free', text: 'Free', buttonText: 'Start Now', buttonClass: 'default', buttonAction: props.handleClickStartNow },
  {
    id: 'premium',
    text: 'Premium',
    buttonText: upgradeButtonLabel.value,
    buttonClass: 'gradient',
    buttonAction: props.handleClickUpgrade,
  },
])

const teamPlansTableHeaderData: ComputedRef<Partial<TableHeader>[]> = computed(() => [
  { isEmpty: true },
  { id: 'free', text: 'Free', buttonText: 'Start Now', buttonClass: 'default', buttonAction: props.handleClickStartNow },
  {
    id: 'business',
    text: 'Business',
    buttonText: upgradeButtonLabel.value,
    buttonClass: 'gradient',
    buttonAction: props.handleClickBusinessUpgrade,
  },
  /* { id: 'essential', text: 'Essential', buttonText: 'Upgrade', buttonClass: 'primary', buttonAction: props.handleClickEssentialUpgrade }, */
  {
    id: 'enterprise',
    text: 'Enterprise',
    buttonText: 'Contact Sales',
    buttonClass: 'default',
    buttonAction: props.handleClickEnterpriseContactSales,
  },
])

const teamPlansHeaderDropdownOptionsData = {
  free: 'Free',
  // essential: 'Essential',
  business: 'Business',
  enterprise: 'Enterprise',
}

const transposeColumnData = (columns: TableColumn[]) => {
  const rows: TableCell[][] = []
  const rowCount = columns[0].cells.length

  for (let i = 0; i < rowCount; i++) {
    const row = columns.map(column => column.cells[i])
    rows.push(row)
  }

  return rows
}

const { windowWidth } = useWindowResize()

const totalPlansTableData = ref<TableColumn[]>(personalPlansTableData)
const totalPlansHeaderTable = ref<Partial<TableHeader>[]>(personalPlansTableHeaderData.value)
const plansHeaderDropdownOptions = ref<Record<string, string>>(null)

const plansTableData = ref<TableColumn[]>(personalPlansTableData)
const plansHeaderTable = ref<Partial<TableHeader>[]>(personalPlansTableHeaderData.value)
const plansHeaderTableWidthClass = ref('w-1/5')
const plansTableRowsWidthClass = ref('w-1/5')

const plansTableRows = computed<TableCell[][]>(() => transposeColumnData(plansTableData.value))

watch(
  () => [props.selectedPlanTab, props.showTryItFree],
  ([selectedPlanTab, _]) => {
    if (selectedPlanTab === 'personal') {
      totalPlansTableData.value = personalPlansTableData
      totalPlansHeaderTable.value = personalPlansTableHeaderData.value
      plansHeaderDropdownOptions.value = null
    } else {
      totalPlansTableData.value = teamPlansTableData
      totalPlansHeaderTable.value = teamPlansTableHeaderData.value
      plansHeaderDropdownOptions.value = teamPlansHeaderDropdownOptionsData
    }
  },
)

const handleSelectDropMenu = (selectedPlan: PlanId, selectedIndex: number, targetPlan: PlanId) => {
  if (selectedPlan === targetPlan) return

  const targetHeader = totalPlansHeaderTable.value.find(header => header.id === targetPlan)
  const targetColumn = totalPlansTableData.value.find(plan => plan.id === targetPlan)
  if (!targetHeader || !targetColumn) return

  plansHeaderTable.value[selectedIndex] = targetHeader
  plansTableData.value[windowWidth.value <= 768 ? selectedIndex + 1 : selectedIndex] = targetColumn
}

const computeWidthLevel = (width: number): number => {
  const arr = [0, 600, 768, 1024, Infinity]
  for (let i = 0; i < arr.length - 1; i++) {
    if (width > arr[i] && width <= arr[i + 1]) {
      return i
    }
  }
  return -1
}

watch(
  () => {
    return {
      totalPlansTableData: totalPlansTableData.value,
      windowWidth: windowWidth.value,
      showTryItFree: props.showTryItFree,
    }
  },
  ({ windowWidth: width, totalPlansTableData, showTryItFree }, oldValue) => {
    const hasPlansDataChanges = totalPlansTableData.length !== oldValue?.totalPlansTableData.length
    const hasWidthLevelChanges = computeWidthLevel(width) !== computeWidthLevel(oldValue?.windowWidth)
    const hasShowTryItFreeChanges = showTryItFree !== oldValue?.showTryItFree
    const hasChanges = hasPlansDataChanges || hasWidthLevelChanges || hasShowTryItFreeChanges

    if (hasChanges) {
      if (width <= 600) {
        plansTableData.value = totalPlansTableData.slice(0, 3)
        plansHeaderTable.value = totalPlansHeaderTable.value.slice(1, 3)
        plansHeaderTableWidthClass.value = 'w-1/2'
        plansTableRowsWidthClass.value = 'w-1/3'
      } else if (width > 600 && width <= 768) {
        plansTableData.value = totalPlansTableData.slice(0, 4)
        plansHeaderTable.value = totalPlansHeaderTable.value.slice(1, 4)
        plansHeaderTableWidthClass.value = 'w-1/3'
        plansTableRowsWidthClass.value = 'w-1/4'
      } else if (width > 768 && width <= 1024) {
        plansTableData.value = totalPlansTableData.slice(0, 4)
        plansHeaderTable.value = totalPlansHeaderTable.value.slice(0, 4)
        plansHeaderTableWidthClass.value = 'w-1/4'
        plansTableRowsWidthClass.value = 'w-1/4'
      } else if (width > 1024) {
        plansTableData.value = totalPlansTableData
        plansHeaderTable.value = totalPlansHeaderTable.value
        plansHeaderTableWidthClass.value = 'w-1/5'
        plansTableRowsWidthClass.value = 'w-1/5'
      }
    }
  },
  {
    immediate: true,
  },
)
</script>

<script lang="ts">
export default {
  name: 'PlansCompare',
}
</script>

<style lang="less" scoped>
@import '../../../styles/new-ui/new-variables.less';

[color-scheme='light'] .plans-compare {
  --dimmed-color: @transparent-dark-7;
  --highlight-color: @brand-5;
}

[color-scheme='dark'] .plans-compare {
  --dimmed-color: @transparent-white-7;
  --highlight-color: @brand-4;
}

.plans-compare {
  * {
    font-family: NeverMind;
  }

  td.dimmed {
    color: var(--dimmed-color);
  }

  td.highlight {
    color: var(--highlight-color);
    font-weight: 600;
  }

  th.left,
  td.left {
    text-align: left;
    text-align: -webkit-left;
    text-align: -moz-left;
  }

  th.center,
  td.center {
    text-align: center;
    text-align: -webkit-center;
    text-align: -moz-center;
  }
}

.upgrade-gradient-button {
  background-image: linear-gradient(133deg, #9c4fff -8.87%, #4b3edf 108.18%);
  color: @light-grey-1;
  cursor: pointer !important;
  position: relative;

  &.animate {
    background-size: 600%;
    animation: anime 8s linear infinite;
  }

  &[disabled] {
    opacity: 0.3;
    cursor: default !important;
  }

  &:hover {
    animation-play-state: paused;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover:not([disabled])::after {
    opacity: 1;
  }
}
</style>
