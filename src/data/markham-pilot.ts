/**
 * Markham pilot market model for the pitch deck.
 *
 * Verified base figures cite Statistics Canada 2021 Census.
 * Assumptions are labeled as such and are not verified claims.
 *
 * Physical chain: 100% usable roof PV → excess after household load →
 * mixed-fleet GPUs sized by wall draw → aggregate VRAM + avoided DC impacts.
 *
 * Stock vs annual: installed CAPEX is not summed with yearly transaction.
 * Excess kWh is not priced as energy sales; it powers the compute Bedrock flow.
 */

export const markhamBase = {
  city: "Markham, Ontario",
  population: 338_503,
  privateHouseholds: 110_870,
  occupiedDwellings: 110_867,
  /** Single-detached share of occupied private dwellings (Focus on Geography). */
  singleDetachedShare: 0.562,
  singleDetachedHomes: 62_270,
  sources: {
    households: "Statistics Canada, 2021 Census of Population",
    structure:
      "Statistics Canada, Focus on Geography Series 2021, Markham (CSD)",
    roof:
      "NRCan CanmetENERGY, Assessing the photovoltaic potential of the Canadian building stock (avg single-detached technical potential)",
    householdLoad:
      "Ontario Energy Board, Defining Ontario's Typical Electricity Residential Customer (Dec 2023), 750 kWh/mo",
    oebTypicalBill:
      "Ontario Energy Board, Defining Ontario's Typical Electricity Residential Customer (Dec 2023), TOU total amount $129.74 at 750 kWh",
    tou:
      "Ontario Energy Board, Regulated Price Plan TOU prices effective 1 November 2025",
  },
} as const;

/** Labeled assumptions; not verified. Edit here to recompute scenarios. */
export const markhamAssumptions = {
  /** Usable/suitable roof area for 100% coverage (NRCan avg single-detached). */
  usableRoofM2: 110,
  /** ~190 W/m² ≈ 17 W/sq ft planning density → ~21 kW on 110 m². */
  pvWPerM2: 190.9,
  /** Midpoint of the 10 to 15 kWh residential BESS band. */
  bessKwhPerHome: 12.5,
  bessKwhMin: 10,
  bessKwhMax: 15,
  /** Southern Ontario rooftop ballpark, kWh per kW-year. */
  yieldKwhPerKwYear: 1_150,
  /** OEB typical residential customer. */
  householdKwhYear: 9_000,
  /** Energy-side wall-draw sizing (3090-class); purchase mix is separate. */
  gpuWallKw: 0.4,
  gpuVramGb: 24,
  usedGpuCad: 800,
  currentGenGpuCad: 3_200,
  /** Share of fleet purchased as used 3090-class (rest current-gen). */
  usedGpuShare: 0.5,
  /**
   * AWS Bedrock frontier-class proxy (Claude Sonnet on-demand).
   * GPT-5-class proprietary models are not on Bedrock; Sonnet is the
   * labeled Bedrock stand-in. Mixed fleet cannot all run frontier serving;
   * throughput is derated vs a 3090-only full-proxy case.
   */
  bedrockUsdPerMTokInput: 3,
  bedrockUsdPerMTokOutput: 15,
  bedrockInputShare: 0.8,
  /** Derated sustained tokens/sec (was 40 on a used-only frontier proxy). */
  tokensPerSecPerGpu: 28,
  gpuUtilization: 0.4,
  usdToCad: 1.35,
  /** Illustrative CAPEX, CAD (energy assets). */
  pvCadPerW: 2.9,
  bessCadPerKwh: 1_000,
  /** OEB typical TOU bill after rebate, Dec 2023 sample. */
  oebTypicalBillCad: 129.74,
  oebTypicalKwhMonth: 750,
  /** OEB TOU commodity, Nov 2025 RPP (CAD/kWh). */
  touOnPeakCadPerKwh: 0.203,
  touOffPeakCadPerKwh: 0.098,
  bessCyclesPerDay: 1,
  /** Dirty-grid DC ops comparator (illustrative US-average). */
  usGridGCo2PerKwh: 400,
  /** Industry-average evaporative facility WUE (L per kWh IT). */
  facilityWueLPerKwh: 1.85,
  /** Pembina illustrative Canadian coal intensity (kg CO2e/MWh). */
  coalKgCo2ePerMwh: 1_070,
} as const;

/** Derived PV kW per home from full usable roof coverage. */
export const pvKwPerHome =
  (markhamAssumptions.usableRoofM2 * markhamAssumptions.pvWPerM2) / 1_000;

export const hoursPerYear = 8_760;

export const oebAllInCadPerKwh =
  markhamAssumptions.oebTypicalBillCad /
  markhamAssumptions.oebTypicalKwhMonth;

export const touSpreadCadPerKwh =
  markhamAssumptions.touOnPeakCadPerKwh -
  markhamAssumptions.touOffPeakCadPerKwh;

export const blendedGpuCad = Math.round(
  markhamAssumptions.usedGpuShare * markhamAssumptions.usedGpuCad +
    (1 - markhamAssumptions.usedGpuShare) *
      markhamAssumptions.currentGenGpuCad,
);

/** Gemini / calculator-style H100-class reference cluster for VRAM compare. */
export const dcReference = {
  gpuCount: 1_000,
  vramGbPerGpu: 80,
  wallKwPerGpu: 1.05,
  gridGCo2PerKwh: 400,
} as const;

export type ScenarioId = "exploratory" | "conservative" | "scale";

export interface AssetLedger {
  /** Installed CAPEX (CAD). */
  stock: number;
  /** Gross yearly transaction (CAD/yr). */
  annual: number;
  /** annual / stock (fraction). */
  txOnStock: number;
}

export interface MarkhamScenario {
  id: ScenarioId;
  label: string;
  penetration: number;
  nodes: number;
  aggregatePvMw: number;
  aggregateBessMwh: number;
  annualEnergyGwh: number;
  householdOffsetGwh: number;
  bessCycleGwh: number;
  excessEnergyGwh: number;
  meanSurplusMw: number;
  gpuCount: number;
  aggregateVramGb: number;
  aggregateVramPb: number;
  opsCo2eTonnesUsGrid: number;
  facilityWaterMl: number;
  coalPathCo2eTonnes: number;
  valuations: {
    pv: AssetLedger;
    bess: AssetLedger;
    compute: AssetLedger;
  };
}

function round(n: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function ledger(stock: number, annual: number): AssetLedger {
  return {
    stock,
    annual,
    txOnStock: stock > 0 ? annual / stock : 0,
  };
}

const annualGenKwhPerHome =
  pvKwPerHome * markhamAssumptions.yieldKwhPerKwYear;
const excessKwhPerHome = Math.max(
  0,
  annualGenKwhPerHome - markhamAssumptions.householdKwhYear,
);
const meanSurplusKwPerHome = excessKwhPerHome / hoursPerYear;
const gpusPerHome = Math.floor(
  meanSurplusKwPerHome / markhamAssumptions.gpuWallKw,
);

const bedrockBlendUsdPerMTok =
  markhamAssumptions.bedrockInputShare *
    markhamAssumptions.bedrockUsdPerMTokInput +
  (1 - markhamAssumptions.bedrockInputShare) *
    markhamAssumptions.bedrockUsdPerMTokOutput;

const annualMTokPerGpu =
  (markhamAssumptions.tokensPerSecPerGpu *
    markhamAssumptions.gpuUtilization *
    hoursPerYear *
    3_600) /
  1_000_000;

const bedrockCadPerGpuYear = Math.round(
  annualMTokPerGpu * bedrockBlendUsdPerMTok * markhamAssumptions.usdToCad,
);

const bessKwhCycledPerHomeYear =
  markhamAssumptions.bessKwhPerHome *
  markhamAssumptions.bessCyclesPerDay *
  365;

export function scenarioFromPenetration(
  id: ScenarioId,
  label: string,
  penetration: number,
): MarkhamScenario {
  const nodes = Math.round(markhamBase.singleDetachedHomes * penetration);
  const aggregatePvKw = nodes * pvKwPerHome;
  const aggregatePvMw = round(aggregatePvKw / 1_000, 1);
  const aggregateBessMwh = round(
    (nodes * markhamAssumptions.bessKwhPerHome) / 1_000,
    1,
  );
  const annualEnergyGwh = round(
    (aggregatePvKw * markhamAssumptions.yieldKwhPerKwYear) / 1_000_000,
    1,
  );
  const householdOffsetGwh = round(
    (nodes * markhamAssumptions.householdKwhYear) / 1_000_000,
    1,
  );
  const bessCycleGwh = round(
    (nodes * bessKwhCycledPerHomeYear) / 1_000_000,
    2,
  );
  const excessEnergyGwh = round((nodes * excessKwhPerHome) / 1_000_000, 1);
  const meanSurplusMw = round((nodes * meanSurplusKwPerHome) / 1_000, 2);
  const gpuCount = nodes * gpusPerHome;
  const aggregateVramGb = gpuCount * markhamAssumptions.gpuVramGb;
  const aggregateVramPb = round(aggregateVramGb / 1_000_000, 3);
  const opsCo2eTonnesUsGrid = Math.round(
    (nodes * excessKwhPerHome * markhamAssumptions.usGridGCo2PerKwh) /
      1_000_000,
  );
  const facilityWaterMl = round(
    (nodes * excessKwhPerHome * markhamAssumptions.facilityWueLPerKwh) /
      1_000_000,
    1,
  );
  const coalPathCo2eTonnes = Math.round(
    (annualEnergyGwh * 1_000 * markhamAssumptions.coalKgCo2ePerMwh) / 1_000,
  );
  const pvStock = Math.round(
    aggregatePvKw * 1_000 * markhamAssumptions.pvCadPerW,
  );
  const bessStock = Math.round(
    nodes * markhamAssumptions.bessKwhPerHome * markhamAssumptions.bessCadPerKwh,
  );
  const computeStock = Math.round(gpuCount * blendedGpuCad);
  const pvAnnual = Math.round(
    nodes * markhamAssumptions.householdKwhYear * oebAllInCadPerKwh,
  );
  const bessAnnual = Math.round(
    nodes * bessKwhCycledPerHomeYear * touSpreadCadPerKwh,
  );
  const computeAnnual = Math.round(gpuCount * bedrockCadPerGpuYear);
  return {
    id,
    label,
    penetration,
    nodes,
    aggregatePvMw,
    aggregateBessMwh,
    annualEnergyGwh,
    householdOffsetGwh,
    bessCycleGwh,
    excessEnergyGwh,
    meanSurplusMw,
    gpuCount,
    aggregateVramGb,
    aggregateVramPb,
    opsCo2eTonnesUsGrid,
    facilityWaterMl,
    coalPathCo2eTonnes,
    valuations: {
      pv: ledger(pvStock, pvAnnual),
      bess: ledger(bessStock, bessAnnual),
      compute: ledger(computeStock, computeAnnual),
    },
  };
}

export const markhamScenarios: MarkhamScenario[] = [
  scenarioFromPenetration("exploratory", "Exploratory", 0.005),
  scenarioFromPenetration("conservative", "Conservative pilot", 0.01),
  scenarioFromPenetration("scale", "Scale path", 0.05),
];

export const conservativePilot = markhamScenarios.find(
  (s) => s.id === "conservative",
)!;

export const dcReferenceVramPb = round(
  (dcReference.gpuCount * dcReference.vramGbPerGpu) / 1_000_000,
  3,
);

/** Format CAD as compact millions for slide headlines. */
export function fmtCadMillions(cad: number): string {
  const m = cad / 1_000_000;
  if (m >= 10) return `~$${Math.round(m)}M`;
  if (m >= 1) return `~$${m.toFixed(1)}M`;
  return `~$${m.toFixed(2)}M`;
}

export function fmtKtCo2e(tonnes: number): string {
  const kt = tonnes / 1_000;
  if (kt >= 10) return `~${Math.round(kt)} kt`;
  return `~${kt.toFixed(1)} kt`;
}

/** Compact VRAM for slides. Sub-petabyte values render as TB. */
export function fmtVramPb(pb: number): string {
  if (pb < 1) {
    const tb = pb * 1_000;
    if (tb >= 10) return `~${Math.round(tb)} TB VRAM`;
    return `~${tb.toFixed(1)} TB`;
  }
  return `~${pb.toFixed(2)} PB`;
}

/** Gross transaction / installed stock, always percent of stock per year. */
export function fmtTxOnStock(annual: number, stock: number): string {
  if (stock <= 0) return "n/a";
  const pctVal = (annual / stock) * 100;
  if (pctVal >= 10) return `~${Math.round(pctVal)}% of stock / yr`;
  return `~${pctVal.toFixed(1)}% of stock / yr`;
}

export function fmtGrossPaybackMonths(annual: number, stock: number): string {
  if (annual <= 0) return "n/a";
  const mo = (stock / annual) * 12;
  return `~${Math.round(mo)} mo`;
}

const oebCents = round(oebAllInCadPerKwh * 100, 1);
const touSpreadCents = round(touSpreadCadPerKwh * 100, 1);

/** One assumption per line for slide 8 fine print. */
export const assumptionLines: string[] = [
  "Assumptions (illustrative):",
  `Usable roof ${markhamAssumptions.usableRoofM2} m² → ~${round(pvKwPerHome, 1)} kW PV/home (NRCan technical potential, 100% usable coverage).`,
  `Yield ${markhamAssumptions.yieldKwhPerKwYear.toLocaleString("en-CA")} kWh/kW-yr (southern Ontario rooftop).`,
  `Household load ${markhamAssumptions.householdKwhYear.toLocaleString("en-CA")} kWh/yr (OEB typical, 750 kWh/mo).`,
  "Excess = annual PV generation minus household load (annual-energy equivalent; BESS buffers intermittency). Excess is not priced as energy sales.",
  `GPU wall-draw sizing: ${markhamAssumptions.gpuWallKw} kW-class, ${markhamAssumptions.gpuVramGb} GB VRAM.`,
  `GPUs per home = floor(mean surplus kW / ${markhamAssumptions.gpuWallKw}) → ${gpusPerHome} cards (~${gpusPerHome * markhamAssumptions.gpuVramGb} GB VRAM/home).`,
  `BESS ${markhamAssumptions.bessKwhMin} to ${markhamAssumptions.bessKwhMax} kWh/home (model uses ${markhamAssumptions.bessKwhPerHome} kWh midpoint).`,
  `Energy CAPEX: PV $${markhamAssumptions.pvCadPerW.toFixed(2)}/W; BESS $${markhamAssumptions.bessCadPerKwh.toLocaleString("en-CA")}/kWh.`,
  `Compute CAPEX: ${Math.round(markhamAssumptions.usedGpuShare * 100)}% used 3090-class at $${markhamAssumptions.usedGpuCad.toLocaleString("en-CA")} + ${Math.round((1 - markhamAssumptions.usedGpuShare) * 100)}% current-gen at $${markhamAssumptions.currentGenGpuCad.toLocaleString("en-CA")} → $${blendedGpuCad.toLocaleString("en-CA")}/card blended.`,
  `PV yearly: household load at OEB typical all-in ${oebCents} ¢/kWh ($${markhamAssumptions.oebTypicalBillCad} / ${markhamAssumptions.oebTypicalKwhMonth} kWh, Dec 2023 TOU sample).`,
  `BESS yearly: ${markhamAssumptions.bessCyclesPerDay} cycle/day × ${markhamAssumptions.bessKwhPerHome} kWh × TOU on-peak minus off-peak ${touSpreadCents} ¢/kWh (Nov 2025 RPP).`,
  `Compute yearly: AWS Bedrock Claude Sonnet-class proxy $${markhamAssumptions.bedrockUsdPerMTokInput}/$${markhamAssumptions.bedrockUsdPerMTokOutput} per 1M in/out; blend $${bedrockBlendUsdPerMTok.toFixed(2)}/MTok at ${Math.round(markhamAssumptions.bedrockInputShare * 100)}% input.`,
  `Throughput derate: ${markhamAssumptions.tokensPerSecPerGpu} tok/s/GPU × ${Math.round(markhamAssumptions.gpuUtilization * 100)}% util → ~${round(annualMTokPerGpu, 0)} MTok/GPU-yr × FX ${markhamAssumptions.usdToCad} (mixed fleet cannot all run frontier serving).`,
  `Gross transaction / stock is activity vs installed CAPEX, not protocol take rate or depositor yield.`,
  `DC ops CO2e comparator: ${markhamAssumptions.usGridGCo2PerKwh} gCO2/kWh (illustrative US-average grid; Ontario grid is cleaner).`,
  `Facility water: WUE ${markhamAssumptions.facilityWueLPerKwh} L/kWh × compute energy (industry-average evaporative; upper bound).`,
  `Coal-path intensity (energy narrative): ${markhamAssumptions.coalKgCo2ePerMwh.toLocaleString("en-CA")} kg CO2e/MWh (Pembina illustrative Canadian coal).`,
  `VRAM compare: memory only vs ${dcReference.gpuCount.toLocaleString("en-CA")}×${dcReference.vramGbPerGpu} GB reference (${fmtVramPb(dcReferenceVramPb)}); not FLOPS parity with H100-class.`,
];

export const scenarioLines: string[] = [
  `Scenarios: 0.5% / 1% / 5% of Markham single-detached (${markhamBase.singleDetachedHomes.toLocaleString("en-CA")} homes, StatCan 2021).`,
  "City-scale (100% of single-detached) scales linearly with penetration.",
];
