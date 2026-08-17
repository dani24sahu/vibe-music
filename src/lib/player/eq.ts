export const EQ_BAND_HZ = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export const EQ_MIN_DB = -12;
export const EQ_MAX_DB = 12;

export type EqPresetId = "flat" | "pop" | "rock" | "metal" | "custom";

export type EqGains = number[];

export const EQ_PRESET_ORDER: EqPresetId[] = ["flat", "pop", "rock", "metal", "custom"];

export const EQ_PRESET_LABELS: Record<EqPresetId, string> = {
  flat: "Flat",
  pop: "Pop",
  rock: "Rock",
  metal: "Metal",
  custom: "Custom",
};

const FLAT: EqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const EQ_PRESETS: Record<Exclude<EqPresetId, "custom">, EqGains> = {
  flat: FLAT,
  pop: [-1, 2, 4, 5, 3, 0, -1, -1, 1, 2],
  rock: [4, 3, 2, 0, -2, 0, 2, 4, 4, 3],
  metal: [5, 4, 2, -1, -3, 0, 3, 5, 4, 4],
};

export function formatEqHz(hz: number) {
  return hz >= 1000 ? `${hz / 1000}k` : String(hz);
}

export function clampEqDb(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(EQ_MAX_DB, Math.max(EQ_MIN_DB, Math.round(value)));
}

export function normalizeEqGains(values?: number[] | null): EqGains {
  const next = EQ_BAND_HZ.map((_, index) => clampEqDb(values?.[index] ?? 0));
  return next;
}

export function isEqPresetId(value: unknown): value is EqPresetId {
  return typeof value === "string" && EQ_PRESET_ORDER.includes(value as EqPresetId);
}

export function gainsForPreset(preset: EqPresetId, customGains?: number[] | null) {
  if (preset === "custom") return normalizeEqGains(customGains);
  return normalizeEqGains(EQ_PRESETS[preset]);
}

export function createEqFilters(context: AudioContext) {
  return EQ_BAND_HZ.map((hz, index) => {
    const filter = context.createBiquadFilter();
    if (index === 0) filter.type = "lowshelf";
    else if (index === EQ_BAND_HZ.length - 1) filter.type = "highshelf";
    else filter.type = "peaking";
    filter.frequency.value = hz;
    filter.Q.value = index === 0 || index === EQ_BAND_HZ.length - 1 ? 0.7 : 1.2;
    filter.gain.value = 0;
    return filter;
  });
}

export function applyEqGains(
  filters: BiquadFilterNode[] | undefined,
  gains: EqGains,
  context?: AudioContext | null,
) {
  if (!filters?.length) return;
  const next = normalizeEqGains(gains);
  filters.forEach((filter, index) => {
    const db = next[index] ?? 0;
    if (context) {
      filter.gain.setTargetAtTime(db, context.currentTime, 0.04);
    } else {
      filter.gain.value = db;
    }
  });
}
