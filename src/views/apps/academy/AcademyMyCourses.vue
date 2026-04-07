<script setup>
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})


// Data table options
const itemsPerPage = ref(6)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const hideCompleted = ref(true)
const label = ref('All Courses')

// Endpoint này là demo, trên Core backend không có. Dùng dữ liệu mẫu để tránh lỗi 404.
const coursesData = ref({
  courses: [],
  total: 0,
})

const courses = computed(() => {
  if (coursesData.value?.courses?.length)
    return coursesData.value.courses
    
  return [
    { id: 1, user: 'Lauretta Coie', completedTasks: 19, totalTasks: 25, userCount: 18, note: 20, view: 83, time: '17h 34m', logo: 'tabler-brand-angular', color: 'error', courseTitle: 'Basics of Angular', tags: 'Web', rating: 4.4, ratingCount: 8, desc: 'Introductory course for Angular and framework basics.', tutorImg: 'https://placehold.co/400x250?text=Angular' },
    { id: 2, user: 'Maybelle Zmitrovich', completedTasks: 48, totalTasks: 52, userCount: 14, note: 48, view: 43, time: '19h 17m', logo: 'tabler-color-swatch', color: 'warning', courseTitle: 'UI/UX Design', tags: 'Design', rating: 4.9, ratingCount: 10, desc: 'Learn how to design a beautiful mobile app with Figma', tutorImg: 'https://placehold.co/400x250?text=UI/UX' },
    { id: 3, user: 'Gertie Langwade', completedTasks: 87, totalTasks: 100, userCount: 19, note: 81, view: 88, time: '16h 16m', logo: 'tabler-brand-react', color: 'info', courseTitle: 'React Native', tags: 'Web', rating: 4.8, ratingCount: 9, desc: 'Master React.js: Build dynamic web apps with React Native', tutorImg: 'https://placehold.co/400x250?text=React' },
    { id: 4, user: 'Estella Chace', completedTasks: 33, totalTasks: 50, userCount: 28, note: 21, view: 87, time: '15h 49m', logo: 'tabler-edit', color: 'success', courseTitle: 'Art & Drawing', tags: 'Design', rating: 4.7, ratingCount: 18, desc: 'Easy-to-follow video & guides show you how to draw animals.', tutorImg: 'https://placehold.co/400x250?text=Art' },
    { id: 5, user: 'Euell Bownass', completedTasks: 100, totalTasks: 100, userCount: 13, note: 19, view: 13, time: '12h 42m', logo: 'tabler-star', color: 'primary', courseTitle: 'Basic Fundamentals', tags: 'Web', rating: 4.6, ratingCount: 11, desc: 'Learn the basics of the most popular programming language.', tutorImg: 'https://placehold.co/400x250?text=Basics' },
  ]
})

const totalCourse = computed(() => coursesData.value?.total || courses.value.length)

watch([
  hideCompleted,
  label,
  () => props.searchQuery,
], () => {
  page.value = 1
})

const resolveChipColor = tags => {
  if (tags === 'Web')
    return 'primary'
  if (tags === 'Art')
    return 'success'
  if (tags === 'UI/UX')
    return 'error'
  if (tags === 'Psychology')
    return 'warning'
  if (tags === 'Design')
    return 'info'
}
</script>

<template>
  <VCard class="mb-6">
    <VCardText>
      <!-- 👉 Header -->
      <div class="d-flex justify-space-between align-center flex-wrap gap-4 mb-6">
        <div>
          <h5 class="text-h5">
            My Courses
          </h5>
          <div class="text-body-1">
            Total 6 course you have purchased
          </div>
        </div>

        <div class="d-flex flex-wrap gap-x-6 gap-y-4 align-center">
          <AppSelect
            v-model="label"
            :items="[
              { title: 'Web', value: 'web' },
              { title: 'Art', value: 'art' },
              { title: 'UI/UX', value: 'ui/ux' },
              { title: 'Psychology', value: 'psychology' },
              { title: 'Design', value: 'design' },
              { title: 'All Courses', value: 'All Courses' },
            ]"
            style="min-inline-size: 260px;"
          />
          <VSwitch
            v-model="hideCompleted"
            label="Hide Completed"
          />
        </div>
      </div>

      <!-- 👉 Course List -->
      <div
        v-if="courses.length"
        class="mb-6"
      >
        <VRow>
          <template
            v-for="course in courses"
            :key="course.id"
          >
            <VCol
              cols="12"
              md="4"
              sm="6"
            >
              <VCard
                flat
                border
              >
                <div class="px-2 pt-2">
                  <VImg
                    :src="course.tutorImg"
                    class="cursor-pointer"
                    @click="() => $router.push({ name: 'apps-academy-course-details' })"
                  />
                </div>
                <VCardText>
                  <div class="d-flex justify-space-between align-center mb-4">
                    <VChip
                      variant="tonal"
                      :color="resolveChipColor(course.tags)"
                      size="small"
                    >
                      {{ course.tags }}
                    </VChip>
                    <div class="d-flex">
                      <h6 class="text-h6 text-medium-emphasis align-center me-1">
                        {{ course.rating }}
                      </h6>
                      <VIcon
                        icon="tabler-star-filled"
                        color="warning"
                        size="24"
                        class="me-2"
                      />
                      <div class="text-body-1">
                        ({{ course.ratingCount }})
                      </div>
                    </div>
                  </div>
                  <h5 class="text-h5 mb-1">
                    <RouterLink
                      :to="{ name: 'apps-academy-course-details' }"
                      class="course-title"
                    >
                      {{ course.courseTitle }}
                    </RouterLink>
                  </h5>
                  <p>
                    {{ course.desc }}
                  </p>
                  <div
                    v-if="course.completedTasks !== course.totalTasks"
                    class="d-flex align-center mb-1"
                  >
                    <VIcon
                      icon="tabler-clock"
                      size="20"
                      class="me-1"
                    />
                    <span class="text-body-1 my-auto"> {{ course.time }}</span>
                  </div>
                  <div
                    v-else
                    class="mb-1"
                  >
                    <VIcon
                      icon="tabler-check"
                      size="20"
                      color="success"
                      class="me-1"
                    />
                    <span class="text-success text-body-1">Completed</span>
                  </div>
                  <VProgressLinear
                    :model-value="(course.completedTasks / course.totalTasks) * 100"
                    rounded
                    color="primary"
                    height="8"
                    class="mb-4"
                  />
                  <div class="d-flex flex-wrap gap-4">
                    <VBtn
                      variant="tonal"
                      color="secondary"
                      class="flex-grow-1"
                      :to="{ name: 'apps-academy-course-details' }"
                    >
                      <template #prepend>
                        <VIcon
                          icon="tabler-rotate-clockwise-2"
                          class="flip-in-rtl"
                        />
                      </template>
                      Start Over
                    </VBtn>
                    <VBtn
                      v-if="course.completedTasks !== course.totalTasks"
                      variant="tonal"
                      class="flex-grow-1"
                      :to="{ name: 'apps-academy-course-details' }"
                    >
                      <template #append>
                        <VIcon
                          icon="tabler-chevron-right"
                          class="flip-in-rtl"
                        />
                      </template>
                      Continue
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </template>
        </VRow>
      </div>

      <div v-else>
        <h4 class="text-h4 text-center mb-6">
          No Course Found
        </h4>
      </div>

      <VPagination
        v-model="page"
        active-color="primary"
        first-icon="tabler-chevrons-left"
        last-icon="tabler-chevrons-right"
        show-first-last-page
        :length="Math.ceil(totalCourse / itemsPerPage)"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.course-title {
  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-text-high-emphasis));
  }
}
</style>
