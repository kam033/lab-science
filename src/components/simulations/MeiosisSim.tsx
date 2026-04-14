import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, Play, Pause, ArrowClockwise } from '@phosphor-icons/react'

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE DATA
// ═══════════════════════════════════════════════════════════════════════════════

interface Phase {
  id: number
  nameAr: string
  division: 'I' | 'II' | 'start' | 'inter'
  chromosomeCount: string
  keyEvent: string
  desc: string
  color: string
}

const PHASES: Phase[] = [
  {
    id: 0, nameAr: 'الخلية الأم', division: 'start',
    chromosomeCount: '2n = 4',
    keyEvent: 'خلية ثنائية المجموعة',
    desc: 'خلية أم تحتوي على 4 كروموسومات (زوجان متماثلان). كلٌّ منها مضاعف (كروماتيدان شقيقان). مُحاطة بغلاف نووي.',
    color: '#7c3aed'
  },
  {
    id: 1, nameAr: 'الطور التمهيدي I', division: 'I',
    chromosomeCount: '2n = 4',
    keyEvent: 'التشابك والتقاطع',
    desc: 'تتكثّف الكروموسومات وتتزاوج الأزواج المتماثلة مكوِّنةً رباعيات (bivalents). يحدث التقاطع (Crossing-over) عند نقاط الكياز.',
    color: '#2563eb'
  },
  {
    id: 2, nameAr: 'الطور الاستوائي I', division: 'I',
    chromosomeCount: '2n = 4',
    keyEvent: 'اصطفاف الرباعيات',
    desc: 'تصطفّ الرباعيات على خط الاستواء. كلٌّ من الكروموسومين المتماثلين يتصل بألياف مغزلية من قطب مختلف.',
    color: '#0891b2'
  },
  {
    id: 3, nameAr: 'الطور الانفصالي I', division: 'I',
    chromosomeCount: '2n → n+n',
    keyEvent: 'انفصال الأزواج المتماثلة',
    desc: 'تنجذب الكروموسومات المتماثلة نحو القطبين المتعاكسين. تبقى الكروماتيدان الشقيقتان ملتصقتَين عند السنترومير.',
    color: '#dc2626'
  },
  {
    id: 4, nameAr: 'الطور النهائي I', division: 'I',
    chromosomeCount: 'n = 2 × 2',
    keyEvent: 'تكوين خليتَين',
    desc: 'تتكوّن خليتان أحاديتا المجموعة الكروموسومية (n=2). كلٌّ منهما تحتوي على كروموسومين مضاعفَين (كروماتيدان شقيقان).',
    color: '#16a34a'
  },
  {
    id: 5, nameAr: 'بين الانقسامَين', division: 'inter',
    chromosomeCount: 'n = 2',
    keyEvent: 'لا مضاعفة للـ DNA',
    desc: 'مرحلة راحة قصيرة بين الانقسامَين. لا تتضاعف الكروموسومات. تبقى الخليتان كلٌّ منهما تحتوي 2 كروموسومات مضاعفة.',
    color: '#78716c'
  },
  {
    id: 6, nameAr: 'الطور التمهيدي II', division: 'II',
    chromosomeCount: 'n = 2',
    keyEvent: 'تكثّف الكروموسومات ثانيةً',
    desc: 'في كلٍّ من الخليتَين: تتكثّف الكروموسومات من جديد ويتحطّم الغلاف النووي. لا يحدث تقاطع هنا.',
    color: '#9333ea'
  },
  {
    id: 7, nameAr: 'الطور الاستوائي II', division: 'II',
    chromosomeCount: 'n = 2',
    keyEvent: 'اصطفاف الكروموسومات',
    desc: 'في كلٍّ من الخليتَين: تصطفّ الكروموسومات (كلٌّ منها كروماتيدان) على خط الاستواء.',
    color: '#0369a1'
  },
  {
    id: 8, nameAr: 'الطور الانفصالي II', division: 'II',
    chromosomeCount: 'n → ½n + ½n',
    keyEvent: 'انفصال الكروماتيدات الشقيقة',
    desc: 'في كلٍّ من الخليتَين: تنفصل الكروماتيدان الشقيقتان عند السنترومير وتنجذبان نحو القطبين.',
    color: '#b45309'
  },
  {
    id: 9, nameAr: 'الطور النهائي II', division: 'II',
    chromosomeCount: 'n = 1 × 4',
    keyEvent: '4 خلايا جنسية',
    desc: 'تتكوّن 4 خلايا جنسية أحادية المجموعة (n=1). كلٌّ منها تحتوي على كروموسومَين مفردَين. هذه هي الأمشاج (حبوب اللقاح).',
    color: '#15803d'
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SVG CHROMOSOME SHAPES
// ═══════════════════════════════════════════════════════════════════════════════

// A duplicated chromosome (X-shape) — two chromatids joined at centromere
function ChromosomeX({ x, y, color, size = 1, angle = 0 }: {
  x: number; y: number; color: string; size?: number; angle?: number
}) {
  const a = size * 9
  const b = size * 13
  const c = size * 4
  const transform = `translate(${x},${y}) rotate(${angle})`
  return (
    <g transform={transform}>
      {/* Left arm top */}
      <path d={`M-${c},0 Q-${a},-${b/3} -${a},-${b}`} stroke={color} strokeWidth={size * 3} fill="none" strokeLinecap="round" />
      {/* Right arm top */}
      <path d={`M${c},0 Q${a},-${b/3} ${a},-${b}`} stroke={color} strokeWidth={size * 3} fill="none" strokeLinecap="round" />
      {/* Left arm bottom */}
      <path d={`M-${c},0 Q-${a},${b/3} -${a},${b}`} stroke={color} strokeWidth={size * 3} fill="none" strokeLinecap="round" />
      {/* Right arm bottom */}
      <path d={`M${c},0 Q${a},${b/3} ${a},${b}`} stroke={color} strokeWidth={size * 3} fill="none" strokeLinecap="round" />
      {/* Centromere */}
      <circle cx="0" cy="0" r={size * 4.5} fill={color} />
    </g>
  )
}

// A single chromatid (rod/oval shape)
function Chromatid({ x, y, color, size = 1, angle = 0 }: {
  x: number; y: number; color: string; size?: number; angle?: number
}) {
  const h = size * 18
  const w = size * 5
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <rect x={-w} y={-h} width={w * 2} height={h * 2} rx={w} fill={color} opacity={0.9} />
    </g>
  )
}

// Cell membrane circle
function CellMembrane({ x, y, r, fill = '#1e293b', stroke = '#475569', strokeW = 2 }: {
  x: number; y: number; r: number; fill?: string; stroke?: string; strokeW?: number
}) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.88} fill={fill} stroke={stroke} strokeWidth={strokeW} />
}

// Nuclear envelope
function NuclearEnvelope({ x, y, r }: { x: number; y: number; r: number }) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.88} fill="none" stroke="#7c3aed55" strokeWidth={1.5} strokeDasharray="4 2" />
}

// Spindle fibers
function SpindleFibers({ x, y, r, show = true }: { x: number; y: number; r: number; show?: boolean }) {
  if (!show) return null
  return (
    <g opacity={0.4}>
      {[-20, 0, 20].map(offset => (
        <g key={offset}>
          <line x1={x - r} y1={y + offset} x2={x + r} y2={y + offset} stroke="#f59e0b" strokeWidth={0.8} />
        </g>
      ))}
    </g>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE SVG DIAGRAMS
// ═══════════════════════════════════════════════════════════════════════════════

// Colors
const RED1 = '#ef4444'   // maternal chromosome 1 (large)
const RED2 = '#fca5a5'   // sister chromatid of above
const BLU1 = '#3b82f6'   // paternal chromosome 1 (large)
const BLU2 = '#93c5fd'   // sister chromatid
const GRN1 = '#22c55e'   // maternal chromosome 2 (small)
const GRN2 = '#86efac'
const PUR1 = '#a855f7'   // paternal chromosome 2 (small)
const PUR2 = '#d8b4fe'

function PhaseSVG({ phaseId, w = 520, h = 300 }: { phaseId: number; w?: number; h?: number }) {
  const cx = w / 2
  const cy = h / 2

  switch (phaseId) {
    // ── 0: Parent cell ───────────────────────────────────────────────────────
    case 0: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx} y={cy} r={120} stroke="#7c3aed" strokeW={3} />
        <NuclearEnvelope x={cx} y={cy} r={80} />
        {/* 4 chromosomes scattered in nucleus */}
        <ChromosomeX x={cx - 40} y={cy - 30} color={RED1} size={0.9} angle={-20} />
        <ChromosomeX x={cx + 40} y={cy - 25} color={BLU1} size={0.9} angle={15} />
        <ChromosomeX x={cx - 30} y={cy + 35} color={GRN1} size={0.7} angle={30} />
        <ChromosomeX x={cx + 35} y={cy + 30} color={PUR1} size={0.7} angle={-10} />
        {/* Legend */}
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">خلية أم — 2n=4 (زوجان من الكروموسومات المتماثلة)</text>
      </svg>
    )

    // ── 1: Prophase I ────────────────────────────────────────────────────────
    case 1: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx} y={cy} r={120} stroke="#2563eb" strokeW={3} />
        {/* Bivalent 1: red + blue (large) paired */}
        <ChromosomeX x={cx - 25} y={cy - 35} color={RED1} size={0.9} angle={-10} />
        <ChromosomeX x={cx + 5} y={cy - 35} color={BLU1} size={0.9} angle={10} />
        {/* Chiasma line */}
        <line x1={cx - 10} y1={cy - 35} x2={cx - 10} y2={cy - 55} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" />
        {/* Bivalent 2: green + purple (small) paired */}
        <ChromosomeX x={cx - 20} y={cy + 40} color={GRN1} size={0.7} angle={5} />
        <ChromosomeX x={cx + 10} y={cy + 40} color={PUR1} size={0.7} angle={-5} />
        <line x1={cx - 5} y1={cy + 40} x2={cx - 5} y2={cy + 58} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" />
        {/* Chiasma labels */}
        <text x={cx - 10} y={cy - 60} textAnchor="middle" fontSize="9" fill="#f59e0b" fontFamily="Cairo,sans-serif">كياز</text>
        <text x={cx - 5} y={cy + 68} textAnchor="middle" fontSize="9" fill="#f59e0b" fontFamily="Cairo,sans-serif">كياز</text>
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">رباعيتان — تقاطع عند نقاط الكياز</text>
      </svg>
    )

    // ── 2: Metaphase I ───────────────────────────────────────────────────────
    case 2: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx} y={cy} r={120} stroke="#0891b2" strokeW={3} />
        {/* Equatorial plate line */}
        <line x1={cx} y1={cy - 100} x2={cx} y2={cy + 100} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.6} />
        <text x={cx + 6} y={cy - 85} fontSize="9" fill="#f59e0b" fontFamily="Cairo,sans-serif">خط الاستواء</text>
        {/* Spindle fibers */}
        {[-30, 0, 30, -50, 50].map(dy => (
          <line key={dy} x1={cx - 110} y1={cy + dy} x2={cx + 110} y2={cy + dy} stroke="#f59e0b" strokeWidth={0.7} opacity={0.25} />
        ))}
        {/* Bivalent 1 at plate */}
        <ChromosomeX x={cx - 22} y={cy - 30} color={RED1} size={0.9} angle={0} />
        <ChromosomeX x={cx + 22} y={cy - 30} color={BLU1} size={0.9} angle={0} />
        {/* Bivalent 2 at plate */}
        <ChromosomeX x={cx - 18} y={cy + 32} color={GRN1} size={0.7} angle={0} />
        <ChromosomeX x={cx + 18} y={cy + 32} color={PUR1} size={0.7} angle={0} />
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">اصطفاف الرباعيات على خط الاستواء</text>
      </svg>
    )

    // ── 3: Anaphase I ────────────────────────────────────────────────────────
    case 3: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx} y={cy} r={125} stroke="#dc2626" strokeW={3} />
        {/* Left pole: red + green */}
        <ChromosomeX x={cx - 65} y={cy - 10} color={RED1} size={0.9} angle={-15} />
        <ChromosomeX x={cx - 62} y={cy + 35} color={GRN1} size={0.7} angle={10} />
        {/* Right pole: blue + purple */}
        <ChromosomeX x={cx + 65} y={cy - 10} color={BLU1} size={0.9} angle={15} />
        <ChromosomeX x={cx + 62} y={cy + 35} color={PUR1} size={0.7} angle={-10} />
        {/* Arrows showing movement */}
        <text x={cx - 45} y={cy - 35} fontSize="18" fill="#ef4444" textAnchor="middle">←</text>
        <text x={cx + 45} y={cy - 35} fontSize="18" fill="#3b82f6" textAnchor="middle">→</text>
        {/* Cleavage furrow hint */}
        <line x1={cx} y1={cy - 105} x2={cx} y2={cy + 105} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">انفصال الكروموسومات المتماثلة نحو القطبين</text>
      </svg>
    )

    // ── 4: Telophase I ───────────────────────────────────────────────────────
    case 4: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        {/* Two daughter cells */}
        <CellMembrane x={cx - 65} y={cy} r={80} stroke="#16a34a" strokeW={2.5} />
        <CellMembrane x={cx + 65} y={cy} r={80} stroke="#16a34a" strokeW={2.5} />
        <NuclearEnvelope x={cx - 65} y={cy} r={55} />
        <NuclearEnvelope x={cx + 65} y={cy} r={55} />
        {/* Cell 1: red + green */}
        <ChromosomeX x={cx - 82} y={cy - 15} color={RED1} size={0.85} angle={-10} />
        <ChromosomeX x={cx - 48} y={cy + 18} color={GRN1} size={0.65} angle={10} />
        {/* Cell 2: blue + purple */}
        <ChromosomeX x={cx + 48} y={cy - 15} color={BLU1} size={0.85} angle={10} />
        <ChromosomeX x={cx + 82} y={cy + 18} color={PUR1} size={0.65} angle={-10} />
        {/* n labels */}
        <text x={cx - 65} y={cy + 72} textAnchor="middle" fontSize="10" fill="#4ade80" fontFamily="monospace">n = 2</text>
        <text x={cx + 65} y={cy + 72} textAnchor="middle" fontSize="10" fill="#4ade80" fontFamily="monospace">n = 2</text>
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">خليتان أحاديتا المجموعة — كل منهما n=2</text>
      </svg>
    )

    // ── 5: Interkinesis ──────────────────────────────────────────────────────
    case 5: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx - 65} y={cy} r={80} stroke="#78716c" strokeW={2.5} />
        <CellMembrane x={cx + 65} y={cy} r={80} stroke="#78716c" strokeW={2.5} />
        <NuclearEnvelope x={cx - 65} y={cy} r={55} />
        <NuclearEnvelope x={cx + 65} y={cy} r={55} />
        {/* Chromosomes slightly decondensed */}
        <ChromosomeX x={cx - 78} y={cy - 12} color={RED1} size={0.8} angle={-5} />
        <ChromosomeX x={cx - 50} y={cy + 15} color={GRN1} size={0.6} angle={8} />
        <ChromosomeX x={cx + 50} y={cy - 12} color={BLU1} size={0.8} angle={5} />
        <ChromosomeX x={cx + 78} y={cy + 15} color={PUR1} size={0.6} angle={-8} />
        {/* No DNA replication label */}
        <text x={cx} y={cy - 75} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="Cairo,sans-serif">لا تضاعف DNA</text>
        <text x={cx - 65} y={cy + 72} textAnchor="middle" fontSize="10" fill="#a8a29e" fontFamily="monospace">n = 2</text>
        <text x={cx + 65} y={cy + 72} textAnchor="middle" fontSize="10" fill="#a8a29e" fontFamily="monospace">n = 2</text>
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">مرحلة الراحة — لا تضاعف للكروموسومات</text>
      </svg>
    )

    // ── 6: Prophase II ───────────────────────────────────────────────────────
    case 6: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx - 65} y={cy} r={80} stroke="#9333ea" strokeW={2.5} />
        <CellMembrane x={cx + 65} y={cy} r={80} stroke="#9333ea" strokeW={2.5} />
        {/* More condensed chromosomes — nuclear envelope gone */}
        <ChromosomeX x={cx - 78} y={cy - 15} color={RED1} size={0.9} angle={-10} />
        <ChromosomeX x={cx - 50} y={cy + 20} color={GRN1} size={0.7} angle={5} />
        <ChromosomeX x={cx + 50} y={cy - 15} color={BLU1} size={0.9} angle={10} />
        <ChromosomeX x={cx + 78} y={cy + 20} color={PUR1} size={0.7} angle={-5} />
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">تكثّف الكروموسومات — الغلاف النووي يتحطّم</text>
      </svg>
    )

    // ── 7: Metaphase II ──────────────────────────────────────────────────────
    case 7: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx - 65} y={cy} r={80} stroke="#0369a1" strokeW={2.5} />
        <CellMembrane x={cx + 65} y={cy} r={80} stroke="#0369a1" strokeW={2.5} />
        {/* Equatorial plates */}
        <line x1={cx - 65} y1={cy - 70} x2={cx - 65} y2={cy + 70} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <line x1={cx + 65} y1={cy - 70} x2={cx + 65} y2={cy + 70} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        {/* Cell 1: red + green aligned */}
        <ChromosomeX x={cx - 65} y={cy - 25} color={RED1} size={0.85} angle={0} />
        <ChromosomeX x={cx - 65} y={cy + 25} color={GRN1} size={0.65} angle={0} />
        {/* Cell 2: blue + purple aligned */}
        <ChromosomeX x={cx + 65} y={cy - 25} color={BLU1} size={0.85} angle={0} />
        <ChromosomeX x={cx + 65} y={cy + 25} color={PUR1} size={0.65} angle={0} />
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">اصطفاف الكروموسومات على خط الاستواء في كلٍّ من الخليتَين</text>
      </svg>
    )

    // ── 8: Anaphase II ───────────────────────────────────────────────────────
    case 8: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        <CellMembrane x={cx - 65} y={cy} r={80} stroke="#b45309" strokeW={2.5} />
        <CellMembrane x={cx + 65} y={cy} r={80} stroke="#b45309" strokeW={2.5} />
        {/* Cell 1: chromatids separating — single rods */}
        <Chromatid x={cx - 88} y={cy - 20} color={RED1} size={0.9} angle={0} />
        <Chromatid x={cx - 42} y={cy - 20} color={RED2} size={0.9} angle={0} />
        <Chromatid x={cx - 88} y={cy + 22} color={GRN1} size={0.7} angle={0} />
        <Chromatid x={cx - 42} y={cy + 22} color={GRN2} size={0.7} angle={0} />
        {/* Cell 2: chromatids separating */}
        <Chromatid x={cx + 42} y={cy - 20} color={BLU1} size={0.9} angle={0} />
        <Chromatid x={cx + 88} y={cy - 20} color={BLU2} size={0.9} angle={0} />
        <Chromatid x={cx + 42} y={cy + 22} color={PUR1} size={0.7} angle={0} />
        <Chromatid x={cx + 88} y={cy + 22} color={PUR2} size={0.7} angle={0} />
        {/* Arrows */}
        <text x={cx - 65} y={cy - 55} fontSize="16" fill="#f97316" textAnchor="middle">↔</text>
        <text x={cx + 65} y={cy - 55} fontSize="16" fill="#f97316" textAnchor="middle">↔</text>
        <text x={cx} y={h - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">انفصال الكروماتيدات الشقيقة نحو القطبين</text>
      </svg>
    )

    // ── 9: Telophase II ──────────────────────────────────────────────────────
    case 9: return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <rect width={w} height={h} fill="#0f172a" />
        {/* 4 small haploid cells */}
        {[
          { x: cx - 120, y: cy - 60, chr1: RED1,  chr2: GRN1 },
          { x: cx - 20,  y: cy - 60, chr1: RED2,  chr2: GRN2 },
          { x: cx - 120, y: cy + 60, chr1: BLU1,  chr2: PUR1 },
          { x: cx - 20,  y: cy + 60, chr1: BLU2,  chr2: PUR2 },
        ].map(({ x, y, chr1, chr2 }, i) => (
          <g key={i}>
            <CellMembrane x={x + 60} y={y} r={50} stroke="#15803d" strokeW={2} />
            <NuclearEnvelope x={x + 60} y={y} r={33} />
            <Chromatid x={x + 48} y={y - 8} color={chr1} size={0.85} angle={-10} />
            <Chromatid x={x + 72} y={y + 10} color={chr2} size={0.65} angle={10} />
            <text x={x + 60} y={y + 42} textAnchor="middle" fontSize="9" fill="#4ade80" fontFamily="monospace">n=1</text>
          </g>
        ))}
        <text x={cx + 30} y={cy} fontSize="28" fill="#94a3b8" textAnchor="middle">→</text>
        <text x={cx} y={h - 10} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="Cairo,sans-serif">4 خلايا جنسية أحادية المجموعة — حبوب اللقاح (n=1)</text>
      </svg>
    )

    default: return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHROMOSOME LEGEND
// ═══════════════════════════════════════════════════════════════════════════════

function ChromosomeLegend() {
  return (
    <div className="flex gap-4 flex-wrap text-xs font-cairo justify-center">
      {[
        { color: RED1,  label: 'كروموسوم I (أمي)' },
        { color: BLU1,  label: 'كروموسوم I (أبوي)' },
        { color: GRN1,  label: 'كروموسوم II (أمي)' },
        { color: PUR1,  label: 'كروموسوم II (أبوي)' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-slate-300">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const DIVISION_COLORS: Record<string, string> = {
  start: 'bg-purple-700',
  I: 'bg-blue-700',
  inter: 'bg-stone-600',
  II: 'bg-violet-700',
}

const DIVISION_LABELS: Record<string, string> = {
  start: 'البداية',
  I: 'الانقسام الاختزالي I',
  inter: 'بين الانقسامَين',
  II: 'الانقسام الاختزالي II',
}

export function MeiosisSim() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [tab, setTab] = useState<'sim' | 'compare'>('sim')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phase = PHASES[step]

  // Auto-play
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= PHASES.length - 1) { setPlaying(false); return s }
          return s + 1
        })
      }, 2200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing])

  const prev = () => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }
  const next = () => { setPlaying(false); setStep(s => Math.min(PHASES.length - 1, s + 1)) }
  const reset = () => { setPlaying(false); setStep(0) }

  return (
    <div className="space-y-4 font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-lg">محاكاة الانقسام الاختزالي — متك نبات الزنبق</h3>
        <div className="flex gap-2">
          {(['sim', 'compare'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded border text-sm transition-all ${tab === t
                ? 'bg-purple-700 border-purple-600 text-white'
                : 'border-slate-600 hover:bg-slate-700 text-slate-300'}`}>
              {t === 'sim' ? '🔬 المحاكاة' : '📋 المقارنة'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sim' && (
        <>
          {/* Progress bar - phases overview */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {PHASES.map((p, i) => (
              <button key={i} onClick={() => { setPlaying(false); setStep(i) }}
                className={`flex-shrink-0 px-2 py-1 rounded text-xs transition-all border font-cairo ${i === step
                  ? `${DIVISION_COLORS[p.division]} text-white border-transparent shadow-md`
                  : i < step
                  ? 'bg-slate-700 border-slate-600 text-slate-300'
                  : 'border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
                {i === step && '← '}{p.nameAr}
              </button>
            ))}
          </div>

          {/* Phase info bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${DIVISION_COLORS[phase.division]} text-white text-xs font-cairo`}>
              {DIVISION_LABELS[phase.division]}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">{phase.chromosomeCount}</Badge>
            <span className="text-sm text-amber-400 font-cairo font-bold">{phase.keyEvent}</span>
          </div>

          {/* SVG Diagram */}
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            <PhaseSVG phaseId={step} />
          </div>

          {/* Legend */}
          <ChromosomeLegend />

          {/* Description */}
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-slate-200 font-cairo leading-relaxed">{phase.desc}</p>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={reset}
              className="p-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors text-slate-300">
              <ArrowClockwise size={18} />
            </button>
            <button onClick={prev} disabled={step === 0}
              className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 disabled:opacity-30 transition-colors flex items-center gap-1.5 font-cairo text-sm">
              <ArrowRight size={16} /> السابق
            </button>
            <button onClick={() => setPlaying(p => !p)}
              className={`px-4 py-2 rounded-lg border text-sm font-cairo flex items-center gap-1.5 transition-colors ${playing
                ? 'bg-amber-700 border-amber-600 text-white'
                : 'bg-green-700 border-green-600 text-white hover:bg-green-600'}`}>
              {playing ? <><Pause size={16} /> إيقاف</> : <><Play size={16} /> تشغيل تلقائي</>}
            </button>
            <button onClick={next} disabled={step === PHASES.length - 1}
              className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 disabled:opacity-30 transition-colors flex items-center gap-1.5 font-cairo text-sm">
              التالي <ArrowLeft size={16} />
            </button>
          </div>

          {/* Step indicator */}
          <p className="text-center text-xs text-slate-500 font-mono">
            {step + 1} / {PHASES.length} — {phase.nameAr}
          </p>
        </>
      )}

      {/* ── Comparison tab ─────────────────────────────────────────────────── */}
      {tab === 'compare' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Meiosis I */}
            <Card className="border-blue-800/50 bg-blue-950/20">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-bold text-blue-400 font-cairo text-center border-b border-blue-800/50 pb-2">
                  الانقسام الاختزالي الأول (I)
                </h4>
                {PHASES.filter(p => p.division === 'I').map(p => (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      <span className="font-bold text-sm text-slate-200">{p.nameAr}</span>
                      <Badge variant="outline" className="text-xs font-mono mr-auto">{p.chromosomeCount}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-cairo pr-4 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Meiosis II */}
            <Card className="border-violet-800/50 bg-violet-950/20">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-bold text-violet-400 font-cairo text-center border-b border-violet-800/50 pb-2">
                  الانقسام الاختزالي الثاني (II)
                </h4>
                {PHASES.filter(p => p.division === 'II').map(p => (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                      <span className="font-bold text-sm text-slate-200">{p.nameAr}</span>
                      <Badge variant="outline" className="text-xs font-mono mr-auto">{p.chromosomeCount}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-cairo pr-4 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Key differences table */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <h4 className="font-bold font-cairo mb-3 text-sm">الفروق الرئيسية بين الانقسامَين</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-cairo">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-2 text-slate-400">الخاصية</th>
                      <th className="text-center p-2 text-blue-400">الانقسام I</th>
                      <th className="text-center p-2 text-violet-400">الانقسام II</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {[
                      ['ما يُفصل', 'الكروموسومات المتماثلة', 'الكروماتيدات الشقيقة'],
                      ['الطور التمهيدي', 'تقاطع (Crossing-over)', 'لا تقاطع'],
                      ['الناتج', 'خليتان (n=2)', 'أربع خلايا (n=1)'],
                      ['التنوع الوراثي', 'يتحقق هنا', 'لا تنوع جديد'],
                      ['الشبيه بـ', 'فريد للانقسام الاختزالي', 'مشابه للانقسام الخيطي'],
                    ].map(([prop, m1, m2], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/30' : ''}>
                        <td className="p-2 font-bold">{prop}</td>
                        <td className="p-2 text-center">{m1}</td>
                        <td className="p-2 text-center">{m2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-green-950/30 border-green-800/40">
            <CardContent className="p-4 font-cairo">
              <div className="text-center text-sm font-bold text-green-300 mb-2">الملخص النهائي</div>
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                {[
                  { label: 'خلية أم', val: '2n=4', color: 'text-purple-400' },
                  { label: '→ بعد الانقسام I', val: '2 خلية (n=2)', color: 'text-blue-400' },
                  { label: '→ بعد الانقسام II', val: '4 أمشاج (n=1)', color: 'text-green-400' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="text-center">
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className={`font-bold font-mono ${color}`}>{val}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
                في متك نبات الزنبق: تحدث هذه الأطوار في خلايا أم حبوب اللقاح (n=12) لتنتج حبوب لقاح وظيفية
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
