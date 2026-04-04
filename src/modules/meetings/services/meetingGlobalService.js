import { API_BASE, API_ATTENDEES, API_CONCLUSIONS, API_DOCUMENTS, API_VOTES } from '../configs'

export const fetchVotes = params => $api(API_VOTES, { params })
export const fetchVote = id => $api(`${API_VOTES}/${id}`)
export const createVote = data => $api(API_VOTES, { method: 'POST', body: data })
export const updateVote = (id, data) => $api(`${API_VOTES}/${id}`, { method: 'PUT', body: data })
export const deleteVote = id => $api(`${API_VOTES}/${id}`, { method: 'DELETE' })
export const exportVotes = params => $api(API_VOTES, { params })

export const fetchDocuments = params => $api(API_DOCUMENTS, { params })
export const fetchDocument = id => $api(`${API_DOCUMENTS}/${id}`)
export const createDocument = data => $api(API_DOCUMENTS, { method: 'POST', body: data })
export const updateDocument = (id, data) => $api(`${API_DOCUMENTS}/${id}`, { method: 'PUT', body: data })
export const deleteDocument = id => $api(`${API_DOCUMENTS}/${id}`, { method: 'DELETE' })
export const exportDocuments = params => $api(API_DOCUMENTS, { params })

export const fetchConclusions = params => $api(API_CONCLUSIONS, { params })
export const fetchConclusion = id => $api(`${API_CONCLUSIONS}/${id}`)
export const createConclusion = data => $api(API_CONCLUSIONS, { method: 'POST', body: data })
export const updateConclusion = (id, data) => $api(`${API_CONCLUSIONS}/${id}`, { method: 'PUT', body: data })
export const deleteConclusion = id => $api(`${API_CONCLUSIONS}/${id}`, { method: 'DELETE' })
export const exportConclusions = params => $api(API_CONCLUSIONS, { params })

export const fetchAttendees = params => $api(API_ATTENDEES, { params })
export const createAttendee = data => $api(API_ATTENDEES, { method: 'POST', body: data })
export const deleteAttendee = id => $api(`${API_ATTENDEES}/${id}`, { method: 'DELETE' })
export const exportAttendees = params => $api(API_ATTENDEES, { params })
