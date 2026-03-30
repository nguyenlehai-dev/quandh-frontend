<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Auth',
  },
})

const router = useRouter()

// Redirect to My Meetings page (accessible by all authenticated users)
router.replace({ name: 'meetings-participant-my-meetings' })
</script>

<template>
  <div
    class="d-flex align-center justify-center"
    style="min-height: 80vh;"
  >
    <VProgressCircular
      indeterminate
      color="primary"
      size="48"
    />
  </div>
</template>
