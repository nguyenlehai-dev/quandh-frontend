<script setup>
const { t } = useI18n()

const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedRows = ref([])

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const widgetData = ref([
  {
    title: t('invoice.invoice.widgets.clients'),
    value: 24,
    icon: 'tabler-user',
  },
  {
    title: t('invoice.invoice.widgets.invoices'),
    value: 165,
    icon: 'tabler-file-invoice',
  },
  {
    title: t('invoice.invoice.widgets.paid'),
    value: '$2.46k',
    icon: 'tabler-checks',
  },
  {
    title: t('invoice.invoice.widgets.unpaid'),
    value: '$876',
    icon: 'tabler-circle-off',
  },
])

// 👉 headers
const headers = [
  {
    title: t('invoice.invoice.headers.id'),
    key: 'id',
  },
  {
    title: t('common.common.labels.status'),
    key: 'status',
    sortable: false,
  },
  {
    title: t('invoice.invoice.headers.client'),
    key: 'client',
  },
  {
    title: t('invoice.invoice.headers.total'),
    key: 'total',
  },
  {
    title: t('invoice.invoice.headers.issued_date'),
    key: 'date',
  },
  {
    title: t('invoice.invoice.headers.balance'),
    key: 'balance',
  },
  {
    title: t('common.common.labels.actions'),
    key: 'actions',
    sortable: false,
  },
]

const {
  data: invoiceData,
  execute: fetchInvoices,
} = await useApi(createUrl('/apps/invoice', {
  query: {
    q: searchQuery,
    status: selectedStatus,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const invoices = computed(() => invoiceData.value.invoices)
const totalInvoices = computed(() => invoiceData.value.totalInvoices)

// 👉 Invoice balance variant resolver
const resolveInvoiceBalanceVariant = (balance, total) => {
  if (balance === total)
    return {
      status: t('invoice.invoice.status.unpaid'),
      chip: { color: 'error' },
    }
  if (balance === 0)
    return {
      status: t('invoice.invoice.status.paid'),
      chip: { color: 'success' },
    }
  
  return {
    status: balance,
    chip: { variant: 'text' },
  }
}

const resolveInvoiceStatusVariantAndIcon = status => {
  if (status === 'Partial Payment')
    return {
      variant: 'warning',
      icon: 'tabler-chart-pie-2',
    }
  if (status === 'Paid')
    return {
      variant: 'success',
      icon: 'tabler-check',
    }
  if (status === 'Downloaded')
    return {
      variant: 'info',
      icon: 'tabler-arrow-down',
    }
  if (status === 'Draft')
    return {
      variant: 'primary',
      icon: 'tabler-folder',
    }
  if (status === 'Sent')
    return {
      variant: 'secondary',
      icon: 'tabler-mail',
    }
  if (status === 'Past Due')
    return {
      variant: 'error',
      icon: 'tabler-help',
    }
  
  return {
    variant: 'secondary',
    icon: 'tabler-x',
  }
}

const computedMoreList = computed(() => {
  return paramId => [
    {
      title: t('common.common.actions.download'),
      value: 'download',
      prependIcon: 'tabler-download',
    },
    {
      title: t('common.common.actions.edit'),
      value: 'edit',
      prependIcon: 'tabler-pencil',
      to: {
        name: 'apps-invoice-edit-id',
        params: { id: paramId },
      },
    },
    {
      title: t('common.common.actions.duplicate'),
      value: 'duplicate',
      prependIcon: 'tabler-layers-intersect',
    },
  ]
})

const deleteInvoice = async id => {
  await $api(`/apps/invoice/${ id }`, { method: 'DELETE' })

  // Delete from selectedRows
  const index = selectedRows.value.findIndex(row => row === id)
  if (index !== -1)
    selectedRows.value.splice(index, 1)

  // Refetch Invoices
  fetchInvoices()
}
</script>

<template>
  <section v-if="invoices">
    <!-- 👉 Invoice Widgets -->
    <VCard class="mb-6">
      <VCardText class="px-3">
        <VRow>
          <template
            v-for="(data, id) in widgetData"
            :key="id"
          >
            <VCol
              cols="12"
              sm="6"
              md="3"
              class="px-6"
            >
              <div
                class="d-flex justify-space-between align-center"
                :class="$vuetify.display.xs
                  ? id !== widgetData.length - 1 ? 'border-b pb-4' : ''
                  : $vuetify.display.sm
                    ? id < (widgetData.length / 2) ? 'border-b pb-4' : ''
                    : ''"
              >
                <div class="d-flex flex-column">
                  <h4 class="text-h4">
                    {{ data.value }}
                  </h4>
                  <span class="text-body-1 text-capitalize">{{ data.title }}</span>
                </div>

                <VAvatar
                  variant="tonal"
                  rounded
                  size="42"
                >
                  <VIcon
                    :icon="data.icon"
                    size="26"
                    color="high-emphasis"
                  />
                </VAvatar>
              </div>
            </VCol>
            <VDivider
              v-if="$vuetify.display.mdAndUp ? id !== widgetData.length - 1
                : $vuetify.display.smAndUp ? id % 2 === 0
                  : false"
              vertical
              inset
              length="60"
            />
          </template>
        </VRow>
      </VCardText>
    </VCard>

    <VCard id="invoice-list">
      <VCardText class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div class="d-flex gap-4 align-center flex-wrap">
          <div class="d-flex align-center gap-2">
            <span>{{ t('common.common.labels.show') }}</span>
            <AppSelect
              :model-value="itemsPerPage"
              :items="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: -1, title: t('common.common.labels.all') },
              ]"
              style="inline-size: 5.5rem;"
              @update:model-value="itemsPerPage = parseInt($event, 10)"
            />
          </div>
          <!-- 👉 Create invoice -->
          <VBtn
            prepend-icon="tabler-plus"
            :to="{ name: 'apps-invoice-add' }"
          >
            {{ t('invoice.invoice.list.create') }}
          </VBtn>
        </div>

        <div class="d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <div class="invoice-list-filter">
            <AppTextField
              v-model="searchQuery"
              :placeholder="t('invoice.invoice.list.search')"
            />
          </div>

          <!-- 👉 Select status -->
          <div class="invoice-list-filter">
            <AppSelect
              v-model="selectedStatus"
              :placeholder="t('invoice.invoice.status.invoice_status')"
              clearable
              clear-icon="tabler-x"
              single-line
              :items="['Downloaded', 'Draft', 'Sent', 'Paid', 'Partial Payment', 'Past Due']"
            />
          </div>
        </div>
      </VCardText>
      <VDivider />

      <!-- SECTION Datatable -->
      <VDataTableServer
        v-model:model-value="selectedRows"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        show-select
        :items-length="totalInvoices"
        :headers="headers"
        :items="invoices"
        item-value="id"
        class="text-no-wrap"
        @update:options="updateOptions"
      >
        <!-- id -->
        <template #item.id="{ item }">
          <RouterLink :to="{ name: 'apps-invoice-preview-id', params: { id: item.id } }">
            #{{ item.id }}
          </RouterLink>
        </template>

        <!-- status -->
        <template #item.status="{ item }">
          <VTooltip>
            <template #activator="{ props }">
              <VAvatar
                :size="28"
                v-bind="props"
                :color="resolveInvoiceStatusVariantAndIcon(item.invoiceStatus).variant"
                variant="tonal"
              >
                <VIcon
                  :size="16"
                  :icon="resolveInvoiceStatusVariantAndIcon(item.invoiceStatus).icon"
                />
              </VAvatar>
            </template>
            <p class="mb-0">
              {{ item.invoiceStatus }}
            </p>
            <p class="mb-0">
              {{ t('invoice.invoice.tooltip.balance') }}: {{ item.balance }}
            </p>
            <p class="mb-0">
              {{ t('invoice.invoice.tooltip.due_date') }}: {{ item.dueDate }}
            </p>
          </VTooltip>
        </template>

        <!-- client -->
        <template #item.client="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="34"
              :color="!item.avatar.length ? resolveInvoiceStatusVariantAndIcon(item.invoiceStatus).variant : undefined"
              :variant="!item.avatar.length ? 'tonal' : undefined"
              class="me-3"
            >
              <VImg
                v-if="item.avatar.length"
                :src="item.avatar"
              />
              <span v-else>{{ avatarText(item.client.name) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <RouterLink
                :to="{ name: 'pages-user-profile-tab', params: { tab: 'profile' } }"
                class="text-link font-weight-medium"
              >
                {{ item.client.name }}
              </RouterLink>
              <span class="text-sm text-medium-emphasis">{{ item.client.companyEmail }}</span>
            </div>
          </div>
        </template>

        <!-- Total -->
        <template #item.total="{ item }">
          ${{ item.total }}
        </template>

        <!-- Date -->
        <template #item.date="{ item }">
          {{ item.issuedDate }}
        </template>

        <!-- Balance -->
        <template #item.balance="{ item }">
          <VChip
            v-if="typeof ((resolveInvoiceBalanceVariant(item.balance, item.total)).status) === 'string'"
            :color="resolveInvoiceBalanceVariant(item.balance, item.total).chip.color"
            label
            size="x-small"
          >
            {{ (resolveInvoiceBalanceVariant(item.balance, item.total)).status }}
          </VChip>

          <template v-else>
            <span class="text-base text-high-emphasis">
              {{ Number((resolveInvoiceBalanceVariant(item.balance, item.total)).status) > 0 ? `$${(resolveInvoiceBalanceVariant(item.balance, item.total)).status}` : `-$${Math.abs(Number((resolveInvoiceBalanceVariant(item.balance, item.total)).status))}` }}
            </span>
          </template>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn @click="deleteInvoice(item.id)">
            <VIcon icon="tabler-trash" />
          </IconBtn>

          <IconBtn :to="{ name: 'apps-invoice-preview-id', params: { id: item.id } }">
            <VIcon icon="tabler-eye" />
          </IconBtn>

          <MoreBtn
            :menu-list="computedMoreList(item.id)"
            item-props
            color="undefined"
          />
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalInvoices"
          />
        </template>
      </VDataTableServer>
    <!-- !SECTION -->
    </VCard>
  </section>
  <section v-else>
    <VCard>
      <VCardTitle>{{ t('invoice.invoice.list.no_found') }}</VCardTitle>
    </VCard>
  </section>
</template>

<style lang="scss">
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }

  .invoice-list-filter {
    inline-size: 12rem;
  }
}
</style>
