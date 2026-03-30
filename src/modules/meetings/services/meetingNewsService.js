import { API_POST_CATEGORIES, API_POSTS } from '../configs'

export const fetchPosts = params => $api(API_POSTS, { params })
export const createPost = data => $api(API_POSTS, { method: 'POST', body: data })
export const updatePost = (id, data) => $api(`${API_POSTS}/${id}`, { method: 'PUT', body: data })
export const deletePost = id => $api(`${API_POSTS}/${id}`, { method: 'DELETE' })
export const exportPosts = params => $api(`${API_POSTS}/export`, { params, responseType: 'blob' })

export const fetchPostCategories = params => $api(API_POST_CATEGORIES, { params })
export const createPostCategory = data => $api(API_POST_CATEGORIES, { method: 'POST', body: data })
export const updatePostCategory = (id, data) => $api(`${API_POST_CATEGORIES}/${id}`, { method: 'PUT', body: data })
export const deletePostCategory = id => $api(`${API_POST_CATEGORIES}/${id}`, { method: 'DELETE' })
export const exportPostCategories = params => $api(`${API_POST_CATEGORIES}/export`, { params, responseType: 'blob' })
