export default {
  title: 'Hóa đơn',
  list: {
    title: 'Danh sách hóa đơn',
    create: 'Tạo hóa đơn',
    search: 'Tìm hóa đơn',
    no_found: 'Không tìm thấy hóa đơn',
  },
  headers: {
    id: '#',
    client: 'Khách hàng',
    total: 'Tổng tiền',
    issued_date: 'Ngày phát hành',
    balance: 'Số dư',
  },
  widgets: {
    clients: 'Khách hàng',
    invoices: 'Hóa đơn',
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
  },
  status: {
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    partial_payment: 'Thanh toán một phần',
    downloaded: 'Đã tải',
    draft: 'Bản nháp',
    sent: 'Đã gửi',
    past_due: 'Quá hạn',
    invoice_status: 'Trạng thái hóa đơn',
  },
  tooltip: {
    balance: 'Số dư',
    due_date: 'Ngày đến hạn',
  },
}
