/**
 * Demo inventory for the "search whole project" experience. Data Products are
 * live from the API; these other asset types are representative demo records.
 */

export interface CatalogEntry {
  name: string;
  type: 'Table' | 'View';
  domain: string;
  description: string;
}

export interface DataSetEntry {
  name: string;
  description: string;
  rows: string;
  refreshed: string;
}

export interface ApplicationEntry {
  name: string;
  description: string;
  owner: string;
  status: 'Live' | 'In Development';
}

export interface ConnectionEntry {
  name: string;
  type: string;
  description: string;
  status: 'Connected' | 'Disconnected';
}

export const catalogEntries: CatalogEntry[] = [
  { name: 'dim_dealer_master', type: 'Table', domain: 'Sales', description: 'Dealer master dimension with region and zone hierarchy' },
  { name: 'fct_vehicle_sales_daily', type: 'Table', domain: 'Sales', description: 'Daily vehicle sales facts by model, variant and dealer' },
  { name: 'dim_vehicle_model', type: 'Table', domain: 'Engineering', description: 'Vehicle model and variant dimension' },
  { name: 'vw_customer_bookings', type: 'View', domain: 'Sales', description: 'Consolidated customer bookings across channels' },
  { name: 'fct_service_appointments', type: 'Table', domain: 'Service', description: 'Workshop service appointment facts' },
  { name: 'vw_dealer_inventory_snapshot', type: 'View', domain: 'Supply Chain', description: 'Daily dealer stock snapshot by model' },
  { name: 'dim_supplier_master', type: 'Table', domain: 'Supply Chain', description: 'Tier-1 supplier master with plant mapping' },
  { name: 'fct_warranty_claims', type: 'Table', domain: 'Quality', description: 'Warranty claim facts with defect codes' },
];

export const dataSets: DataSetEntry[] = [
  { name: 'vehicle_sales_2026_q2', description: 'Quarterly extract of vehicle sales for FY26 Q2 analysis', rows: '4.2M', refreshed: '12 Aug 2026' },
  { name: 'dealer_footfall_survey', description: 'Dealer showroom footfall survey responses', rows: '86K', refreshed: '01 Aug 2026' },
  { name: 'customer_nps_raw_responses', description: 'Raw NPS survey responses before scoring', rows: '312K', refreshed: '10 Aug 2026' },
  { name: 'ev_charging_sessions_2026', description: 'EV charging session logs from partner networks', rows: '1.1M', refreshed: '13 Aug 2026' },
  { name: 'spare_parts_price_list', description: 'Master price list of spare parts and accessories', rows: '58K', refreshed: '05 Aug 2026' },
  { name: 'service_campaign_targets', description: 'Vehicles targeted for active service campaigns', rows: '240K', refreshed: '09 Aug 2026' },
];

export const applications: ApplicationEntry[] = [
  { name: 'Dealer 360 Dashboard', description: 'Dealer performance and inventory dashboard for zone teams', owner: 'S. Rao', status: 'Live' },
  { name: 'Network Insight', description: 'Dealer network expansion planning application', owner: 'A. Sharma', status: 'Live' },
  { name: 'Service Booking Portal', description: 'Customer-facing workshop appointment booking', owner: 'K. Mehta', status: 'Live' },
  { name: 'Quality Watchtower', description: 'Early-warning app on warranty and defect trends', owner: 'R. Iyer', status: 'In Development' },
  { name: 'EV Charge Planner', description: 'Charging infrastructure planning for EV rollout', owner: 'P. Nair', status: 'In Development' },
];

export const connections: ConnectionEntry[] = [
  { name: 'SAP S/4HANA Production', type: 'SAP', description: 'ERP source for material and plant data', status: 'Connected' },
  { name: 'Dealer DMS Postgres', type: 'Postgres', description: 'Dealer management system replica', status: 'Connected' },
  { name: 'Salesforce CRM', type: 'Salesforce', description: 'Customer and lead data from CRM', status: 'Connected' },
  { name: 'Kafka Telemetry Stream', type: 'Kafka', description: 'Connected-car telemetry event stream', status: 'Connected' },
  { name: 'S3 Data Lake Landing', type: 'S3', description: 'Raw file landing zone for batch loads', status: 'Connected' },
  { name: 'Legacy Oracle DWH', type: 'Oracle', description: 'Legacy warehouse (read-only, being retired)', status: 'Disconnected' },
];
