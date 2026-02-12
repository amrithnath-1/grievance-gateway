// Grievance categories with icons
export const CATEGORIES = [
  'Academic', 'Examination', 'Infrastructure', 'Hostel',
  'Library', 'Administration', 'IT / Network', 'Discipline / Harassment', 'Other'
] as const;

export const STATUSES = [
  'Submitted', 'Acknowledged', 'Under Review', 'In Progress',
  'Awaiting Confirmation', 'Resolved', 'Closed', 'Rejected'
] as const;

export type GrievanceStatus = typeof STATUSES[number];
export type GrievanceCategory = typeof CATEGORIES[number];

export const STATUS_COLORS: Record<string, string> = {
  'Submitted': 'status-submitted',
  'Acknowledged': 'status-acknowledged',
  'Under Review': 'status-under-review',
  'In Progress': 'status-in-progress',
  'Awaiting Confirmation': 'status-awaiting-confirmation',
  'Resolved': 'status-resolved',
  'Closed': 'status-closed',
  'Rejected': 'status-rejected',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Academic': '📚',
  'Examination': '📝',
  'Infrastructure': '🏗️',
  'Hostel': '🏠',
  'Library': '📖',
  'Administration': '🏛️',
  'IT / Network': '💻',
  'Discipline / Harassment': '⚖️',
  'Other': '📋',
};
