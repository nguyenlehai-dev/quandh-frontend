<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { logout as authLogout, redirectToOrganizationSelection } from '@/services/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// TODO: Get type from backend
const userData = useCookie('userData')

const logout = async () => {
  await authLogout(router)
}

const clearOrgAndSwitch = async () => {
  await redirectToOrganizationSelection(router, {
    to: route.fullPath !== '/' ? route.fullPath : undefined,
  })
}

const userProfileList = [
  { type: 'divider' },
  {
    type: 'navItem',
    icon: 'tabler-user',
    title: t('navigation.navigation.user_profile'),
    to: {
      name: 'user-profile',
    },
  },
  {
    type: 'navItem',
    icon: 'tabler-building-community',
    title: t('navigation.navigation.switch_organization'),
    action: 'switchOrg',
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
                  {{ userData.name || userData.user_name }}
                </h6>
                <VListItemSubtitle
                  class="text-capitalize text-disabled"
                  style="white-space: normal;"
                >
                  {{ userData.assignments?.map(a => a.role_name).join(', ') || t('navigation.navigation.user') }}
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
                :to="item.to || undefined"
                @click="item.action === 'switchOrg' ? clearOrgAndSwitch() : undefined"
              >
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>

            <div class="px-4 py-2">
              <VBtn
                block
                size="small"
                color="error"
                append-icon="tabler-logout"
                @click="logout"
              >
                {{ t('navigation.navigation.logout') }}
              </VBtn>
            </div>
          </PerfectScrollbar>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
</template>
