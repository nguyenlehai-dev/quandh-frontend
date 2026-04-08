<script setup>
const { t } = useI18n()
const route = useRoute()

const pageTitle = computed(() => route.meta.title ?? t('meeting.placeholder.title'))
const pageDescription = computed(() => route.meta.description ?? t('meeting.placeholder.description'))
const pageIcon = computed(() => route.meta.icon ?? 'tabler-calendar-event')
</script>

<template>
  <section>
    <VCard>
      <VCardText class="d-flex flex-column gap-5">
        <div class="d-flex flex-wrap align-center justify-space-between gap-4">
          <div class="d-flex align-center gap-3">
            <VAvatar
              color="primary"
              variant="tonal"
              rounded
              size="48"
            >
              <VIcon
                :icon="pageIcon"
                size="28"
              />
            </VAvatar>

            <div>
              <h4 class="text-h4 mb-1">
                {{ pageTitle }}
              </h4>
              <p class="text-body-1 mb-0">
                {{ pageDescription }}
              </p>
            </div>
          </div>

          <VBtn
            :to="{ name: 'apps-meetings' }"
            prepend-icon="tabler-list-details"
          >
            {{ t('meeting.placeholder.openMeetingList') }}
          </VBtn>
        </div>

        <VAlert
          color="info"
          variant="tonal"
          border="start"
        >
          {{ t('meeting.placeholder.seedHint') }}
        </VAlert>
      </VCardText>
    </VCard>
  </section>
</template>
