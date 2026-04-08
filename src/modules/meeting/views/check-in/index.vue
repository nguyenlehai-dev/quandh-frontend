<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getStoredUserData, isStoredLoggedIn } from '@/modules/auth/services/authStorage'
import { checkInMeetingByQr, getMeeting } from '@/modules/meeting/services/meetingApi'
import { mapMeetingToViewModel } from '@/modules/meeting/utils/meetingAdapters'
import { getCoreErrorMessage } from '@/modules/core/utils/coreErrors'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { hydratePendingSnackbar, isSnackbarVisible, snackbarColor, snackbarText, showSnackbar } = useOperationSnackbar()

const isLoading = ref(false)
const isSubmitting = ref(false)
const meeting = ref(null)
const currentUser = ref(getStoredUserData())
const isCheckedIn = ref(false)

const meetingId = computed(() => route.query.meeting_id ? String(route.query.meeting_id) : '')
const qrToken = computed(() => route.query.qr_token ? String(route.query.qr_token) : '')

const meetingTimeRange = computed(() => {
  if (!meeting.value)
    return t('meeting.common.na')

  return `${meeting.value.startAt || 'N/A'} -> ${meeting.value.endAt || 'N/A'}`
})

const currentUserLabel = computed(() => {
  if (!currentUser.value)
    return t('meeting.checkIn.unknownUser')

  return currentUser.value.fullName || currentUser.value.name || currentUser.value.username || currentUser.value.email || t('meeting.checkIn.currentUser')
})

const ensureAuthenticated = async () => {
  if (isStoredLoggedIn())
    return true

  await router.replace({
    name: 'login',
    query: {
      to: route.fullPath,
    },
  })

  return false
}

const loadMeeting = async () => {
  if (!meetingId.value || !qrToken.value) {
    showSnackbar(t('meeting.checkIn.invalidQr'), 'error')

    return
  }

  isLoading.value = true

  try {
    const response = await getMeeting(meetingId.value)

    meeting.value = mapMeetingToViewModel(response.data)
  }
  catch (error) {
    showSnackbar(getCoreErrorMessage(error, t('meeting.checkIn.loadMeetingError')), 'error')
  }
  finally {
    isLoading.value = false
  }
}

const handleJoinMeeting = async () => {
  if (!qrToken.value)
    return

  isSubmitting.value = true

  try {
    await checkInMeetingByQr({
      qr_token: qrToken.value,
      user_id: currentUser.value?.id ?? undefined,
    })
    isCheckedIn.value = true
    showSnackbar(t('meeting.checkIn.joinSuccess'))
  }
  catch (error) {
    showSnackbar(getCoreErrorMessage(error, t('meeting.checkIn.joinError')), 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

const handleCancel = async () => {
  if (window.history.length > 1) {
    router.back()

    return
  }

  await router.replace({ name: 'apps-meetings' })
}

onMounted(async () => {
  hydratePendingSnackbar()

  if (!await ensureAuthenticated())
    return

  currentUser.value = getStoredUserData()
  await loadMeeting()
})
</script>

<template>
  <section class="py-6">
    <VRow justify="center">
      <VCol
        cols="12"
        sm="10"
        md="7"
        lg="5"
      >
        <VCard>
          <VCardText class="pa-6">
            <div class="text-overline text-medium-emphasis mb-2">
              {{ t('meeting.checkIn.overline') }}
            </div>
            <h4 class="text-h4 mb-2">
              {{ meeting?.title || t('meeting.checkIn.titleFallback') }}
            </h4>
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ t('meeting.checkIn.subtitle') }}
            </p>

            <VProgressLinear
              v-if="isLoading"
              indeterminate
              color="primary"
              class="mb-6"
            />

            <VAlert
              v-if="isCheckedIn"
              color="success"
              variant="tonal"
              class="mb-6"
            >
              {{ t('meeting.checkIn.checkedInPrefix') }} <strong>{{ currentUserLabel }}</strong>.
            </VAlert>

            <VList
              lines="two"
              class="rounded border mb-6"
            >
              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-user" />
                </template>
                <VListItemTitle>{{ currentUserLabel }}</VListItemTitle>
                <VListItemSubtitle>{{ currentUser?.email || t('meeting.checkIn.noEmail') }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-calendar-event" />
                </template>
                <VListItemTitle>{{ meeting?.code || t('meeting.common.noMeetingCode') }}</VListItemTitle>
                <VListItemSubtitle>{{ meetingTimeRange }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-map-pin" />
                </template>
                <VListItemTitle>{{ meeting?.location || t('meeting.common.noLocation') }}</VListItemTitle>
                <VListItemSubtitle>{{ meeting?.meetingTypeName || t('meeting.common.meeting') }}</VListItemSubtitle>
              </VListItem>
            </VList>

            <VAlert
              color="info"
              variant="tonal"
              class="mb-6"
            >
              {{ t('meeting.checkIn.cancelHint') }}
            </VAlert>

            <div class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="handleCancel"
              >
                {{ t('meeting.common.cancel') }}
              </VBtn>

              <VBtn
                prepend-icon="tabler-check"
                :loading="isSubmitting"
                :disabled="!meeting || isCheckedIn"
                @click="handleJoinMeeting"
              >
                {{ t('meeting.checkIn.joinButton') }}
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VSnackbar
      v-model="isSnackbarVisible"
      location="top end"
      :color="snackbarColor"
      timeout="2400"
    >
      {{ snackbarText }}
    </VSnackbar>
  </section>
</template>
