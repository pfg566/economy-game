import { ASSETS, RETURNS, YEARS } from "./data.js";

export const ASSET_IDS = ASSETS.map((a) => a.id);
export const assetName = (a, hide) => (hide ? a.hidden : a.name);

/** 비율(%)을 정리: 예금이 아닌 자산 합이 100을 넘지 않게, 나머지는 예금 */
export function normalize(alloc) {
  const out = {};
  let used = 0;
  ASSET_IDS.forEach((id) => {
    if (id === "dep") return;
    let v = Math.max(0, Math.min(100, Math.round(((alloc && alloc[id]) || 0) / 10) * 10));
    if (used + v > 100) v = 100 - used;
    out[id] = v; used += v;
  });
  out.dep = 100 - used;
  return out;
}

/** 1년 투자 결과 */
export function grow(wealth, alloc, yearIdx) {
  const a = normalize(alloc);
  let after = 0;
  const parts = {};
  ASSET_IDS.forEach((id) => {
    const put = (wealth * a[id]) / 100;
    const got = put * (1 + RETURNS[id][yearIdx] / 100);
    parts[id] = { put, got };
    after += got;
  });
  return { after: Math.round(after), parts, alloc: a };
}

/** 2016년 말을 10,000원으로 맞춘 가격 (yearIdx 해 말 기준, -1이면 시작 가격) */
export function priceAt(id, yearIdx) {
  let p = 10000;
  for (let i = 0; i <= yearIdx; i++) p *= 1 + RETURNS[id][i] / 100;
  return Math.round(p);
}

/** 처음부터 한 자산에만 투자했다면 */
export function onlyOne(id, start, lastIdx = YEARS.length - 1) {
  let w = start;
  for (let i = 0; i <= lastIdx; i++) w *= 1 + RETURNS[id][i] / 100;
  return Math.round(w);
}

export const countAssets = (alloc) => Object.values(normalize(alloc)).filter((v) => v > 0).length;
