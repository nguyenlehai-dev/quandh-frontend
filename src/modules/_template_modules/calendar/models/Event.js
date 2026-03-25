/**
 * Event Model
 *
 * Định nghĩa cấu trúc dữ liệu của Calendar Event.
 */

/**
 * @typedef {Object} CalendarEvent
 * @property {number|null} id
 * @property {string} title
 * @property {string} start
 * @property {string} end
 * @property {boolean} allDay
 * @property {string} type - 'Business' | 'Holiday' | 'Personal' | 'Family' | 'ETC'
 * @property {string|null} description
 * @property {string|null} url
 */

/** Event mặc định khi tạo mới */
export const blankEvent = {
  id: null,
  title: '',
  start: '',
  end: '',
  allDay: false,
  type: 'Business',
  description: null,
  url: null,
}

/**
 * Resolve event color theo type
 * @param {string} type
 * @returns {string}
 */
export const resolveEventColor = type => {
  const colors = {
    Business: 'primary',
    Holiday: 'success',
    Personal: 'error',
    Family: 'warning',
    ETC: 'info',
  }

  return colors[type] || 'primary'
}
