function buildImportBody(file) {
  const formData = new FormData()

  formData.append('file', file)

  return formData
}

export function createCrudService(apiBase) {
  return {
    fetchList: params => $api(apiBase, { params }),
    fetchOne: id => $api(`${apiBase}/${id}`),
    createOne: data => $api(apiBase, { method: 'POST', body: data }),
    updateOne: (id, data) => $api(`${apiBase}/${id}`, { method: 'PUT', body: data }),
    deleteOne: id => $api(`${apiBase}/${id}`, { method: 'DELETE' }),
    fetchStats: params => $api(`${apiBase}/stats`, { params }),
    exportList: params => $api(`${apiBase}/export`, { params, responseType: 'blob' }),
    downloadTemplate: () => $api(`${apiBase}/template`, { responseType: 'blob' }),
    importFile: file => $api(`${apiBase}/import`, { method: 'POST', body: buildImportBody(file) }),
    bulkDelete: ids => $api(`${apiBase}/bulk-delete`, { method: 'POST', body: { ids } }),
  }
}
