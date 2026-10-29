const STATUS_CONFIG = {
  // SellRequest
  submitted: { label: 'Submitted', cls: 'badge-primary' },
  approved: { label: 'Approved', cls: 'badge-accent' },
  agent_assigned: { label: 'Agent Assigned', cls: 'badge-warning' },
  picked_up: { label: 'Picked Up', cls: 'badge-success' },
  rejected: { label: 'Rejected', cls: 'badge-danger' },
  rejected_at_pickup: { label: 'Rejected at Pickup', cls: 'badge-danger' },
  // Device
  received: { label: 'Received', cls: 'badge-muted' },
  tested: { label: 'Tested', cls: 'badge-primary' },
  wiped: { label: 'Wiped', cls: 'badge-warning' },
  os_flashed: { label: 'OS Flashed', cls: 'badge-accent' },
  final_qa: { label: 'Final QA', cls: 'badge-warning' },
  live: { label: 'Live', cls: 'badge-success' },
  sold: { label: 'Sold', cls: 'badge-primary' },
  shipped: { label: 'Shipped', cls: 'badge-accent' },
  delivered: { label: 'Delivered', cls: 'badge-success' },
  // Order
  placed: { label: 'Placed', cls: 'badge-primary' },
  paid: { label: 'Paid', cls: 'badge-accent' },
  processing: { label: 'Processing', cls: 'badge-warning' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
  returned: { label: 'Returned', cls: 'badge-danger' },
  // Payment
  pending: { label: 'Pending', cls: 'badge-warning' },
  failed: { label: 'Failed', cls: 'badge-danger' },
  refunded: { label: 'Refunded', cls: 'badge-muted' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'badge-muted' };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
};

export default StatusBadge;
