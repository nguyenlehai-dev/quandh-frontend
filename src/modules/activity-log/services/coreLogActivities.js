import { buildCoreCollectionQuery, coreApi, downloadCoreFile } from '@/modules/core/services/coreApi'

export const getCoreLogActivities = params => coreApi('/log-activities', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreLogActivityStats = params => coreApi('/log-activities/stats', {
  query: buildCoreCollectionQuery(params),
})

export const getCoreLogActivity = logActivityId => coreApi(`/log-activities/${logActivityId}`)

export const deleteCoreLogActivity = logActivityId => coreApi(`/log-activities/${logActivityId}`, {
  method: 'DELETE',
})

export const bulkDeleteCoreLogActivities = ids => coreApi('/log-activities/bulk-delete', {
  method: 'POST',
  body: { ids },
})

export const deleteCoreLogActivitiesByDate = (fromDate, toDate) => coreApi('/log-activities/delete-by-date', {
  method: 'POST',
  body: {
    from_date: fromDate,
    to_date: toDate,
  },
})

export const clearCoreLogActivities = () => coreApi('/log-activities/clear', {
  method: 'POST',
})

export const downloadCoreLogActivitiesExport = query => downloadCoreFile({
  path: '/log-activities/export',
  query: buildCoreCollectionQuery(query),
  fileName: `log-activities-${new Date().toISOString().slice(0, 10)}.xlsx`,
})
