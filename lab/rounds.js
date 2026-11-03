// 경제 실험실 라운드 규칙과 계산
//  선생님 화면과 학생 화면이 같이 씁니다.

export const START_CASH = 1000;   // 처음 가진 돈
export const PER_CORRECT = 100;   // 문제 1개 맞히면 생산하는 금액

export const ROUNDS = [
  {
    id: "plan", emoji: "🏭", title: "계획경제 마을",
    steps: ["intro", "work", "result"],
    rule: "문제를 맞히면 100원을 생산해요. 하지만 반 전체가 번 돈은 정부가 모아서 모두에게 똑같이 나눠 줘요.",
    think: "많이 푼 사람도, 안 푼 사람도 똑같이 받으면 어떻게 될까?",
    concept: "<b>계획경제 체제</b>: 정부의 계획과 명령으로 경제 문제를 해결해요. <b>분배의 형평성</b>은 높지만, 일한 만큼 받지 못하니 <b>근로 의욕이 떨어지고</b> 효율성이 낮아질 수 있어요.",
  },
  {
    id: "market", emoji: "🛒", title: "시장경제 마을",
    steps: ["intro", "work", "result"],
    rule: "이번엔 맞힌 만큼 전부 내 돈이에요! 열심히 푼 만큼 벌어요.",
    think: "반 전체가 번 돈은 계획경제 때보다 늘어날까? 친구들 사이의 차이는?",
    concept: "<b>시장경제 체제</b>: 각자 자기 이익을 위해 자유롭게 활동하고, 그 결과 <b>효율적인 자원 배분</b>이 이루어져요. 하지만 능력과 환경 차이로 <b>빈부 격차</b>가 생길 수 있어요.",
  },
  {
    id: "mixed", emoji: "⚖️", title: "혼합경제 마을",
    steps: ["intro", "vote", "work", "result"],
    rule: "먼저 세금을 얼마나 걷을지 반 전체가 투표해요. 번 돈에서 세금을 내고, 모인 세금은 모두에게 똑같이 나눠 줘요.",
    think: "세금이 높으면? 낮으면? 우리 반에 딱 맞는 세율은?",
    concept: "<b>혼합 경제 체제</b>: 시장경제를 바탕으로 정부가 일부 개입해 시장의 한계를 보완해요. <b>우리나라</b>도 혼합 경제 체제예요. (헌법 제119조)",
  },
  {
    id: "public", emoji: "🏮", title: "등대를 세워라",
    steps: ["intro", "work", "choose", "result"],
    rule: "문제를 풀어 돈을 번 뒤, 마을 등대 기금에 300원을 낼지 몰래 정해요. 반의 60% 이상이 내면 등대가 세워져 <b>모두가</b> 600원 보너스! (안 낸 사람도요)",
    think: "나 하나쯤 안 내도 등대는 세워지지 않을까?",
    concept: "<b>공공재</b>(등대, 가로등, 국방)는 돈을 안 낸 사람도 쓸 수 있어서 <b>무임승차자 문제</b>가 생겨요. 그래서 시장에만 맡기면 부족해지고, <b>정부가 직접 공급</b>해요.",
    options: [
      { v: "give", label: "🏮 기금 내기", sub: "300원을 낸다" },
      { v: "skip", label: "🙈 안 내기", sub: "남이 내주겠지…" },
    ],
  },
  {
    id: "cartel", emoji: "🍗", title: "치킨집 담합",
    steps: ["intro", "choose", "result"],
    rule: "우리 반 모두가 치킨집 사장! \"다 같이 비싸게 팔자\"고 약속했어요. 약속대로 비싸게 팔까, 몰래 싸게 팔아 손님을 뺏어 올까?",
    think: "모두 약속을 지키면 모두 이득. 그런데 나만 몰래 싸게 팔면?",
    concept: "<b>담합</b>: 기업끼리 몰래 가격을 정하는 것. 소비자는 비싼 값을 낼 수밖에 없어 손해예요(<b>독과점의 폐해</b>). 그래서 <b>공정 거래 위원회</b>가 담합을 적발해 과징금을 매겨요.",
    options: [
      { v: "high", label: "💰 비싸게 팔기", sub: "약속을 지킨다" },
      { v: "low", label: "🏷️ 몰래 싸게 팔기", sub: "손님을 뺏어 온다" },
    ],
  },
  {
    id: "extern", emoji: "🌫️", title: "공장 굴뚝 마을",
    steps: ["intro", "choose", "result"],
    rule: "모두 공장 사장이에요. 공장을 돌리면 나는 500원을 벌지만, 매연 때문에 공장 하나당 반 전원이 25원씩 피해를 봐요.",
    think: "나는 돈을 벌지만 피해는 모두가 나눠 진다면?",
    concept: "<b>부정적 외부 효과</b>: 남에게 피해를 주고도 대가를 치르지 않아 <b>사회적으로 적정한 수준보다 많이</b> 생산돼요. 정부는 <b>세금이나 과징금</b>으로 줄이고, 좋은 활동에는 <b>보조금</b>을 줘요.",
    options: [
      { v: "on", label: "🏭 공장 가동", sub: "+500원" },
      { v: "off", label: "🌳 공장 멈춤", sub: "0원" },
    ],
  },
];

export const TAX_OPTIONS = [
  { v: 0, label: "세금 없음", sub: "0%" },
  { v: 20, label: "조금", sub: "20%" },
  { v: 50, label: "많이", sub: "50%" },
];

export const STEP_NAMES = { intro: "규칙 소개", vote: "세금 투표", work: "문제 풀기(생산)", choose: "선택하기", result: "결과 발표" };

const r10 = (n) => Math.round(n / 10) * 10;

/** 이번 라운드 학생의 생산액 */
export function producedOf(p, seq) { return p && p.seq === seq ? p.produced || 0 : 0; }
export function choiceOf(p, seq, fallback) { return p && p.choiceSeq === seq && p.choice ? p.choice : fallback; }

/** 세금 투표 결과(가장 많은 표, 동점이면 낮은 세율) */
export function tallyTax(players, seq) {
  const cnt = { 0: 0, 20: 0, 50: 0 };
  Object.values(players).forEach((p) => { if (p.voteSeq === seq && p.vote in cnt) cnt[p.vote]++; });
  let best = 0;
  [0, 20, 50].forEach((v) => { if (cnt[v] > cnt[best]) best = v; });
  return { rate: best, cnt };
}

/**
 * 라운드 결과 계산
 * @returns {{ deltas: Object<string,{delta:number,note:string}>, lines: string[], stats: Object }}
 */
export function computeRound(round, players, room) {
  const seq = room.seq;
  const ids = Object.keys(players);
  const n = Math.max(ids.length, 1);
  const prod = Object.fromEntries(ids.map((id) => [id, producedOf(players[id], seq)]));
  const total = ids.reduce((s, id) => s + prod[id], 0);
  const deltas = {};
  const lines = [];
  const stats = { total };

  const gap = (vals) => {
    const v = vals.slice().sort((a, b) => b - a);
    return { top: v[0] || 0, bottom: v[v.length - 1] || 0 };
  };

  if (round.id === "plan") {
    const share = r10(total / n);
    ids.forEach((id) => (deltas[id] = { delta: share, note: `내가 생산한 ${prod[id]}원 → 똑같이 ${share}원 받음` }));
    lines.push(`반 전체 생산 <b>${total.toLocaleString()}원</b>`);
    lines.push(`모두가 똑같이 <b>${share.toLocaleString()}원</b>씩 받았어요`);
    const g = gap(Object.values(prod));
    lines.push(`가장 많이 생산한 친구 ${g.top}원 · 가장 적게 생산한 친구 ${g.bottom}원 → 받은 돈은 똑같아요`);
  }

  if (round.id === "market") {
    ids.forEach((id) => (deltas[id] = { delta: prod[id], note: `맞힌 만큼 ${prod[id]}원 모두 내 돈` }));
    lines.push(`반 전체 생산 <b>${total.toLocaleString()}원</b>`);
    const prev = room.stats && room.stats.plan;
    if (typeof prev === "number") {
      const diff = total - prev;
      lines.push(`계획경제 마을(${prev.toLocaleString()}원)보다 <b class="${diff >= 0 ? "pos" : "neg"}">${diff >= 0 ? "+" : ""}${diff.toLocaleString()}원</b>`);
    }
    const g = gap(Object.values(prod));
    lines.push(`가장 많이 번 친구 <b>${g.top}원</b> · 가장 적게 번 친구 <b>${g.bottom}원</b> → 격차 ${(g.top - g.bottom).toLocaleString()}원`);
  }

  if (round.id === "mixed") {
    const rate = room.taxRate || 0;
    const taxes = Object.fromEntries(ids.map((id) => [id, r10(prod[id] * rate / 100)]));
    const pool = ids.reduce((s, id) => s + taxes[id], 0);
    const share = r10(pool / n);
    ids.forEach((id) => {
      const d = prod[id] - taxes[id] + share;
      deltas[id] = { delta: d, note: `생산 ${prod[id]}원 − 세금 ${taxes[id]}원 + 나눠 받은 ${share}원` };
    });
    const before = gap(Object.values(prod));
    const after = gap(ids.map((id) => deltas[id].delta));
    lines.push(`투표로 정한 세율 <b>${rate}%</b> · 반 전체 생산 <b>${total.toLocaleString()}원</b>`);
    lines.push(`걷은 세금 ${pool.toLocaleString()}원 → 한 사람당 <b>${share}원</b>씩 돌려받음`);
    lines.push(`격차: 세금 전 ${(before.top - before.bottom).toLocaleString()}원 → 세금 후 <b>${(after.top - after.bottom).toLocaleString()}원</b>`);
    const prev = room.stats && room.stats.market;
    if (typeof prev === "number") lines.push(`시장경제 마을 때 생산 ${prev.toLocaleString()}원과 비교해 보세요`);
    stats.rate = rate;
  }

  if (round.id === "public") {
    const givers = ids.filter((id) => choiceOf(players[id], seq, "skip") === "give");
    const need = Math.ceil(n * 0.6);
    const ok = givers.length >= need;
    ids.forEach((id) => {
      const gave = givers.includes(id);
      const d = prod[id] - (gave ? 300 : 0) + (ok ? 600 : 0);
      deltas[id] = { delta: d, note: `생산 ${prod[id]}원${gave ? " − 기금 300원" : " (기금 안 냄)"}${ok ? " + 등대 보너스 600원" : ""}` };
    });
    lines.push(`기금을 낸 친구 <b>${givers.length}명</b> / ${n}명 (필요: ${need}명)`);
    lines.push(ok ? "🏮 <b>등대 완성!</b> 기금을 안 낸 친구도 똑같이 600원 보너스를 받았어요" : "💨 <b>등대 실패…</b> 모인 기금은 공사비로 사라졌어요");
    lines.push(ok ? `기금 안 낸 친구가 낸 친구보다 300원 더 벌었어요 → 이게 <b>무임승차</b>!` : "모두 남이 내주길 기다리면 아무도 등대를 못 써요");
    stats.ok = ok; stats.givers = givers.length;
  }

  if (round.id === "cartel") {
    const highs = ids.filter((id) => choiceOf(players[id], seq, "high") === "high");
    const h = highs.length / n;
    const fine = room.settings && room.settings.fineOn && h >= 0.5;
    ids.forEach((id) => {
      const isHigh = highs.includes(id);
      let d = isHigh ? r10(400 * h) : r10(250 + 200 * h);
      let note = isHigh ? `비싸게 팔아 ${d}원` : `싸게 팔아 손님을 뺏어 ${d}원`;
      if (fine && isHigh) { d -= 300; note += " − 공정위 과징금 300원"; }
      deltas[id] = { delta: d, note };
    });
    lines.push(`약속을 지킨 사장 <b>${highs.length}명</b> · 몰래 싸게 판 사장 <b>${n - highs.length}명</b>`);
    lines.push(`비싸게 판 사장은 <b>${r10(400 * h)}원</b>, 싸게 판 사장은 <b>${r10(250 + 200 * h)}원</b>을 벌었어요`);
    lines.push(`모두가 약속을 지켰다면 모두 400원, 모두가 배신했다면 모두 250원이었어요`);
    if (fine) lines.push("🚨 <b>공정 거래 위원회 출동!</b> 담합한 사장에게 과징금 300원");
    stats.highs = highs.length;
  }

  if (round.id === "extern") {
    const ons = ids.filter((id) => choiceOf(players[id], seq, "off") === "on");
    const k = ons.length;
    const tax = room.settings && room.settings.envTax ? 300 : 0;
    const pool = tax * k;
    const share = r10(pool / n);
    const harm = 25 * k;
    ids.forEach((id) => {
      const isOn = ons.includes(id);
      const d = (isOn ? 500 - tax : 0) - harm + share;
      deltas[id] = { delta: d, note: `${isOn ? `공장 가동 +500원${tax ? ` − 환경세 ${tax}원` : ""}` : "공장 멈춤"} − 매연 피해 ${harm}원${share ? ` + 환경세 나눔 ${share}원` : ""}` };
    });
    const air = Math.max(0, Math.round(100 - (k / n) * 100));
    lines.push(`공장을 돌린 사장 <b>${k}명</b> / ${n}명 → 공기 점수 <b>${air}점</b>`);
    lines.push(`모두가 매연 피해 <b>${harm}원</b>씩 받았어요`);
    if (tax) lines.push(`🧾 <b>환경세</b> 300원을 걷어 모두에게 ${share}원씩 나눠 줬어요`);
    else lines.push(`모두 공장을 돌리면 각자 ${500 - 25 * n}원… 모두 멈추면 0원`);
    stats.ons = k; stats.air = air;
  }

  return { deltas, lines, stats };
}
