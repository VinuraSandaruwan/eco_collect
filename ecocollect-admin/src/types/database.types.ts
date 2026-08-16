export interface Resident {
  id: string;
  name: string;
  phone: string;
  address: string;
  zone: string;
  plan: "Basic" | "Standard" | "Premium";
  status: "Active" | "Suspended";
  joined: string;
}

export interface Collector {
  id: string;
  nic: string;
  name: string;
  phone: string;
  assigned_vehicle: string;
  assigned_route: string;
  shift: "Morning" | "Evening" | "Night";
  status: "Active" | "On Leave" | "Inactive";
}

export interface Truck {
  id: string;
  plate: string;
  type: "Compactor Truck" | "Tipper Truck" | "Mini Collector" | "Hazardous Container";
  capacity: string;
  driver: string;
  route: string;
  status: "On Route" | "Idle" | "Maintenance";
  fuel_level: string;
  last_service: string;
  lat: number;
  lng: number;
}

export interface Complaint {
  id: string;
  ticket_id: string;
  resident_name: string;
  category: "Missed Pickup" | "Bin Damage" | "Late Collection" | "Staff Behavior" | "Other";
  zone: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High";
}

export interface DumpingReport {
  id: string;
  title: string;
  location: string;
  zone: string;
  severity: "Urgent" | "Standard" | "Low";
  status: "Unassigned" | "Assigned" | "Resolved";
  reported_ago: string;
  assigned_officer?: string;
  photo_url?: string;
  lat: number;
  lng: number;
}

export interface MarketplaceListing {
  id: string;
  waste_type: string;
  icon: string;
  icon_color: string;
  quantity: string;
  price: string;
  buyer_category: string;
  location: string;
  status: "Available" | "Reserved" | "Sold Out";
  date_added: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  organizer_type: "Citizen" | "Municipal Council";
  organizer_name: string;
  organizer_contact: string;
  location: string;
  zone: string;
  event_date: string;
  event_time: string;
  expected_volunteers: number;
  assigned_support_truck?: string;
  support_requested: string;
  status: "Pending Review" | "Approved" | "Completed" | "Rejected";
}

export interface ScheduleItem {
  id: string;
  day: number;
  route_code: string;
  service_area: string;
  date_str: string;
  time_slot: string;
  vehicle: string;
  driver_team: string;
  waste_type: "Organic" | "Recyclables" | "Hazardous" | "General";
  status: "Scheduled" | "In Progress" | "Completed" | "Delayed";
}

export interface PaymentTransaction {
  id: string;
  type: "Service Fee" | "Marketplace Sale" | "Penalty / Fine" | "Special Pickup";
  payer_entity: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Refunded";
  payment_method: "Credit/Debit Card" | "Online Banking" | "Cash Deposit";
}

export interface ReportItem {
  id: string;
  name: string;
  category: "Audit" | "Fleet & Routes" | "Personnel" | "Financial" | "Recycling";
  format: "PDF" | "Excel" | "CSV";
  date_generated: string;
  size: string;
  generated_by: string;
}

export interface SystemSettings {
  id?: string;
  municipality_name: string;
  contact_email: string;
  contact_phone: string;
  timezone: string;
  address: string;
  currency: string;
  email_alerts: boolean;
  sms_dispatches: boolean;
  auto_notify_citizen: boolean;
  dumping_hotspot_alert: boolean;
  maintenance_alert: boolean;
  google_maps_api_key: string;
  sms_gateway_api_key: string;
  gps_sync_interval: string;
}
