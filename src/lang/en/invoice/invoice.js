export default {
  title: 'Invoice',
  list: {
    title: 'Invoice List',
    create: 'Create invoice',
    search: 'Search Invoice',
    no_found: 'No Invoice Found',
  },
  headers: {
    id: '#',
    client: 'Client',
    total: 'Total',
    issued_date: 'Issued Date',
    balance: 'Balance',
  },
  widgets: {
    clients: 'Clients',
    invoices: 'Invoices',
    paid: 'Paid',
    unpaid: 'Unpaid',
  },
  status: {
    paid: 'Paid',
    unpaid: 'Unpaid',
    partial_payment: 'Partial Payment',
    downloaded: 'Downloaded',
    draft: 'Draft',
    sent: 'Sent',
    past_due: 'Past Due',
    invoice_status: 'Invoice Status',
  },
  tooltip: {
    balance: 'Balance',
    due_date: 'Due date',
  },
}
