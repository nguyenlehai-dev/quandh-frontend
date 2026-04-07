<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { getStoredUserData, getStoredAvailableOrganizations } from '@/modules/auth/services/authStorage'
import { clearAuthSession, logoutWithCore, switchOrganizationWithCore } from '@/modules/auth/services/coreAuth'

const router = useRouter()
const ability = useAbility()

const userData = ref(getStoredUserData())
const availableOrganizations = ref(getStoredAvailableOrganizations() ?? [])
const isOrganizationDialogVisible = ref(false)
const selectedOrganizationId = ref(userData.value?.currentOrganizationId ?? null)
const isSwitchingOrganization = ref(false)

const logout = async () => {
  const authProvider = useCookie('authProvider').value

  if (authProvider === 'core') {
    try {
      await logoutWithCore()
    }
    catch {
      // Clear local session even if backend logout fails.
    }
  }

  clearAuthSession(ability)

  // Redirect to login page
  await router.push('/login')
}

const handleOrganizationSelection = async () => {
  if (!selectedOrganizationId.value) return

  isSwitchingOrganization.value = true

  try {
    const accessToken = useCookie('accessToken').value
    await switchOrganizationWithCore(selectedOrganizationId.value, accessToken)
    
    // Switch successful, reload location to hydrate session securely
    window.location.reload()
  }
  catch (error) {
    console.error('Failed to switch organization', error)
  }
  finally {
    isSwitchingOrganization.value = false
  }
}

const userProfileList = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'tabler-user',
    title: 'Profile',
    to: {
      name: 'apps-profile',
    },
  },
  {
    type: 'navItem',
    icon: 'tabler-settings',
    title: 'Settings',
    to: {
      name: 'pages-account-settings-tab',
      params: { tab: 'account' },
    },
  },
  {
    type: 'navItem',
    icon: 'tabler-file-dollar',
    title: 'Billing Plan',
    to: {
      name: 'pages-account-settings-tab',
      params: { tab: 'billing-plans' },
    },
    badgeProps: {
      color: 'error',
      content: '4',
    },
  },
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'tabler-currency-dollar',
    title: 'Pricing',
    to: { name: 'pages-pricing' },
  },
  {
    type: 'navItem',
    icon: 'tabler-question-mark',
    title: 'FAQ',
    to: { name: 'pages-faq' },
  },
]
</script>

<template>
  <VBadge
    v-if="userData"
    dot
    bordered
    location="bottom right"
    offset-x="1"
    offset-y="2"
    color="success"
  >
    <VAvatar
      size="38"
      class="cursor-pointer"
      :color="!(userData && userData.avatar) ? 'primary' : undefined"
      :variant="!(userData && userData.avatar) ? 'tonal' : undefined"
    >
      <VImg
        v-if="userData && userData.avatar"
        :src="userData.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="240"
        location="bottom end"
        offset="12px"
      >
        <VList>
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="!(userData && userData.avatar) ? 'primary' : undefined"
                    :variant="!(userData && userData.avatar) ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="userData && userData.avatar"
                      :src="userData.avatar"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>

              <div>
                <h6 class="text-h6 font-weight-medium">
                  {{ userData.fullName || userData.username }}
                </h6>
                <VListItemSubtitle class="text-capitalize text-disabled">
                  {{ userData.role }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ $t(item.title) }}</VListItemTitle>

                <template
                  v-if="item.badgeProps"
                  #append
                >
                  <VBadge
                    rounded="sm"
                    class="me-3"
                    v-bind="item.badgeProps"
                  />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>

            <div class="px-4 py-2 d-flex flex-column gap-y-2">
              <VBtn
                v-if="availableOrganizations.length > 1"
                block
                size="small"
                color="secondary"
                variant="tonal"
                append-icon="tabler-building-community"
                @click="isOrganizationDialogVisible = true"
              >
                {{ $t('Switch Organization') }}
              </VBtn>
              <VBtn
                block
                size="small"
                color="error"
                append-icon="tabler-logout"
                @click="logout"
              >
                {{ $t('Logout') }}
              </VBtn>
            </div>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>

    <!-- Dialog switch organization -->
    <VDialog
      v-model="isOrganizationDialogVisible"
      max-width="520"
      persistent
    >
      <VCard :title="$t('Select working organization')">
        <VCardText>
          <AppSelect
            v-model="selectedOrganizationId"
            :label="$t('Organization field')"
            :placeholder="$t('Choose organization')"
            :items="availableOrganizations.map(item => ({ title: item.name, value: item.id }))"
          />
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap pt-0">
          <VBtn
            variant="tonal"
            color="secondary"
            @click="isOrganizationDialogVisible = false"
          >
            {{ $t('Cancel') }}
          </VBtn>

          <VBtn
            :loading="isSwitchingOrganization"
            @click="handleOrganizationSelection"
          >
            {{ $t('Continue') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </VBadge>
</template>
