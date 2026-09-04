import React, { useState, useEffect, useMemo, useRef } from "react";
import { ensureUser } from "./firebase";
import {
  loadAll,
  saveTrip,
  removeTrip,
  saveSettings,
  makeDebouncer,
} from "./store";
import {
  Check,
  Plus,
  Bell,
  AlertTriangle,
  Settings2,
  Trash2,
  Luggage,
  Shirt,
  CalendarDays,
  Ticket,
  MapPin,
  Train,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  Settings,
  Pencil,
} from "lucide-react";

// ===================== 定数 =====================

const DEFAULT_ITEMS = [
  { id: "wallet", name: "財布" },
  { id: "license", name: "免許証" },
  { id: "charger", name: "充電器" },
  { id: "battery", name: "モバイルバッテリー" },
  { id: "meds", name: "薬" },
  { id: "toothbrush", name: "歯磨き" },
  { id: "clothes", name: "着替え", isLaundryRotation: true },
  { id: "traffic_ticket", name: "交通チケット" },
  { id: "lip", name: "リップ" },
  { id: "earphone", name: "イヤホン" },
  {
    id: "skincare",
    name: "スキンケア",
    isGroup: true,
    children: [
      { id: "skin", name: "化粧水" },
      { id: "milkylotion", name: "乳液" },
      { id: "hairoil", name: "ヘアオイル" },
      { id: "cleansing", name: "クレンジング" },
      { id: "razor", name: "髭剃り" },
      { id: "facewash", name: "洗顔フォーム" },
      { id: "facenet", name: "洗顔ネット" },
    ],
  },
];

const RESERVATION_CATEGORIES = [
  { id: "transport", label: "交通", icon: Train, color: "var(--info)" },
  { id: "hotel", label: "宿泊", icon: Building2, color: "var(--accent)" },
  { id: "other", label: "その他", icon: Ticket, color: "var(--warn)" },
];

const PLACE_CATEGORIES = [
  { id: "food", label: "飲食店", color: "var(--warn)" },
  { id: "amusement", label: "アミューズメント", color: "var(--violet)" },
  { id: "sightseeing", label: "観光スポット", color: "var(--accent)" },
  { id: "shopping", label: "買い物", color: "var(--info)" },
  { id: "other", label: "その他", color: "var(--sub)" },
];

const TABS = [
  { id: "packing", label: "持ち物", icon: Luggage },
  { id: "schedule", label: "予定", icon: CalendarDays },
  { id: "reservation", label: "予約", icon: Ticket },
  { id: "places", label: "場所", icon: MapPin },
];

// ===================== テーマ =====================
// 各テーマは CSS 変数の組。切り替えると全画面の配色が一度に変わる。
const THEMES = [
  {
    id: "forest",
    label: "フォレスト",
    swatch: ["#1F2A24", "#2F6F62", "#F4F5F0"],
    vars: {
      "--header-bg": "#2F6F62",
      "--header-fg": "#F4F5F0",
      "--header-btn": "rgba(255,255,255,0.18)",
      "--bg": "#F4F5F0",
      "--paper": "#FFFFFF",
      "--ink": "#1F2A24",
      "--sub": "#7D8377",
      "--line": "#D8D9CE",
      "--faint": "#EDEEE7",
      "--hairline": "#F2F3EE",
      "--muted": "#B7BAAE",
      "--done": "#9AA093",
      "--track": "#E2E3DA",
      "--accent": "#2F6F62",
      "--info": "#3F6FA6",
      "--warn": "#B5502F",
      "--violet": "#7A5AA6",
      "--tint-info-bg": "#EAF1F6",
      "--tint-info-line": "#B7CBDB",
      "--tint-info-ink": "#2A4C63",
      "--tint-warn-bg": "#FBEEE9",
      "--tint-warn-line": "#E3B6A4",
      "--tint-warn-ink": "#7A3A26",
      "--disabled-bg": "#C7CABF",
      "--disabled-fg": "#F0F1EC",
    },
  },
  {
    id: "ocean",
    label: "オーシャン",
    swatch: ["#16303F", "#2C7A8C", "#F1F5F6"],
    vars: {
      "--header-bg": "#27707F",
      "--header-fg": "#F1F5F6",
      "--header-btn": "rgba(255,255,255,0.18)",
      "--bg": "#F1F5F6",
      "--paper": "#FFFFFF",
      "--ink": "#16303F",
      "--sub": "#71858E",
      "--line": "#D2DCE0",
      "--faint": "#E8EFF1",
      "--hairline": "#F0F5F6",
      "--muted": "#AEBEC5",
      "--done": "#94A6AE",
      "--track": "#DCE6E9",
      "--accent": "#2C7A8C",
      "--info": "#3F6FA6",
      "--warn": "#C05A45",
      "--violet": "#6E5FA8",
      "--tint-info-bg": "#E7F1F4",
      "--tint-info-line": "#AFCBD6",
      "--tint-info-ink": "#1F4E5C",
      "--tint-warn-bg": "#FBEDE9",
      "--tint-warn-line": "#E5B6A8",
      "--tint-warn-ink": "#7E3B2C",
      "--disabled-bg": "#C0CCD1",
      "--disabled-fg": "#EDF2F3",
    },
  },
  {
    id: "sunset",
    label: "サンセット",
    swatch: ["#3A2620", "#C2603A", "#FAF3EE"],
    vars: {
      "--header-bg": "#B25634",
      "--header-fg": "#FDF6F2",
      "--header-btn": "rgba(255,255,255,0.20)",
      "--bg": "#FAF3EE",
      "--paper": "#FFFFFF",
      "--ink": "#3A2620",
      "--sub": "#8C7A72",
      "--line": "#E2D5CC",
      "--faint": "#F1E7E0",
      "--hairline": "#F7EFEA",
      "--muted": "#C9B6AB",
      "--done": "#AC9C93",
      "--track": "#EADDD4",
      "--accent": "#C2603A",
      "--info": "#4A7396",
      "--warn": "#A63D3D",
      "--violet": "#8A5A93",
      "--tint-info-bg": "#EDF2F6",
      "--tint-info-line": "#BCCFDD",
      "--tint-info-ink": "#2F4C63",
      "--tint-warn-bg": "#FAE9E6",
      "--tint-warn-line": "#E0B3AC",
      "--tint-warn-ink": "#7C3030",
      "--disabled-bg": "#D5C5BB",
      "--disabled-fg": "#F6EFEA",
    },
  },
  {
    id: "blossom",
    label: "ブロッサム",
    swatch: ["#3B2530", "#C4557E", "#FCF2F5"],
    vars: {
      "--header-bg": "#B44970",
      "--header-fg": "#FDF3F7",
      "--header-btn": "rgba(255,255,255,0.20)",
      "--bg": "#FCF2F5",
      "--paper": "#FFFFFF",
      "--ink": "#3B2530",
      "--sub": "#8C7480",
      "--line": "#E7D3DA",
      "--faint": "#F5E6EB",
      "--hairline": "#FAF0F3",
      "--muted": "#CDB2BE",
      "--done": "#AE96A1",
      "--track": "#EEDCE3",
      "--accent": "#C4557E",
      "--info": "#5A72A6",
      "--warn": "#B5453F",
      "--violet": "#8E5AA8",
      "--tint-info-bg": "#EEF1F8",
      "--tint-info-line": "#C0CBE2",
      "--tint-info-ink": "#3A4A70",
      "--tint-warn-bg": "#FBE9E8",
      "--tint-warn-line": "#E5B4B1",
      "--tint-warn-ink": "#83322E",
      "--disabled-bg": "#D9C4CC",
      "--disabled-fg": "#F8EEF1",
    },
  },
  {
    id: "night",
    label: "ナイト",
    swatch: ["#0F1418", "#4FA88F", "#1A2126"],
    vars: {
      "--header-bg": "#4FA88F",
      "--header-fg": "#12201B",
      "--header-btn": "rgba(0,0,0,0.13)",
      "--bg": "#161C21",
      "--paper": "#1F272D",
      "--ink": "#E6EAEC",
      "--sub": "#8E9AA1",
      "--line": "#333E46",
      "--faint": "#2A333A",
      "--hairline": "#283137",
      "--muted": "#4C5860",
      "--done": "#6B767D",
      "--track": "#2E383F",
      "--accent": "#4FA88F",
      "--info": "#6A9BD1",
      "--warn": "#D97B5E",
      "--violet": "#A48BD6",
      "--tint-info-bg": "#1E2C39",
      "--tint-info-line": "#37536C",
      "--tint-info-ink": "#A8C6E0",
      "--tint-warn-bg": "#33241F",
      "--tint-warn-line": "#5E3E33",
      "--tint-warn-ink": "#E2A88F",
      "--disabled-bg": "#39434A",
      "--disabled-fg": "#7C868C",
    },
  },
];

function themeVarsCss(themeId) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  return Object.entries(theme.vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n        ");
}

const C = {
  bg: "var(--bg)",
  ink: "var(--ink)",
  sub: "var(--sub)",
  line: "var(--line)",
  faint: "var(--faint)",
  green: "var(--accent)",
  blue: "var(--info)",
  red: "var(--warn)",
  paper: "var(--paper)",
  muted: "var(--muted)",
  done: "var(--done)",
  track: "var(--track)",
  violet: "var(--violet)",
  header: "var(--header-bg)",
  headerFg: "var(--header-fg)",
  headerBtn: "var(--header-btn)",
};

const card = {
  background: C.paper,
  border: `1px solid ${C.line}`,
  borderRadius: 4,
};

function getLaundryDays(days, sets) {
  const result = [];
  if (sets < 1) return result;
  for (let d = sets; d < days; d += sets) result.push(d);
  return result;
}

// 出発日と帰着日から日数を求める（両方揃っていない場合は保存済みの日数を使う）
function calcDays(departure, returnDate) {
  if (!departure || !returnDate) return null;
  const d1 = new Date(departure);
  const d2 = new Date(returnDate);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diff = Math.round((d2 - d1) / 86400000) + 1;
  return diff >= 1 ? diff : null;
}

function tripDays(trip) {
  return calcDays(trip.departure, trip.returnDate) || trip.days || 1;
}

function newTrip({ name, departure, returnDate }) {
  return {
    id: `trip-${Date.now()}`,
    name: name || "新しい旅行",
    days: calcDays(departure, returnDate) || 2,
    clothesSets: 0,
    departure: departure || "",
    returnDate: returnDate || "",
    checked: {},
    schedule: [],
    reservations: [],
    places: [],
    createdAt: Date.now(),
  };
}

// ===================== 共通パーツ =====================

function CheckBox({ on, size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        border: `1.5px solid ${on ? C.green : C.muted}`,
        background: on ? C.green : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {on && <Check size={size - 6} color={C.bg} strokeWidth={3} />}
    </div>
  );
}

function Field({ label, children, flex = 1 }) {
  return (
    <div style={{ ...card, flex, padding: "10px 12px" }}>
      <div
        style={{
          fontSize: 12,
          color: C.sub,
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: `1px solid ${C.line}`,
  borderRadius: 4,
  padding: "8px 10px",
  fontSize: 14,
  color: C.ink,
  background: C.paper,
};

const bareInput = {
  width: "100%",
  border: "none",
  fontSize: 18,
  fontWeight: 700,
  background: "transparent",
  color: C.ink,
};

function PrimaryButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: "100%",
        background: disabled ? "var(--disabled-bg)" : C.header,
        color: disabled ? "var(--disabled-fg)" : C.headerFg,
        border: "none",
        borderRadius: 4,
        padding: "10px 0",
        fontSize: 14,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

// 数値で 年/月/日 を入力する欄。3つ揃って実在する日付になったときだけ親に伝える
function DateParts({ value, onChange }) {
  const [parts, setParts] = useState(() => {
    if (value) {
      const [y, m, d] = value.split("-");
      return { y: String(Number(y)), m: String(Number(m)), d: String(Number(d)) };
    }
    return { y: String(new Date().getFullYear()), m: "", d: "" };
  });

  useEffect(() => {
    const y = Number(parts.y);
    const m = Number(parts.m);
    const d = Number(parts.d);
    const filled = parts.y !== "" && parts.m !== "" && parts.d !== "";
    if (filled && y >= 1000 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const dt = new Date(iso);
      // 2月31日のような存在しない日付をはじく
      if (dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d) {
        if (iso !== value) onChange(iso);
        return;
      }
    }
    if (value) onChange("");
  }, [parts]);

  // カレンダーから選ばれたときなど、外から値が変わったら欄の表示を合わせる
  useEffect(() => {
    if (!value) return;
    const [y, m, d] = value.split("-");
    if (
      Number(parts.y) !== Number(y) ||
      Number(parts.m) !== Number(m) ||
      Number(parts.d) !== Number(d)
    ) {
      setParts({ y, m, d });
    }
  }, [value]);

  const yRef = useRef(null);
  const mRef = useRef(null);
  const dRef = useRef(null);

  // 数字以外を捨て、桁数で切り、埋まったら次の欄へ自動で移動する
  function handle(key, raw, maxLen, nextRef) {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, maxLen);
    setParts((p) => ({ ...p, [key]: digits }));
    if (digits.length === maxLen && nextRef && nextRef.current) {
      nextRef.current.focus();
      nextRef.current.select();
    }
  }

  // 空欄でBackspaceを押したら、前の欄に戻ってその最後の1文字を消す
  function handleKeyDown(e, key, prevRef, prevKey) {
    if (e.key === "Backspace" && parts[key] === "" && prevRef && prevRef.current) {
      e.preventDefault();
      setParts((p) => ({ ...p, [prevKey]: p[prevKey].slice(0, -1) }));
      prevRef.current.focus();
    }
  }

  // まだ何も入っていない状態で月・日を押したときは、年から打ち始められるようにする
  function handleFocusJump(e, key) {
    if (key !== "y" && parts.y === "" && yRef.current) {
      e.preventDefault();
      yRef.current.focus();
    }
  }

  const numStyle = {
    ...inputStyle,
    textAlign: "center",
    padding: "8px 4px",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        ref={yRef}
        type="text"
        inputMode="numeric"
        value={parts.y}
        onChange={(e) => handle("y", e.target.value, 4, mRef)}
        placeholder="年"
        style={{ ...numStyle, flex: 1.6 }}
      />
      <span style={{ fontSize: 12, color: C.sub }}>/</span>
      <input
        ref={mRef}
        type="text"
        inputMode="numeric"
        value={parts.m}
        onChange={(e) => handle("m", e.target.value, 2, dRef)}
        onKeyDown={(e) => handleKeyDown(e, "m", yRef, "y")}
        onMouseDown={(e) => handleFocusJump(e, "m")}
        placeholder="月"
        style={{ ...numStyle, flex: 1 }}
      />
      <span style={{ fontSize: 12, color: C.sub }}>/</span>
      <input
        ref={dRef}
        type="text"
        inputMode="numeric"
        value={parts.d}
        onChange={(e) => handle("d", e.target.value, 2, null)}
        onKeyDown={(e) => handleKeyDown(e, "d", mRef, "m")}
        onMouseDown={(e) => handleFocusJump(e, "d")}
        placeholder="日"
        style={{ ...numStyle, flex: 1 }}
      />
    </div>
  );
}

// 数値入力欄の右にカレンダーボタンを置いた日付欄。
// 数字で直接打つことも、カレンダーから選ぶこともできる。
// ボタンの上には透明な日付入力を重ねてあり、押すと端末標準のピッカーが開く。
function DateField({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <DateParts value={value} onChange={onChange} />
      </div>
      <div
        style={{
          position: "relative",
          width: 38,
          height: 37,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `1px solid ${C.line}`,
            background: C.paper,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.ink,
            pointerEvents: "none",
          }}
        >
          <CalendarDays size={17} strokeWidth={1.8} />
        </div>
        <input
          className="cal-overlay"
          type="date"
          min="1900-01-01"
          max="2099-12-31"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="カレンダーから選ぶ"
        />
      </div>
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div
      style={{
        marginTop: 18,
        marginBottom: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700 }}>{children}</span>
      {right && <span style={{ fontSize: 13, color: C.sub }}>{right}</span>}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: C.sub,
        padding: "28px 0",
        textAlign: "center",
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

function DeleteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        color: C.red,
        cursor: "pointer",
        padding: 4,
        flexShrink: 0,
      }}
    >
      <Trash2 size={16} />
    </button>
  );
}

// ===================== 持ち物タブ =====================

function PackingTab({ trip, patchTrip, items, setItems, forgotten, setForgotten }) {
  const [editMode, setEditMode] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [forgottenInput, setForgottenInput] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({ skincare: false });

  const checked = trip.checked || {};
  const days = tripDays(trip);
  const flatItems = useMemo(
    () => items.flatMap((it) => (it.isGroup ? it.children : [it])),
    [items]
  );
  const total = flatItems.length;
  const doneCount = flatItems.filter((it) => checked[it.id]).length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  const laundryDays = useMemo(
    () => getLaundryDays(days, trip.clothesSets + 1),
    [days, trip.clothesSets]
  );

  const daysUntil = useMemo(() => {
    if (!trip.departure) return null;
    const d = new Date(trip.departure);
    const now = new Date();
    d.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.round((d - now) / 86400000);
  }, [trip.departure]);

  function toggleCheck(id) {
    patchTrip({ checked: { ...checked, [id]: !checked[id] } });
  }


  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ ...card, flex: 1, padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 12,
              color: C.sub,
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Bell size={12} /> 出発日
          </div>
          <DateField
            value={trip.departure}
            onChange={(v) => patchTrip({ departure: v })}
          />
          <div
            style={{
              fontSize: 12,
              color: C.sub,
              margin: "10px 0 6px",
            }}
          >
            帰着日
          </div>
          <DateField
            value={trip.returnDate || ""}
            onChange={(v) => patchTrip({ returnDate: v })}
          />
        </div>
        <Field
          label={
            <>
              <Shirt size={12} /> 予備の着替え
            </>
          }
        >
          <input
            type="number"
            min={0}
            value={trip.clothesSets}
            onChange={(e) =>
              patchTrip({ clothesSets: Math.max(0, Number(e.target.value) || 0) })
            }
            style={bareInput}
          />
        </Field>
      </div>

      {daysUntil !== null && (
        <div
          style={{
            fontSize: 12,
            color: daysUntil <= 1 && daysUntil >= 0 ? C.red : C.sub,
            marginTop: 8,
          }}
        >
          {days}日間の旅行・
          {daysUntil > 0 ? `出発まであと${daysUntil}日` : daysUntil === 0 ? "本日出発" : "出発済み"}
          {daysUntil <= 1 && daysUntil >= 0 && doneCount < total ? "・未チェックあり" : ""}
        </div>
      )}

      {/* 洗濯プラン */}
      <div
        style={{
          marginTop: 14,
          background: "var(--tint-info-bg)",
          border: `1px solid var(--tint-info-line)`,
          borderRadius: 4,
          padding: "10px 12px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tint-info-ink)", marginBottom: 4 }}>
          洗濯プラン
        </div>
        <div style={{ fontSize: 13, color: "var(--tint-info-ink)", lineHeight: 1.7 }}>
          {laundryDays.length > 0 ? (
            <>
              持っていく着替え{trip.clothesSets}着＋着ていく1着の計{trip.clothesSets + 1}着で{days}日間なら、
              <strong>{laundryDays.map((d) => `${d}日目の夜`).join("、")}</strong>
              に洗濯すれば足ります。
            </>
          ) : (
            <>
              持っていく着替え{trip.clothesSets}着＋着ていく1着の計{trip.clothesSets + 1}着あれば、{days}日間は洗濯なしで足ります。
            </>
          )}
        </div>
      </div>

      {/* 忘れ物警告 */}
      {forgotten.length > 0 && (
        <div
          style={{
            marginTop: 14,
            background: "var(--tint-warn-bg)",
            border: `1px solid var(--tint-warn-line)`,
            borderRadius: 4,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={16} color={C.red} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: "var(--tint-warn-ink)", lineHeight: 1.6 }}>
            過去に忘れがち：<strong>{forgotten.join("、")}</strong>
          </div>
        </div>
      )}

      <SectionTitle right={`${doneCount} / ${total}`}>持ち物リスト</SectionTitle>
      <div
        style={{
          height: 4,
          background: C.track,
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: C.green,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it) => {
          if (it.isGroup) {
            const expanded = !!expandedGroups[it.id];
            const gDone = it.children.filter((c) => checked[c.id]).length;
            const gTotal = it.children.length;
            return (
              <div key={it.id} style={{ ...card, overflow: "hidden" }}>
                <div
                  onClick={() => setExpandedGroups((p) => ({ ...p, [it.id]: !p[it.id] }))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    cursor: "pointer",
                  }}
                >
                  <CheckBox on={gDone === gTotal} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                      {gDone} / {gTotal}・タップで詳細
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    color={C.sub}
                    style={{
                      transform: expanded ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s ease",
                    }}
                  />
                </div>
                {expanded && (
                  <div style={{ borderTop: `1px solid ${C.faint}` }}>
                    {it.children.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => toggleCheck(c.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px 10px 34px",
                          cursor: "pointer",
                          borderTop: `1px solid var(--hairline)`,
                        }}
                      >
                        <CheckBox on={!!checked[c.id]} size={18} />
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            textDecoration: checked[c.id] ? "line-through" : "none",
                            color: checked[c.id] ? C.done : C.ink,
                          }}
                        >
                          {c.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          const on = !!checked[it.id];
          return (
            <div
              key={it.id}
              onClick={() => !editMode && toggleCheck(it.id)}
              style={{
                ...card,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                cursor: editMode ? "default" : "pointer",
              }}
            >
              <CheckBox on={on} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: on ? "line-through" : "none",
                    color: on ? C.done : C.ink,
                  }}
                >
                  {it.name}
                </div>
                {it.isLaundryRotation && (
                  <div style={{ fontSize: 12, color: C.blue, marginTop: 2 }}>
                    {trip.clothesSets}着（着ていく分は別）
                  </div>
                )}
              </div>
              {editMode && (
                <DeleteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems((prev) => prev.filter((x) => x.id !== it.id));
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {editMode && (
        <div
          style={{
            marginTop: 14,
            background: C.paper,
            border: `1px dashed var(--muted)`,
            borderRadius: 4,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>アイテムを追加</div>
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="アイテム名"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <PrimaryButton
            onClick={() => {
              const n = newItemName.trim();
              if (!n) return;
              setItems((prev) => [...prev, { id: `custom-${Date.now()}`, name: n }]);
              setNewItemName("");
            }}
          >
            <Plus size={16} /> 追加する
          </PrimaryButton>
        </div>
      )}

      <div style={{ ...card, marginTop: 14, padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>忘れ物を記録する</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={forgottenInput}
            onChange={(e) => setForgottenInput(e.target.value)}
            placeholder="今回忘れたもの"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={() => {
              const n = forgottenInput.trim();
              if (!n) return;
              setForgotten((prev) => (prev.includes(n) ? prev : [...prev, n]));
              setForgottenInput("");
            }}
            style={{
              background: C.red,
              color: C.bg,
              border: "none",
              borderRadius: 4,
              padding: "0 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            記録
          </button>
        </div>
        {forgotten.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {forgotten.map((n) => (
              <button
                key={n}
                onClick={() => setForgotten((p) => p.filter((x) => x !== n))}
                style={{
                  border: `1px solid var(--tint-warn-line)`,
                  background: "var(--tint-warn-bg)",
                  color: "var(--tint-warn-ink)",
                  borderRadius: 16,
                  padding: "4px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {n} ×
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setEditMode((v) => !v)}
        style={{
          marginTop: 16,
          width: "100%",
          background: editMode ? C.green : "transparent",
          color: editMode ? C.bg : C.ink,
          border: `1px solid ${editMode ? C.green : C.muted}`,
          borderRadius: 4,
          padding: "10px 0",
          fontSize: 14,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer",
        }}
      >
        <Settings2 size={16} />
        {editMode ? "編集を終える" : "リストを編集"}
      </button>
    </div>
  );
}

// ===================== 予定タブ =====================

// 編集ボタン
function EditButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="編集"
      style={{
        border: "none",
        background: "transparent",
        color: C.sub,
        cursor: "pointer",
        padding: 6,
        flexShrink: 0,
      }}
    >
      <Pencil size={15} />
    </button>
  );
}

// フォーム下部の「やめる」＋「追加/更新」ボタン
function FormActions({ onCancel, onSubmit, editing }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={onCancel}
        style={{
          flex: 1,
          background: "transparent",
          border: `1px solid ${C.line}`,
          borderRadius: 4,
          padding: "10px 0",
          fontSize: 14,
          cursor: "pointer",
          color: C.sub,
        }}
      >
        やめる
      </button>
      <div style={{ flex: 2 }}>
        <PrimaryButton onClick={onSubmit}>
          {editing ? (
            <>
              <Check size={16} /> 更新
            </>
          ) : (
            <>
              <Plus size={16} /> 追加
            </>
          )}
        </PrimaryButton>
      </div>
    </div>
  );
}

const EMPTY_SCHEDULE = { day: 1, time: "", title: "", memo: "" };

function ScheduleTab({ trip, patchTrip }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SCHEDULE);
  const days = tripDays(trip);

  const byDay = useMemo(() => {
    const map = {};
    for (let d = 1; d <= days; d++) map[d] = [];
    (trip.schedule || []).forEach((s) => {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
    );
    return map;
  }, [trip.schedule, days]);

  function dateLabel(dayNum) {
    if (!trip.departure) return null;
    const d = new Date(trip.departure);
    d.setDate(d.getDate() + dayNum - 1);
    return `${d.getMonth() + 1}/${d.getDate()}(${"日月火水木金土"[d.getDay()]})`;
  }

  function closeForm() {
    setOpen(false);
    setEditingId(null);
    setForm(EMPTY_SCHEDULE);
  }

  function submit() {
    if (!form.title.trim()) return;
    const list = trip.schedule || [];
    const entry = { ...form, title: form.title.trim() };
    if (editingId) {
      patchTrip({
        schedule: list.map((s) => (s.id === editingId ? { ...entry, id: editingId } : s)),
      });
    } else {
      patchTrip({ schedule: [...list, { ...entry, id: `s-${Date.now()}` }] });
    }
    closeForm();
  }

  function openEdit(s) {
    setForm({ day: s.day, time: s.time || "", title: s.title, memo: s.memo || "" });
    setEditingId(s.id);
    setOpen(true);
  }

  function remove(id) {
    patchTrip({ schedule: (trip.schedule || []).filter((s) => s.id !== id) });
    if (id === editingId) closeForm();
  }

  const totalCount = (trip.schedule || []).length;


  return (
    <div>
      <SectionTitle right={`${totalCount}件`}>スケジュール</SectionTitle>

      {totalCount === 0 && !open && (
        <Empty>
          まだ予定がありません。
          <br />
          出発時刻やチェックイン、開演時刻などを登録しておくと便利です。
        </Empty>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
          const list = byDay[day] || [];
          if (list.length === 0) return null;
          return (
            <div key={day}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 900 }}>{day}日目</span>
                {dateLabel(day) && (
                  <span style={{ fontSize: 12, color: C.sub }}>{dateLabel(day)}</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {list.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      ...card,
                      display: "flex",
                      gap: 12,
                      padding: "12px 8px 12px 14px",
                      alignItems: "flex-start",
                      outline: s.id === editingId ? `2px solid ${C.green}` : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: s.time ? C.green : C.muted,
                        width: 46,
                        flexShrink: 0,
                        paddingTop: 1,
                      }}
                    >
                      {s.time || "--:--"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{s.title}</div>
                      {s.memo && (
                        <div style={{ fontSize: 12, color: C.sub, marginTop: 3, lineHeight: 1.6 }}>
                          {s.memo}
                        </div>
                      )}
                    </div>
                    <EditButton onClick={() => openEdit(s)} />
                    <DeleteButton onClick={() => remove(s.id)} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open ? (
        <div
          style={{
            marginTop: 16,
            background: C.paper,
            border: `1px dashed var(--muted)`,
            borderRadius: 4,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            {editingId ? "予定を編集" : "予定を追加"}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
              style={{ ...inputStyle, flex: 1 }}
            >
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}日目
                </option>
              ))}
            </select>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="予定（例：新幹線 金沢発）"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <input
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            placeholder="メモ（任意）"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <FormActions onCancel={closeForm} onSubmit={submit} editing={!!editingId} />
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus size={16} /> 予定を追加
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

// ===================== 予約タブ =====================

const EMPTY_RESERVATION = {
  category: "transport",
  title: "",
  when: "",
  number: "",
  memo: "",
};

function ReservationTab({ trip, patchTrip }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_RESERVATION);

  const list = trip.reservations || [];

  function closeForm() {
    setOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_RESERVATION, category: form.category });
  }

  function submit() {
    if (!form.title.trim()) return;
    const entry = { ...form, title: form.title.trim() };
    if (editingId) {
      patchTrip({
        reservations: list.map((r) => (r.id === editingId ? { ...entry, id: editingId } : r)),
      });
    } else {
      patchTrip({ reservations: [...list, { ...entry, id: `r-${Date.now()}` }] });
    }
    closeForm();
  }

  function openEdit(r) {
    setForm({
      category: r.category,
      title: r.title,
      when: r.when || "",
      number: r.number || "",
      memo: r.memo || "",
    });
    setEditingId(r.id);
    setOpen(true);
  }

  function remove(id) {
    patchTrip({ reservations: list.filter((r) => r.id !== id) });
    if (id === editingId) closeForm();
  }


  return (
    <div>
      <SectionTitle right={`${list.length}件`}>予約情報</SectionTitle>

      {list.length === 0 && !open && (
        <Empty>
          まだ予約がありません。
          <br />
          新幹線の座席や宿の予約番号を入れておくと現地で探さずに済みます。
        </Empty>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {RESERVATION_CATEGORIES.map((cat) => {
          const inCat = list.filter((r) => r.category === cat.id);
          if (inCat.length === 0) return null;
          const Icon = cat.icon;
          return (
            <div key={cat.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                  color: cat.color,
                }}
              >
                <Icon size={15} />
                <span style={{ fontSize: 14, fontWeight: 900 }}>{cat.label}</span>
                <span style={{ fontSize: 12, color: C.sub, fontWeight: 400 }}>
                  {inCat.length}件
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {inCat.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      ...card,
                      padding: "12px 8px 12px 14px",
                      borderLeft: `3px solid ${cat.color}`,
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      outline: r.id === editingId ? `2px solid ${C.green}` : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</div>
                      {r.when && (
                        <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{r.when}</div>
                      )}
                      {r.number && (
                        <div
                          style={{
                            fontSize: 13,
                            marginTop: 6,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            color: cat.color,
                            background: C.bg,
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 3,
                          }}
                        >
                          {r.number}
                        </div>
                      )}
                      {r.memo && (
                        <div style={{ fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>
                          {r.memo}
                        </div>
                      )}
                    </div>
                    <EditButton onClick={() => openEdit(r)} />
                    <DeleteButton onClick={() => remove(r.id)} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open ? (
        <div
          style={{
            marginTop: 16,
            background: C.paper,
            border: `1px dashed var(--muted)`,
            borderRadius: 4,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            {editingId ? "予約を編集" : "予約を追加"}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {RESERVATION_CATEGORIES.map((cat) => {
              const active = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.id })}
                  style={{
                    flex: 1,
                    border: `1px solid ${active ? cat.color : C.line}`,
                    background: active ? cat.color : "transparent",
                    color: active ? C.paper : C.sub,
                    borderRadius: 4,
                    padding: "8px 0",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="名称（例：かがやき503号 / ○○ホテル）"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <input
            value={form.when}
            onChange={(e) => setForm({ ...form, when: e.target.value })}
            placeholder="日時（例：3/14 8:12発 / 3/14〜3/16）"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <input
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            placeholder="予約番号・座席番号"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <input
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            placeholder="メモ（住所・電話番号など）"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <FormActions onCancel={closeForm} onSubmit={submit} editing={!!editingId} />
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus size={16} /> 予約を追加
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

// ===================== 場所タブ =====================

const EMPTY_PLACE = { name: "", region: "", category: "food", memo: "" };

function PlacesTab({ trip, patchTrip }) {
  const [groupBy, setGroupBy] = useState("region");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PLACE);

  const list = trip.places || [];
  const visited = list.filter((p) => p.visited).length;

  const groups = useMemo(() => {
    const map = new Map();
    list.forEach((p) => {
      const key =
        groupBy === "region"
          ? p.region?.trim() || "エリア未設定"
          : PLACE_CATEGORIES.find((c) => c.id === p.category)?.label || "その他";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return Array.from(map.entries());
  }, [list, groupBy]);

  function closeForm() {
    setOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_PLACE, region: form.region, category: form.category });
  }

  function submit() {
    if (!form.name.trim()) return;
    const entry = { ...form, name: form.name.trim() };
    if (editingId) {
      patchTrip({
        places: list.map((p) =>
          p.id === editingId ? { ...p, ...entry, id: editingId } : p
        ),
      });
    } else {
      patchTrip({
        places: [...list, { ...entry, id: `p-${Date.now()}`, visited: false }],
      });
    }
    closeForm();
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      region: p.region || "",
      category: p.category,
      memo: p.memo || "",
    });
    setEditingId(p.id);
    setOpen(true);
  }

  function toggleVisited(id) {
    patchTrip({
      places: list.map((p) => (p.id === id ? { ...p, visited: !p.visited } : p)),
    });
  }

  function remove(id) {
    patchTrip({ places: list.filter((p) => p.id !== id) });
    if (id === editingId) closeForm();
  }


  return (
    <div>
      <SectionTitle right={`${visited} / ${list.length} 訪問`}>行きたい場所</SectionTitle>

      {list.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[
            { id: "region", label: "地域別" },
            { id: "category", label: "カテゴリ別" },
          ].map((g) => {
            const active = groupBy === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGroupBy(g.id)}
                style={{
                  border: `1px solid ${active ? C.ink : C.line}`,
                  background: active ? C.ink : "transparent",
                  color: active ? C.bg : C.sub,
                  borderRadius: 16,
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      )}

      {list.length === 0 && !open && (
        <Empty>
          まだ場所が登録されていません。
          <br />
          事前に調べた店や観光地を入れておき、現地でチェックできます。
        </Empty>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map(([key, places]) => (
          <div key={key}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 900 }}>{key}</span>
              <span style={{ fontSize: 12, color: C.sub }}>{places.length}件</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {places.map((p) => {
                const cat = PLACE_CATEGORIES.find((c) => c.id === p.category);
                return (
                  <div
                    key={p.id}
                    style={{
                      ...card,
                      display: "flex",
                      gap: 8,
                      padding: "12px 8px 12px 14px",
                      alignItems: "flex-start",
                      outline: p.id === editingId ? `2px solid ${C.green}` : "none",
                    }}
                  >
                    <div
                      onClick={() => toggleVisited(p.id)}
                      style={{
                        display: "flex",
                        gap: 12,
                        flex: 1,
                        minWidth: 0,
                        cursor: "pointer",
                        alignItems: "flex-start",
                      }}
                    >
                      <CheckBox on={!!p.visited} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            textDecoration: p.visited ? "line-through" : "none",
                            color: p.visited ? C.done : C.ink,
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 5,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {cat && (
                            <span
                              style={{
                                fontSize: 11,
                                color: cat.color,
                                border: `1px solid ${cat.color}`,
                                borderRadius: 10,
                                padding: "1px 8px",
                              }}
                            >
                              {cat.label}
                            </span>
                          )}
                          {groupBy === "category" && p.region && (
                            <span style={{ fontSize: 11, color: C.sub }}>{p.region}</span>
                          )}
                        </div>
                        {p.memo && (
                          <div
                            style={{ fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.6 }}
                          >
                            {p.memo}
                          </div>
                        )}
                      </div>
                    </div>
                    <EditButton onClick={() => openEdit(p)} />
                    <DeleteButton onClick={() => remove(p.id)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <div
          style={{
            marginTop: 16,
            background: C.paper,
            border: `1px dashed var(--muted)`,
            borderRadius: 4,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            {editingId ? "場所を編集" : "場所を追加"}
          </div>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="場所の名前"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <input
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            placeholder="地域（例：金沢駅周辺 / ひがし茶屋街）"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {PLACE_CATEGORIES.map((cat) => {
              const active = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.id })}
                  style={{
                    border: `1px solid ${active ? cat.color : C.line}`,
                    background: active ? cat.color : "transparent",
                    color: active ? C.paper : C.sub,
                    borderRadius: 16,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <input
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            placeholder="メモ（営業時間・食べたいものなど）"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <FormActions onCancel={closeForm} onSubmit={submit} editing={!!editingId} />
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus size={16} /> 場所を追加
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

// ===================== ルート =====================

export default function TravelApp() {
  const [uid, setUid] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [forgotten, setForgotten] = useState([]);
  const [tab, setTab] = useState("packing");
  const [theme, setTheme] = useState("forest");
  const [view, setView] = useState("trip"); // "home" | "trip" | "settings"
  const [draft, setDraft] = useState({ name: "", departure: "", returnDate: "" });
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // 書き込みをまとめるための仕組み（コンポーネントの寿命の間だけ持つ）
  const debounceRef = useRef(makeDebouncer(800));

  // ---- 起動時：匿名ログイン → データ読み込み ----
  useEffect(() => {
    (async () => {
      try {
        const id = await ensureUser();
        setUid(id);
        const { settings, trips: loadedTrips } = await loadAll(id);
        if (loadedTrips.length) {
          setTrips(loadedTrips);
          setCurrentId(loadedTrips[0].id);
        }
        if (settings) {
          if (Array.isArray(settings.items) && settings.items.length) setItems(settings.items);
          if (Array.isArray(settings.forgotten)) setForgotten(settings.forgotten);
          if (settings.theme) setTheme(settings.theme);
        }
      } catch (e) {
        console.error(e);
        setLoadError("データの読み込みに失敗しました。通信環境を確認してください。");
      }
      setLoaded(true);
    })();
  }, []);

  // ---- 設定（テーマ・持ち物テンプレート・忘れ物履歴）の保存 ----
  useEffect(() => {
    if (!loaded || !uid) return;
    debounceRef.current("settings", () =>
      saveSettings(uid, { items, forgotten, theme })
    );
  }, [items, forgotten, theme, loaded, uid]);

  const trip = trips.find((t) => t.id === currentId) || null;

  // 画面を先に更新し、書き込みは少し待ってからまとめて送る
  function patchTrip(patch) {
    setTrips((prev) => {
      const next = prev.map((t) => (t.id === currentId ? { ...t, ...patch } : t));
      const updated = next.find((t) => t.id === currentId);
      if (uid && updated) {
        debounceRef.current(`trip:${currentId}`, () => saveTrip(uid, updated));
      }
      return next;
    });
  }

  // 入力チェック：エラーがあれば理由を返す（null なら作成可）
  const draftError = useMemo(() => {
    if (!draft.name.trim()) return "旅行名を入力してください";
    if (!draft.departure || !draft.returnDate) return "出発日と帰着日を入力してください";
    if (!calcDays(draft.departure, draft.returnDate))
      return "帰着日は出発日と同じ日か、それより後にしてください";
    return null;
  }, [draft]);

  const draftDays = calcDays(draft.departure, draft.returnDate);

  function createTrip() {
    if (draftError) return;
    const t = newTrip({
      name: draft.name.trim(),
      departure: draft.departure,
      returnDate: draft.returnDate,
    });
    setTrips((prev) => [t, ...prev]);
    setCurrentId(t.id);
    setDraft({ name: "", departure: "", returnDate: "" });
    setTab("packing");
    setView("trip");
    if (uid) saveTrip(uid, t).catch((e) => console.error("作成の保存に失敗:", e));
  }

  function deleteTrip(id) {
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === currentId) setCurrentId(next.length ? next[0].id : null);
      return next;
    });
    if (uid) removeTrip(uid, id).catch((e) => console.error("削除に失敗:", e));
  }

  const shell = {
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    background: C.bg,
    minHeight: "100dvh",
    color: C.ink,
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    // ホーム画面から起動したときに時計やノッチと重ならないようにする
    paddingTop: "env(safe-area-inset-top, 0px)",
    paddingLeft: "env(safe-area-inset-left, 0px)",
    paddingRight: "env(safe-area-inset-right, 0px)",
  };

  const fontStyle = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap');
      .travel-app {
        ${themeVarsCss(theme)}
      }
      * { box-sizing: border-box; }
      input, button, select { font-family: inherit; }
      button:focus-visible, input:focus-visible, select:focus-visible {
        outline: 2px solid ${C.green};
        outline-offset: 2px;
      }
      /* カレンダーボタンに重ねる日付入力：文字は透明にし、
         クリック領域（ピッカーを開くアイコン）をボタン全体に広げる */
      .cal-overlay {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        opacity: 0;
        margin: 0; padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
      }
      .cal-overlay::-webkit-calendar-picker-indicator {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        margin: 0; padding: 0;
        opacity: 0;
        cursor: pointer;
      }
      .cal-overlay:focus-visible {
        opacity: 1;
        outline: 2px solid ${C.green};
        outline-offset: 2px;
      }
    `}</style>
  );

  if (!loaded) {
    return (
      <div className="travel-app" style={{ ...shell, padding: 20 }}>
        {fontStyle}
        <div style={{ color: C.sub, fontSize: 13, paddingTop: 40, textAlign: "center" }}>
          読み込み中…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="travel-app" style={{ ...shell, padding: 20 }}>
        {fontStyle}
        <div
          style={{
            ...card,
            marginTop: 40,
            padding: 16,
            fontSize: 13,
            color: C.ink,
            lineHeight: 1.8,
          }}
        >
          {loadError}
          <div style={{ marginTop: 12 }}>
            <PrimaryButton onClick={() => window.location.reload()}>
              再読み込み
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  // ---- 設定画面 ----
  if (view === "settings") {
    return (
      <div className="travel-app" style={{ ...shell, padding: "20px 16px" }}>
        {fontStyle}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => setView(trip ? "trip" : "home")}
            aria-label="戻る"
            style={{
              border: `1px solid ${C.line}`,
              background: C.paper,
              borderRadius: 4,
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.ink,
            }}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span style={{ fontSize: 18, fontWeight: 900 }}>設定</span>
        </div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>テーマ</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
            アプリ全体の配色が切り替わります。
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{
                    border: `1.5px solid ${active ? C.ink : C.line}`,
                    background: "transparent",
                    borderRadius: 4,
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    {t.swatch.map((c, i) => (
                      <div key={i} style={{ width: 18, height: 18, background: c }} />
                    ))}
                  </div>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: C.ink,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {t.label}
                  </span>
                  {active && <Check size={16} color={C.green} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---- ホーム画面（旅行の一覧と作成） ----
  if (view === "home" || !trip) {
    return (
      <div className="travel-app" style={{ ...shell, padding: "20px 16px" }}>
        {fontStyle}
        <div
          style={{
            background: C.header,
            borderRadius: 4,
            padding: "18px 18px",
            color: C.headerFg,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Luggage size={16} strokeWidth={1.8} />
              <span style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}>旅のおとも</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.4 }}>
              {trips.length === 0 ? "旅行を作るところから" : "どの旅行を開きますか"}
            </div>
          </div>
          <button
            onClick={() => setView("settings")}
            aria-label="設定"
            style={{
              border: "none",
              background: C.headerBtn,
              color: C.headerFg,
              cursor: "pointer",
              width: 42,
              height: 42,
              borderRadius: 21,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>

        {/* 旅行一覧 */}
        {trips.length > 0 && (
          <>
            <SectionTitle right={`${trips.length}件`}>旅行</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {trips.map((t) => (
                <div
                  key={t.id}
                  style={{
                    ...card,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    onClick={() => {
                      setCurrentId(t.id);
                      setTab("packing");
                      setView("trip");
                    }}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                      {tripDays(t)}日間{t.departure ? `・${t.departure} 出発` : ""}
                    </div>
                  </div>
                  <DeleteButton onClick={() => deleteTrip(t.id)} />
                  <ChevronRight size={16} color={C.muted} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 新規作成 */}
        <SectionTitle>新しい旅行を作る</SectionTitle>
        <div style={{ ...card, padding: 14 }}>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="旅行名（例：金沢2泊3日）"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>出発日</div>
            <DateField
              value={draft.departure}
              onChange={(v) => setDraft((p) => ({ ...p, departure: v }))}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>帰着日</div>
            <DateField
              value={draft.returnDate}
              onChange={(v) => setDraft((p) => ({ ...p, returnDate: v }))}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              minHeight: 18,
              marginBottom: 10,
              color: draftError ? C.red : C.sub,
            }}
          >
            {draftDays && !draftError
              ? `${draftDays}日間の旅行になります`
              : draft.name || draft.departure || draft.returnDate
              ? draftError
              : ""}
          </div>
          <PrimaryButton onClick={createTrip} disabled={!!draftError}>
            <Plus size={16} /> 旅行を作る
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // ---- 旅行の画面 ----
  return (
    <div className="travel-app" style={shell}>
      {fontStyle}

      {/* ---- 本文（残り高さを埋めて下タブを最下部に固定） ---- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ---- ヘッダー ---- */}
        <div style={{ padding: "20px 16px 0" }}>
          <div style={{ background: C.header, borderRadius: 4, padding: "14px 16px", color: C.headerFg }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <button
                onClick={() => setView("home")}
                aria-label="ホームに戻る"
                style={{
                  border: "none",
                  background: C.headerBtn,
                  color: C.headerFg,
                  cursor: "pointer",
                  height: 42,
                  padding: "0 16px",
                  borderRadius: 21,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Home size={19} strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>ホーム</span>
              </button>
              <button
                onClick={() => setView("settings")}
                aria-label="設定"
                style={{
                  border: "none",
                  background: C.headerBtn,
                  color: C.headerFg,
                  cursor: "pointer",
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Settings size={20} strokeWidth={2} />
              </button>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.3 }}>{trip.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {tripDays(trip)}日間{trip.departure ? `・${trip.departure} 出発` : ""}
            </div>
          </div>
        </div>

        {/* ---- タブ内容 ---- */}
        <div style={{ padding: "0 16px" }}>
          {tab === "packing" && (
            <PackingTab
              trip={trip}
              patchTrip={patchTrip}
              items={items}
              setItems={setItems}
              forgotten={forgotten}
              setForgotten={setForgotten}
            />
          )}
          {tab === "schedule" && <ScheduleTab trip={trip} patchTrip={patchTrip} />}
          {tab === "reservation" && <ReservationTab trip={trip} patchTrip={patchTrip} />}
          {tab === "places" && <PlacesTab trip={trip} patchTrip={patchTrip} />}
        </div>
      </div>

      {/* ---- 下タブ ---- */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          marginTop: 24,
          background: C.paper,
          borderTop: `1px solid ${C.line}`,
          display: "flex",
          // iPhone のホームバーと重ならないようにする
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                borderTop: `2px solid ${active ? C.green : "transparent"}`,
                padding: "10px 0 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                color: active ? C.green : C.sub,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
