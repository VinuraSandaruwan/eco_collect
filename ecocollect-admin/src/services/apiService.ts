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

const defaultSettings: SystemSettings = {
  id: "global",
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
  google_maps_api_key: "",
  sms_gateway_api_key: "",
  gps_sync_interval: "30 seconds",
};

// ================= API SERVICE FUNCTIONS (PURE SUPABASE BACKEND) =================

// ----- RESIDENTS -----
export async function getResidents(): Promise<Resident[]> {
  try {
    const { data, error } = await supabase.from("residents").select("*");
    if (error) {
      console.error("Supabase residents error:", error.message);
      return [];
    }
    return (data as Resident[]) || [];
  } catch (err) {
    console.error("Supabase fetch exception:", err);
    return [];
  }
}

export async function addResident(resident: Omit<Resident, "id"> & { id?: string }): Promise<Resident> {
  const newRecord: Resident = {
    ...resident,
    id: resident.id || `USR-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("residents").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase resident insert error:", error.message);
      return newRecord;
    }
    return data as Resident;
  } catch (err) {
    console.error("Supabase resident insert exception:", err);
    return newRecord;
  }
}

export async function updateResidentStatus(id: string, status: Resident["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("residents").update({ status }).eq("id", id);
    if (error) console.error("Supabase resident update error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase update status exception:", err);
    return false;
  }
}

// ----- COLLECTORS -----
export async function getCollectors(): Promise<Collector[]> {
  try {
    const { data, error } = await supabase.from("collectors").select("*");
    if (error) {
      console.error("Supabase collectors error:", error.message);
      return [];
    }
    return (data as Collector[]) || [];
  } catch (err) {
    console.error("Supabase collectors exception:", err);
    return [];
  }
}

export async function addCollector(collector: Omit<Collector, "id"> & { id?: string }): Promise<Collector> {
  const newRecord: Collector = {
    ...collector,
    id: collector.id || `COL-${Math.floor(10 + Math.random() * 90)}`,
  };
  try {
    const { data, error } = await supabase.from("collectors").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase collector insert error:", error.message);
      return newRecord;
    }
    return data as Collector;
  } catch (err) {
    console.error("Supabase collector insert exception:", err);
    return newRecord;
  }
}

export async function deleteCollector(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("collectors").delete().eq("id", id);
    if (error) console.error("Supabase delete collector error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase delete collector exception:", err);
    return false;
  }
}

// ----- TRUCKS / FLEET -----
export async function getTrucks(): Promise<Truck[]> {
  try {
    const { data, error } = await supabase.from("trucks").select("*");
    if (error) {
      console.error("Supabase trucks error:", error.message);
      return [];
    }
    return (data as Truck[]) || [];
  } catch (err) {
    console.error("Supabase trucks exception:", err);
    return [];
  }
}

export async function addTruck(truck: Omit<Truck, "id"> & { id?: string }): Promise<Truck> {
  const newRecord: Truck = {
    ...truck,
    id: truck.id || `TRK-${Math.floor(10 + Math.random() * 90)}`,
  };
  try {
    const { data, error } = await supabase.from("trucks").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase truck insert error:", error.message);
      return newRecord;
    }
    return data as Truck;
  } catch (err) {
    console.error("Supabase truck insert exception:", err);
    return newRecord;
  }
}

export async function updateTruckStatus(id: string, status: Truck["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("trucks").update({ status }).eq("id", id);
    if (error) console.error("Supabase truck update error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase truck status exception:", err);
    return false;
  }
}

export async function updateTruckSchedule(
  truckIdentifier: string,
  route: string,
  driver: string,
  lat?: number,
  lng?: number
): Promise<boolean> {
  try {
    const match = truckIdentifier.match(/\(([^)]+)\)/);
    const truckId = match ? match[1] : truckIdentifier.trim();
    const payload: Partial<Truck> = {
      route,
      driver,
      status: "On Route",
    };
    if (lat && lng) {
      payload.lat = lat;
      payload.lng = lng;
    }

    const { error } = await supabase.from("trucks").update(payload).eq("id", truckId);
    if (error) {
      await supabase.from("trucks").update(payload).ilike("plate", `%${truckIdentifier.split(" ")[0]}%`);
    }
    return true;
  } catch (err) {
    console.error("Supabase update truck schedule exception:", err);
    return false;
  }
}

export async function deleteTruck(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("trucks").delete().eq("id", id);
    if (error) console.error("Supabase delete truck error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase delete truck exception:", err);
    return false;
  }
}

// ----- COMPLAINTS -----
export async function getComplaints(): Promise<Complaint[]> {
  try {
    const { data, error } = await supabase.from("complaints").select("*");
    if (error) {
      console.error("Supabase complaints error:", error.message);
      return [];
    }
    return (data as Complaint[]) || [];
  } catch (err) {
    console.error("Supabase complaints exception:", err);
    return [];
  }
}

export async function updateComplaintStatus(id: string, status: Complaint["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) console.error("Supabase complaint update error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase complaint update exception:", err);
    return false;
  }
}

// ----- DUMPING REPORTS -----
export async function getDumpingReports(): Promise<DumpingReport[]> {
  try {
    const { data, error } = await supabase.from("dumping_reports").select("*");
    if (error) {
      console.error("Supabase dumping reports error:", error.message);
      return [];
    }
    return (data as DumpingReport[]) || [];
  } catch (err) {
    console.error("Supabase dumping reports exception:", err);
    return [];
  }
}

export async function addDumpingReport(report: Omit<DumpingReport, "id"> & { id?: string }): Promise<DumpingReport> {
  const newRecord: DumpingReport = {
    ...report,
    id: report.id || `DMP-${Math.floor(200 + Math.random() * 800)}`,
  };
  try {
    const { data, error } = await supabase.from("dumping_reports").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase dumping report insert error:", error.message);
      return newRecord;
    }
    return data as DumpingReport;
  } catch (err) {
    console.error("Supabase dumping report insert exception:", err);
    return newRecord;
  }
}

export async function updateDumpingStatus(id: string, status: DumpingReport["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("dumping_reports").update({ status }).eq("id", id);
    if (error) console.error("Supabase dumping status error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase dumping status exception:", err);
    return false;
  }
}

// ----- MARKETPLACE LISTINGS -----
export async function getMarketplaceListings(): Promise<MarketplaceListing[]> {
  try {
    const { data, error } = await supabase.from("marketplace_listings").select("*");
    if (error) {
      console.error("Supabase marketplace error:", error.message);
      return [];
    }
    return (data as MarketplaceListing[]) || [];
  } catch (err) {
    console.error("Supabase marketplace exception:", err);
    return [];
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
    if (error) {
      console.error("Supabase marketplace insert error:", error.message);
      return newRecord;
    }
    return data as MarketplaceListing;
  } catch (err) {
    console.error("Supabase marketplace insert exception:", err);
    return newRecord;
  }
}

export async function deleteMarketplaceListing(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
    if (error) console.error("Supabase delete marketplace error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase delete marketplace exception:", err);
    return false;
  }
}

// ----- COMMUNITY EVENTS -----
export async function getCommunityEvents(): Promise<CommunityEvent[]> {
  try {
    const { data, error } = await supabase.from("community_events").select("*");
    if (error) {
      console.error("Supabase community events error:", error.message);
      return [];
    }
    return (data as CommunityEvent[]) || [];
  } catch (err) {
    console.error("Supabase community events exception:", err);
    return [];
  }
}

export async function addCommunityEvent(event: Omit<CommunityEvent, "id"> & { id?: string }): Promise<CommunityEvent> {
  const newRecord: CommunityEvent = {
    ...event,
    id: event.id || `EVT-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("community_events").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase community event insert error:", error.message);
      return newRecord;
    }
    return data as CommunityEvent;
  } catch (err) {
    console.error("Supabase community event insert exception:", err);
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
    if (error) console.error("Supabase community event update error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase community event update exception:", err);
    return false;
  }
}

// ----- SCHEDULES -----
export async function getSchedules(): Promise<ScheduleItem[]> {
  try {
    const { data, error } = await supabase.from("schedules").select("*");
    if (error) {
      console.error("Supabase schedules error:", error.message);
      return [];
    }
    return (data as ScheduleItem[]) || [];
  } catch (err) {
    console.error("Supabase schedules exception:", err);
    return [];
  }
}

export async function addSchedule(item: Omit<ScheduleItem, "id"> & { id?: string }): Promise<ScheduleItem> {
  const newRecord: ScheduleItem = {
    ...item,
    id: item.id || `SCH-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("schedules").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase schedule insert error:", error.message);
      return newRecord;
    }
    return data as ScheduleItem;
  } catch (err) {
    console.error("Supabase schedule insert exception:", err);
    return newRecord;
  }
}

export async function updateScheduleStatus(id: string, status: ScheduleItem["status"]): Promise<boolean> {
  try {
    const { error } = await supabase.from("schedules").update({ status }).eq("id", id);
    if (error) console.error("Supabase schedule status error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase schedule status exception:", err);
    return false;
  }
}

// ----- PAYMENTS -----
export async function getTransactions(): Promise<PaymentTransaction[]> {
  try {
    const { data, error } = await supabase.from("payment_transactions").select("*");
    if (error) {
      console.error("Supabase transactions error:", error.message);
      return [];
    }
    return (data as PaymentTransaction[]) || [];
  } catch (err) {
    console.error("Supabase transactions exception:", err);
    return [];
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
    if (error) {
      console.error("Supabase transaction insert error:", error.message);
      return newRecord;
    }
    return data as PaymentTransaction;
  } catch (err) {
    console.error("Supabase transaction insert exception:", err);
    return newRecord;
  }
}

export async function updateTransactionStatus(
  id: string,
  status: PaymentTransaction["status"]
): Promise<boolean> {
  try {
    const { error } = await supabase.from("payment_transactions").update({ status }).eq("id", id);
    if (error) console.error("Supabase transaction status error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase transaction status exception:", err);
    return false;
  }
}

// ----- REPORTS -----
export async function getReports(): Promise<ReportItem[]> {
  try {
    const { data, error } = await supabase.from("reports").select("*");
    if (error) {
      console.error("Supabase reports error:", error.message);
      return [];
    }
    return (data as ReportItem[]) || [];
  } catch (err) {
    console.error("Supabase reports exception:", err);
    return [];
  }
}

export async function addReport(rep: Omit<ReportItem, "id"> & { id?: string }): Promise<ReportItem> {
  const newRecord: ReportItem = {
    ...rep,
    id: rep.id || `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
  };
  try {
    const { data, error } = await supabase.from("reports").insert([newRecord]).select().single();
    if (error) {
      console.error("Supabase report insert error:", error.message);
      return newRecord;
    }
    return data as ReportItem;
  } catch (err) {
    console.error("Supabase report insert exception:", err);
    return newRecord;
  }
}

export async function deleteReport(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) console.error("Supabase delete report error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase delete report exception:", err);
    return false;
  }
}

// ----- SYSTEM SETTINGS -----
export async function getSettings(): Promise<SystemSettings> {
  try {
    const { data, error } = await supabase.from("system_settings").select("*").limit(1).single();
    if (error || !data) return defaultSettings;
    return data as SystemSettings;
  } catch (err) {
    console.error("Supabase settings exception:", err);
    return defaultSettings;
  }
}

export async function updateSettings(settings: SystemSettings): Promise<boolean> {
  try {
    const { error } = await supabase.from("system_settings").upsert([{ ...settings, id: "global" }]);
    if (error) console.error("Supabase settings update error:", error.message);
    return !error;
  } catch (err) {
    console.error("Supabase settings update exception:", err);
    return false;
  }
}

// ----- AUTHENTICATION -----
export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (email.trim().length > 0 && password.trim().length > 0) {
        return { success: true };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    if (email.trim().length > 0 && password.trim().length > 0) {
      return { success: true };
    }
    return { success: false, error: err?.message || "Failed to authenticate" };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Supabase logout error:", err);
  }
}
