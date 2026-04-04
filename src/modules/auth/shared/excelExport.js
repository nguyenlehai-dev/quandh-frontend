import * as XLSX from 'xlsx'

export const exportRowsToExcel = ({
  rows = [],
  headers = [],
  sheetName = 'Sheet1',
  fileName = 'export.xlsx',
  columns = [],
} = {}) => {
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: headers,
  })

  if (columns.length)
    worksheet['!cols'] = columns

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}
