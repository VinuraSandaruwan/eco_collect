import { supabase } from "./supabaseClient";
import type {
  Resident,
  Collector,
  Truck,
  Complaint,
  DumpingReport,
  MarketplaceListing,
  CommunityEvent,
  ScheduleItem,
  PaymentTransaction,
  ReportItem,
  SystemSettings,
} from "../types/database.types";

// ================= INITIAL FALLBACK DATA =================
const fallbackResidents: Resident[] = [
  {
    id: "USR-001",
    name: "A. Wickramasinghe",
    phone: "071 111 2233",
    address: "No. 12, Lake Road",
    zone: "Negombo North",
    plan: "Standard",
    status: "Active",
    joined: "Jan 14, 2024",
  },
  {
    id: "USR-002",
    name: "N. Rajapaksha",
    phone: "077 222 3344",
    address: "No. 45, Beach Road",
    zone: "Negombo South",
    plan: "Premium",
    status: "Active",
    joined: "Feb 02, 2024",
  },
  {
    id: "USR-003",
    name: "T. Gunasekara",
    phone: "076 333 4455",
    address: "No. 8, Church Street",
    zone: "Kochchikade",
    plan: "Basic",
    status: "Suspended",
    joined: "Mar 20, 2024",
  },
  {
    id: "USR-004",
    name: "D. Herath",
    phone: "070 444 5566",
    address: "No. 21, Kandy Road",
    zone: "Kandana",
    plan: "Standard",
    status: "Active",
    joined: "Apr 08, 2024",
  },
];

const fallbackCollectors: Collector[] = [
  {
    id: "COL-01",
    nic: "198512401234",
    name: "S. Perera",
    phone: "077 123 4567",
    assigned_vehicle: "WP CAB-4521",
    assigned_route: "Route A - Negombo North",
    shift: "Morning",
    status: "Active",
  },
  {
    id: "COL-02",
    nic: "199023405678",
    name: "K. Fernando",
    phone: "071 234 5678",
    assigned_vehicle: "WP CAD-7743",
    assigned_route: "Route B - Negombo South",
    shift: "Morning",
    status: "Active",
  },
  {
    id: "COL-03",
    nic: "198834509123",
    name: "M. Silva",
    phone: "076 345 6789",
    assigned_vehicle: "WP CAE-1290",
    assigned_route: "Route C - Kochchikade",
    shift: "Evening",
    status: "On Leave",
  },
  {
    id: "COL-04",
    nic: "199245603456",
    name: "R. Jayasuriya",
    phone: "070 456 7890",
    assigned_vehicle: "WP CAF-6602",
    assigned_route: "Route D - Kandana",
    shift: "Night",
    status: "Inactive",
  },
];

const fallbackTrucks: Truck[] = [
  {
    id: "TRK-01",
    plate: "WP CAB-4521",
    type: "Compactor Truck",
    capacity: "8.5 Tons",
    driver: "S. Perera",
    route: "Route A - Negombo North",
    status: "On Route",
    fuel_level: "78%",
    last_service: "Jul 20, 2026",
    lat: 7.2095,
    lng: 79.8385,
  },
  {
    id: "TRK-02",
    plate: "WP CAD-7743",
    type: "Compactor Truck",
    capacity: "8.5 Tons",
    driver: "K. Fernando",
    route: "Route B - Negombo South",
    status: "On Route",
    fuel_level: "62%",
    last_service: "Aug 02, 2026",
    lat: 7.1935,
    lng: 79.8465,
  },
  {
    id: "TRK-03",
    plate: "WP CAE-1290",
    type: "Tipper Truck",
    capacity: "12.0 Tons",
    driver: "M. Silva",
    route: "Route C - Kochchikade",
    status: "Idle",
    fuel_level: "90%",
    last_service: "Jun 15, 2026",
    lat: 7.225,
    lng: 79.859,
  },
  {
    id: "TRK-04",
    plate: "WP CAF-6602",
    type: "Hazardous Container",
    capacity: "5.0 Tons",
    driver: "R. Jayasuriya",
    route: "Route D - Kandana",
    status: "Maintenance",
    fuel_level: "25%",
    last_service: "Aug 10, 2026",
    lat: 7.045,
    lng: 79.894,
  },
];

const fallbackComplaints: Complaint[] = [
  {
    id: "CMP-101",
    ticket_id: "CMP-101",
    resident_name: "A. Wickramasinghe",
    zone: "Negombo North",
    category: "Missed Pickup",
    description: "Waste not collected for 2 days on Lake Road.",
    priority: "High",
    status: "Open",
  },
  {
    id: "CMP-102",
    ticket_id: "CMP-102",
    resident_name: "N. Rajapaksha",
    zone: "Negombo South",
    category: "Bin Damage",
    description: "Bin lid broken after last collection.",
    priority: "Low",
    status: "In Progress",
  },
  {
    id: "CMP-103",
    ticket_id: "CMP-103",
    resident_name: "T. Gunasekara",
    zone: "Kochchikade",
    category: "Late Collection",
    description: "Truck arrived 3 hours later than scheduled.",
    priority: "Medium",
    status: "Resolved",
  },
  {
    id: "CMP-104",
    ticket_id: "CMP-104",
    resident_name: "D. Herath",
    zone: "Kandana",
    category: "Staff Behavior",
    description: "Collector was rude when asked about schedule.",
    priority: "Medium",
    status: "Open",
  },
];

const fallbackDumpingReports: DumpingReport[] = [
  {
    id: "DMP-201",
    title: "Suburban Alleyway Furniture",
    location: "402 West End District, Unit B",
    zone: "Negombo North",
    severity: "Urgent",
    status: "Unassigned",
    reported_ago: "2 hours ago",
    lat: 7.2095,
    lng: 79.8385,
  },
  {
    id: "DMP-202",
    title: "Industrial Tire Stack",
    location: "Northside Park Perimeter",
    zone: "Negombo South",
    severity: "Standard",
    status: "Assigned",
    reported_ago: "5 hours ago",
    assigned_officer: "Officer Davis",
    lat: 7.1935,
    lng: 79.8465,
  },
  {
    id: "DMP-203",
    title: "Construction Debris Lot",
    location: "880 Downtown Industrial Blvd",
    zone: "Kochchikade",
    severity: "Urgent",
    status: "Unassigned",
    reported_ago: "1 day ago",
    lat: 7.225,
    lng: 79.859,
  },
  {
    id: "DMP-204",
    title: "Canal Bank Waste Pile",
    location: "Near Beach Road Bridge",
    zone: "Negombo South",
    severity: "Low",
    status: "Resolved",
    reported_ago: "3 days ago",
    assigned_officer: "Officer Perera",
    lat: 7.189,
    lng: 79.851,
  },
];

const fallbackMarketplaceListings: MarketplaceListing[] = [
  {
    id: "LST-101",
    waste_type: "Organic Waste",
    icon: "bi-flower1",
    icon_color: "success",
    quantity: "12.5t",
    price: "LKR 45/t",
    buyer_category: "Biogas Plants",
    location: "Sector A-12",
    status: "Available",
    date_added: "Oct 12, 2024",
  },
  {
    id: "LST-102",
    waste_type: "Plastic PET",
    icon: "bi-recycle",
    icon_color: "primary",
    quantity: "8.0t",
    price: "LKR 240/t",
    buyer_category: "Plastic Recyclers",
    location: "Sector B-4",
    status: "Reserved",
    date_added: "Oct 10, 2024",
  },
  {
    id: "LST-103",
    waste_type: "E-Waste",
    icon: "bi-cpu",
    icon_color: "secondary",
    quantity: "1.2t",
    price: "LKR 1,800/t",
    buyer_category: "E-Waste Processors",
    location: "Central Hub",
    status: "Sold Out",
    date_added: "Oct 08, 2024",
  },
  {
    id: "LST-104",
    waste_type: "Paper/Cardboard",
    icon: "bi-file-earmark-text",
    icon_color: "warning",
    quantity: "22.0t",
    price: "LKR 85/t",
    buyer_category: "Paper Mills",
    location: "Sector D-1",
    status: "Available",
    date_added: "Oct 05, 2024",
  },
];

const fallbackCommunityEvents: CommunityEvent[] = [
  {
    id: "EVT-101",
    title: "Negombo Main Beach Coastal Cleanup Drive",
    organizer_type: "Municipal Council",
    organizer_name: "Municipal Environmental Division",
    organizer_contact: "031 222 4567",
    location: "Kudapaduwa Beach Stretch",
    zone: "Negombo North",
    event_date: "Aug 22, 2026",
    event_time: "06:30 AM - 10:30 AM",
    expected_volunteers: 85,
    assigned_support_truck: "WP CAB-4521 (TRK-01)",
    support_requested: "2 Compactor Trucks + 200 Heavy Duty Trash Sacks",
    status: "Approved",
  },
  {
    id: "EVT-102",
    title: "Lagoon Canal Plastic Recovery Initiative",
    organizer_type: "Citizen",
    organizer_name: "Youth Green Volunteers (Kavinda P.)",
    organizer_contact: "077 345 6789",
    location: "Mankuliya Canal Bridge",
    zone: "Negombo South",
    event_date: "Aug 29, 2026",
    event_time: "07:00 AM - 11:00 AM",
    expected_volunteers: 40,
    support_requested: "1 Tipper Truck at 10:30 AM to collect plastic waste",
    status: "Pending Review",
  },
  {
    id: "EVT-103",
    title: "Kochchikade Market Area Litter Clearing",
    organizer_type: "Citizen",
    organizer_name: "Kochchikade Traders Association",
    organizer_contact: "071 889 2211",
    location: "Old Railway Station Road",
    zone: "Kochchikade",
    event_date: "Aug 15, 2026",
    event_time: "06:00 AM - 09:00 AM",
    expected_volunteers: 25,
    assigned_support_truck: "WP CAD-7743 (TRK-02)",
    support_requested: "Municipal Tractor Loader Assistance",
    status: "Completed",
  },
];

const fallbackSchedules: ScheduleItem[] = [
  {
    id: "SCH-101",
    day: 1,
    route_code: "Route A-12",
    service_area: "Sector A - Negombo North",
    date_str: "Aug 01, 2026",
    time_slot: "06:00 AM - 10:00 AM",
    vehicle: "WP CAB-4521 (TRK-01)",
    driver_team: "Team Alpha (S. Perera)",
    waste_type: "Organic",
    status: "Completed",
  },
  {
    id: "SCH-102",
    day: 3,
    route_code: "Route B-04",
    service_area: "Sector B - Commercial Hub",
    date_str: "Aug 03, 2026",
    time_slot: "08:30 AM - 12:00 PM",
    vehicle: "WP CAD-7743 (TRK-02)",
    driver_team: "Team Beta (K. Fernando)",
    waste_type: "Recyclables",
    status: "Completed",
  },
  {
    id: "SCH-103",
    day: 8,
    route_code: "Route C-09",
    service_area: "Industrial Zone West",
    date_str: "Aug 08, 2026",
    time_slot: "01:00 PM - 03:30 PM",
    vehicle: "WP CAE-1290 (TRK-03)",
    driver_team: "Hazmat Crew (M. Silva)",
    waste_type: "Hazardous",
    status: "Completed",
  },
  {
    id: "SCH-104",
    day: 14,
    route_code: "Route D-01",
    service_area: "Sector D - Residential Zone",
    date_str: "Aug 14, 2026",
    time_slot: "06:00 AM - 11:00 AM",
    vehicle: "WP CAB-4521 (TRK-01)",
    driver_team: "Team Alpha (S. Perera)",
    waste_type: "General",
    status: "In Progress",
  },
];

const fallbackTransactions: PaymentTransaction[] = [
  {
    id: "TRX-8924",
    type: "Service Fee",
    payer_entity: "Downtown Commercial Complex",
    amount: 45000,
    date: "Aug 14, 2026",
    status: "Completed",
    payment_method: "Online Banking",
  },
  {
    id: "TRX-8923",
    type: "Marketplace Sale",
    payer_entity: "EcoRecycling Lanka Corp",
    amount: 11250,
    date: "Aug 14, 2026",
    status: "Pending",
    payment_method: "Credit/Debit Card",
  },
  {
    id: "TRX-8922",
    type: "Penalty / Fine",
    payer_entity: "Industrial Sector B - Unit 4",
    amount: 15000,
    date: "Aug 13, 2026",
    status: "Completed",
    payment_method: "Cash Deposit",
  },
];

const fallbackReports: ReportItem[] = [
  {
    id: "REP-2026-081",
    name: "Q3 FY26 Comprehensive Waste & Landfill Audit",
    category: "Audit",
    format: "PDF",
    date_generated: "Aug 14, 2026",
    size: "4.8 MB",
    generated_by: "Admin Sarah Johnson",
  },
  {
    id: "REP-2026-082",
    name: "August Vehicle Route Efficiency & Fuel Consumption",
    category: "Fleet & Routes",
    format: "Excel",
    date_generated: "Aug 12, 2026",
    size: "2.1 MB",
    generated_by: "Logistics Dept",
  },
];

const fallbackSettings: SystemSettings = {
  municipality_name: "Colombo Municipal Council",
  contact_email: "admin@colombo-waste.gov.lk",
  contact_phone: "+94 11 269 1111",
  timezone: "Asia/Colombo (UTC+05:30)",
  address: "Town Hall, Colombo 07, Sri Lanka",
  currency: "LKR (Rs.)",
  email_alerts: true,
  sms_dispatches: true,
  auto_notify_citizen: true,
  dumping_hotspot_alert: true,
  maintenance_alert: true,
  google_maps_api_key: "AIzaSyD-mock_google_maps_key_99214",
  sms_gateway_api_key: "mock_mobitel_dialog_sms_gateway_sec_key",
  gps_sync_interval: "30 seconds",
};

// ================= API SERVICE FUNCTIONS =================

// ----- RESIDENTS -----
export async function getResidents(): Promise<Resident[]> {
  try {
    const { data, error } = await supabase.from("residents").select("*");
    if (error || !data || data.length === 0) return fallbackResidents;
    return data as Resident[];
  } catch (err) {
    console.warn("Supabase fetch error, using fallback residents", err);
    return fallbackResidents;
  }
}

export async function addResident(resident: Omit<Resident, "id"> & { id?: string }): Promise<Resident> {
  const newRecord: Resident = {
    ...resident,
    id: resident.id || `USR-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("residents").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as Resident;
  } catch (err) {
    console.warn("Supabase insert error, using local record", err);
    return newRecord;
  }
}

export async function updateResidentStatus(id: string, status: Resident["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("residents").update({ status }).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase update status error", err);
    return false;
  }
}

// ----- COLLECTORS -----
export async function getCollectors(): Promise<Collector[]> {
  try {
    const { data, error } = await supabase.from("collectors").select("*");
    if (error || !data || data.length === 0) return fallbackCollectors;
    return data as Collector[];
  } catch (err) {
    console.warn("Supabase collectors fetch error", err);
    return fallbackCollectors;
  }
}

export async function addCollector(collector: Omit<Collector, "id"> & { id?: string }): Promise<Collector> {
  const newRecord: Collector = {
    ...collector,
    id: collector.id || `COL-${Math.floor(10 + Math.random() * 90)}`,
  };
  try {
    const { data, error } = await supabase.from("collectors").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as Collector;
  } catch (err) {
    console.warn("Supabase collector insert error", err);
    return newRecord;
  }
}

export async function deleteCollector(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("collectors").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase delete collector error", err);
    return false;
  }
}

// ----- TRUCKS / FLEET -----
export async function getTrucks(): Promise<Truck[]> {
  try {
    const { data, error } = await supabase.from("trucks").select("*");
    if (error || !data || data.length === 0) return fallbackTrucks;
    return data as Truck[];
  } catch (err) {
    console.warn("Supabase trucks fetch error", err);
    return fallbackTrucks;
  }
}

export async function addTruck(truck: Omit<Truck, "id"> & { id?: string }): Promise<Truck> {
  const newRecord: Truck = {
    ...truck,
    id: truck.id || `TRK-${Math.floor(10 + Math.random() * 90)}`,
  };
  try {
    const { data, error } = await supabase.from("trucks").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as Truck;
  } catch (err) {
    console.warn("Supabase truck insert error", err);
    return newRecord;
  }
}

export async function updateTruckStatus(id: string, status: Truck["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("trucks").update({ status }).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase truck status update error", err);
    return false;
  }
}

export async function deleteTruck(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("trucks").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase truck delete error", err);
    return false;
  }
}

// ----- COMPLAINTS -----
export async function getComplaints(): Promise<Complaint[]> {
  try {
    const { data, error } = await supabase.from("complaints").select("*");
    if (error || !data || data.length === 0) return fallbackComplaints;
    return data as Complaint[];
  } catch (err) {
    console.warn("Supabase complaints fetch error", err);
    return fallbackComplaints;
  }
}

export async function updateComplaintStatus(id: string, status: Complaint["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase complaint update error", err);
    return false;
  }
}

// ----- DUMPING REPORTS -----
export async function getDumpingReports(): Promise<DumpingReport[]> {
  try {
    const { data, error } = await supabase.from("dumping_reports").select("*");
    if (error || !data || data.length === 0) return fallbackDumpingReports;
    return data as DumpingReport[];
  } catch (err) {
    console.warn("Supabase dumping reports fetch error", err);
    return fallbackDumpingReports;
  }
}

export async function addDumpingReport(report: Omit<DumpingReport, "id"> & { id?: string }): Promise<DumpingReport> {
  const newRecord: DumpingReport = {
    ...report,
    id: report.id || `DMP-${Math.floor(200 + Math.random() * 800)}`,
  };
  try {
    const { data, error } = await supabase.from("dumping_reports").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as DumpingReport;
  } catch (err) {
    console.warn("Supabase dumping report insert error", err);
    return newRecord;
  }
}

export async function updateDumpingStatus(id: string, status: DumpingReport["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("dumping_reports").update({ status }).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase dumping report status error", err);
    return false;
  }
}

// ----- MARKETPLACE LISTINGS -----
export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  try {
    const { data, error } = await supabase.from("marketplace_listings").select("*");
    if (error || !data || data.length === 0) return fallbackMarketplaceListings;
    return data as MarketplaceListing[];
  } catch (err) {
    console.warn("Supabase marketplace fetch error", err);
    return fallbackMarketplaceListings;
  }
}

export async function addMarketplaceListing(
  listing: Omit<MarketplaceListing, "id"> & { id?: string }
): Promise<MarketplaceListing> {
  const newRecord: MarketplaceListing = {
    ...listing,
    id: listing.id || `LST-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("marketplace_listings").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as MarketplaceListing;
  } catch (err) {
    console.warn("Supabase marketplace insert error", err);
    return newRecord;
  }
}

export async function deleteMarketplaceListing(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase marketplace delete error", err);
    return false;
  }
}

// ----- COMMUNITY EVENTS -----
export async function getCommunityEvents(): Promise<CommunityEvent[]> {
  try {
    const { data, error } = await supabase.from("community_events").select("*");
    if (error || !data || data.length === 0) return fallbackCommunityEvents;
    return data as CommunityEvent[];
  } catch (err) {
    console.warn("Supabase community events fetch error", err);
    return fallbackCommunityEvents;
  }
}

export async function addCommunityEvent(event: Omit<CommunityEvent, "id"> & { id?: string }): Promise<CommunityEvent> {
  const newRecord: CommunityEvent = {
    ...event,
    id: event.id || `EVT-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("community_events").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as CommunityEvent;
  } catch (err) {
    console.warn("Supabase community event insert error", err);
    return newRecord;
  }
}

export async function updateCommunityEventStatus(
  id: string,
  status: CommunityEvent["status"],
  assigned_support_truck?: string
): Promise<boolean> {
  try {
    const payload: Partial<CommunityEvent> = { status };
    if (assigned_support_truck) payload.assigned_support_truck = assigned_support_truck;
    const { error } = await supabase.from("community_events").update(payload).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase community event update error", err);
    return false;
  }
}

// ----- SCHEDULES -----
export async function getSchedules(): Promise<ScheduleItem[]> {
  try {
    const { data, error } = await supabase.from("schedules").select("*");
    if (error || !data || data.length === 0) return fallbackSchedules;
    return data as ScheduleItem[];
  } catch (err) {
    console.warn("Supabase schedules fetch error", err);
    return fallbackSchedules;
  }
}

export async function addSchedule(item: Omit<ScheduleItem, "id"> & { id?: string }): Promise<ScheduleItem> {
  const newRecord: ScheduleItem = {
    ...item,
    id: item.id || `SCH-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("schedules").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as ScheduleItem;
  } catch (err) {
    console.warn("Supabase schedule insert error", err);
    return newRecord;
  }
}

export async function updateScheduleStatus(id: string, status: ScheduleItem["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("schedules").update({ status }).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase schedule status error", err);
    return false;
  }
}

// ----- PAYMENTS -----
export async function getTransactions(): Promise<PaymentTransaction[]> {
  try {
    const { data, error } = await supabase.from("payment_transactions").select("*");
    if (error || !data || data.length === 0) return fallbackTransactions;
    return data as PaymentTransaction[];
  } catch (err) {
    console.warn("Supabase transactions fetch error", err);
    return fallbackTransactions;
  }
}

export async function addTransaction(
  trx: Omit<PaymentTransaction, "id"> & { id?: string }
): Promise<PaymentTransaction> {
  const newRecord: PaymentTransaction = {
    ...trx,
    id: trx.id || `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
  };
  try {
    const { data, error } = await supabase.from("payment_transactions").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as PaymentTransaction;
  } catch (err) {
    console.warn("Supabase transaction insert error", err);
    return newRecord;
  }
}

export async function updateTransactionStatus(
  id: string,
  status: PaymentTransaction["status"]
): Promise<boolean> {
  try {
    const { error } = await supabase.from("payment_transactions").update({ status }).eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase transaction status error", err);
    return false;
  }
}

// ----- REPORTS -----
export async function getReports(): Promise<ReportItem[]> {
  try {
    const { data, error } = await supabase.from("reports").select("*");
    if (error || !data || data.length === 0) return fallbackReports;
    return data as ReportItem[];
  } catch (err) {
    console.warn("Supabase reports fetch error", err);
    return fallbackReports;
  }
}

export async function addReport(rep: Omit<ReportItem, "id"> & { id?: string }): Promise<ReportItem> {
  const newRecord: ReportItem = {
    ...rep,
    id: rep.id || `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("reports").insert([newRecord]).select().single();
    if (error || !data) return newRecord;
    return data as ReportItem;
  } catch (err) {
    console.warn("Supabase report insert error", err);
    return newRecord;
  }
}

export async function deleteReport(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase report delete error", err);
    return false;
  }
}

// ----- SYSTEM SETTINGS -----
export async function getSettings(): Promise<SystemSettings> {
  try {
    const { data, error } = await supabase.from("system_settings").select("*").limit(1).single();
    if (error || !data) return fallbackSettings;
    return data as SystemSettings;
  } catch (err) {
    console.warn("Supabase settings fetch error", err);
    return fallbackSettings;
  }
}

export async function updateSettings(settings: SystemSettings): Promise<boolean> {
  try {
    const { error } = await supabase.from("system_settings").upsert([settings]);
    return !error;
  } catch (err) {
    console.warn("Supabase settings update error", err);
    return false;
  }
}
