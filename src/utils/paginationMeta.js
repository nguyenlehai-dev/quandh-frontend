import { getI18n } from '@/plugins/i18n'

export const paginationMeta = (options, total) => {
  const start = (options.page - 1) * options.itemsPerPage + 1
  const end = Math.min(options.page * options.itemsPerPage, total)
  const { t } = getI18n().global

  return t('pagination.meta', {
    end,
    start: total === 0 ? 0 : start,
    total,
  })
}
