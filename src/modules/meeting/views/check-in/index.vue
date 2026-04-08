<script setup>
import { useOperationSnackbar } from '@/composables/useOperationSnackbar'
import { getStoredUserData, isStoredLoggedIn } from '@/modules/auth/services/authStorage'
import { checkInMeetingByQr, getMeeting } from '@/modules/meeting/services/meetingApi'
import { mapMeetingToViewModel } from '@/modules/meeting/utils/meetingAdapters'
import { getCoreErrorMessage } from '@/modules/core/utils/coreErrors'

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
    return 'N/A'

  return `${meeting.value.startAt || 'N/A'} -> ${meeting.value.endAt || 'N/A'}`
})

const currentUserLabel = computed(() => {
  if (!currentUser.value)
    return 'Chưa xác định người dùng'

  return currentUser.value.fullName || currentUser.value.name || currentUser.value.username || currentUser.value.email || 'Người dùng hiện tại'
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
    showSnackbar('Mã QR không hợp lệ hoặc đã thiếu dữ liệu.', 'error')

    return
  }

  isLoading.value = true

  try {
    const response = await getMeeting(meetingId.value)

    meeting.value = mapMeetingToViewModel(response.data)
  }
  catch (error) {
    showSnackbar(getCoreErrorMessage(error, 'Không thể tải thông tin cuộc họp từ QR.'), 'error')
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
    showSnackbar('Đã ghi nhận tham gia cuộc họp thành công.')
  }
  catch (error) {
    showSnackbar(getCoreErrorMessage(error, 'Không thể xác nhận tham gia cuộc họp.'), 'error')
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
              Xác nhận tham gia
            </div>
            <h4 class="text-h4 mb-2">
              {{ meeting?.title || 'Cuộc họp từ mã QR' }}
            </h4>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Hệ thống đang nhận diện người tham gia từ tài khoản đang đăng nhập trên điện thoại.
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
              Đã xác nhận tham gia cho <strong>{{ currentUserLabel }}</strong>.
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
                <VListItemSubtitle>{{ currentUser?.email || 'Không có email' }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-calendar-event" />
                </template>
                <VListItemTitle>{{ meeting?.code || 'Chưa có mã cuộc họp' }}</VListItemTitle>
                <VListItemSubtitle>{{ meetingTimeRange }}</VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-map-pin" />
                </template>
                <VListItemTitle>{{ meeting?.location || 'Chưa có địa điểm' }}</VListItemTitle>
                <VListItemSubtitle>{{ meeting?.meetingTypeName || 'Cuộc họp' }}</VListItemSubtitle>
              </VListItem>
            </VList>

            <VAlert
              color="info"
              variant="tonal"
              class="mb-6"
            >
              Nếu đây không phải tên của bạn, bấm <strong>Hủy</strong> rồi dùng điện thoại đúng tài khoản để quét lại mã.
            </VAlert>

            <div class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="handleCancel"
              >
                Hủy
              </VBtn>

              <VBtn
                prepend-icon="tabler-check"
                :loading="isSubmitting"
                :disabled="!meeting || isCheckedIn"
                @click="handleJoinMeeting"
              >
                Tham gia
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
