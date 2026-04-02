import { usePaymentClient } from 'app/composables/payment-client'
import { useTeamSpaceData } from 'app/composables/team-space-data'
import { REGION } from 'client/constants'
import { $T } from 'client/library/translation'
import { useAccountStore, useServiceStore } from 'client/store'

export const handleGetAddonCn = async (teamId: string) => {
  const team = useTeamSpaceData().joinedTeamList.value.find(team => team.teamId === teamId)
  await useServiceStore().services.action.dialog.openAiAddonPaymentDialog({ team })
}

export const handleGetExtraCreditsOverseas = async (teamId: string) => {
  const paymentClient = usePaymentClient()
  const orderHash = await paymentClient.createOrder({
    version: 'addon',
    invoiceEmail: useAccountStore().profile.primary_email,
    teamId,
  })
  if (!orderHash) {
    return
  }

  await useServiceStore().services.action.dialog.openPaymentDialog({ orderHash, orderVersion: 'addon', teamId })
}

export async function handleTeamIsOutOfCredits(args: { teamId: string }) {
  const { teamId } = args

  if (useTeamSpaceData().checkIsAllowPurchaseAICredits(teamId)) {
    const isMyWorksTeam = useTeamSpaceData().defaultTeamId.value === teamId
    if (isMyWorksTeam || useTeamSpaceData().hasTeamManagementPermission(teamId)) {
      if (REGION === 'cn') {
        await useServiceStore().services.action.dialog.confirm({
          title: '获取额外 AI 次数',
          description: '你的 AI 次数已用尽。获取额外 AI 次数以继续使用 AI 功能并提升你的工作效率。',
          hiddenCancel: true,
          confirmButtonText: $T('Get Now'),
          confirmButtonType: 'default',
          onConfirm: async () => {
            await handleGetAddonCn(teamId)
            return true
          },
        })
      } else {
        await useServiceStore().services.action.dialog.confirm({
          title: $T('Get Extra Credits'),
          description: $T('Your credits have been exhausted. Get extra credits to keep using the Copilot feature and enhance your productivity.'),
          hiddenCancel: true,
          confirmButtonText: $T('Get Now'),
          confirmButtonType: 'default',
          onConfirm: async () => {
            await handleGetExtraCreditsOverseas(teamId)
            return true
          },
        })
      }
    } else {
      await useServiceStore().services.action.dialog.confirm({
        title: $T('Get Extra Credits'),
        description: $T(
          'Your credits have been exhausted. Please reach out to your team owner to get extra credits and continue using the Copilot feature.',
        ),
        hiddenCancel: true,
        confirmButtonText: $T('OK'),
        confirmButtonType: 'default',
      })
    }
  } else {
    if (useTeamSpaceData().hasTeamManagementPermission(teamId)) {
      await useServiceStore().services.action.dialog.openActivateDialog({ teamId })
    } else {
      await useServiceStore().services.action.dialog.confirm({
        title: $T('Upgrade to Unlock Copilot'),
        description: $T(
          'The Copilot feature is available for Business or higher Plan users. Please reach out to your team owner to upgrade and enjoy AI-powered assistance in your maps.',
        ),
        hiddenCancel: true,
        confirmButtonText: $T('OK'),
        confirmButtonType: 'default',
      })
    }
  }
}

export async function checkTeamCreditsBeforeCopilot(args: { teamId: string }): Promise<boolean> {
  const { teamId } = args

  if (!(await useTeamSpaceData().getTeamIsOutOfCreditsAsync(teamId))) {
    return true
  }

  // Force update profile, then check again
  await useTeamSpaceData().refreshTeamProfileByIdImmediately(teamId)

  if (!(await useTeamSpaceData().getTeamIsOutOfCreditsAsync(teamId))) {
    return true
  }
  return false
}

export async function jumptoAiAddonPaymentPage(teamId: string) {
  await Promise.all([useTeamSpaceData().waitUntilTeamDataLoaded(), useAccountStore().requestAccountProfile({ isForce: true })])

  if (useTeamSpaceData().checkIsAllowPurchaseAICredits(teamId)) {
    const isMyWorksTeam = useTeamSpaceData().defaultTeamId.value === teamId

    if (isMyWorksTeam || useTeamSpaceData().hasTeamManagementPermission(teamId)) {
      if (REGION === 'cn') {
        await handleGetAddonCn(teamId)
      } else {
        await handleGetExtraCreditsOverseas(teamId)
      }
    } else {
      await useServiceStore().services.action.dialog.confirm({
        title: $T('Get Extra Credits'),
        description: $T(
          'Your credits have been exhausted. Please reach out to your team owner to get extra credits and continue using the Copilot feature.',
        ),
        hiddenCancel: true,
        confirmButtonText: $T('OK'),
        confirmButtonType: 'default',
      })
    }
  } else {
    if (useTeamSpaceData().hasTeamManagementPermission(teamId)) {
      await useServiceStore().services.action.dialog.openActivateDialog({ teamId })
    } else {
      await useServiceStore().services.action.dialog.confirm({
        title: $T('Upgrade to Unlock Copilot'),
        description: $T(
          'The Copilot feature is available for Business or higher Plan users. Please reach out to your team owner to upgrade and enjoy AI-powered assistance in your maps.',
        ),
        hiddenCancel: true,
        confirmButtonText: $T('OK'),
        confirmButtonType: 'default',
      })
    }
  }
}
