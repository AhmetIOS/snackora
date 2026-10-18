import { Bag, Bar, Bottle, Can, CeramicCup, P, PaperCup, Pouch, Steam } from "./parts";

/**
 * Oversized product still-life per machine category – makes the category
 * readable at a glance (also at thumbnail size on mobile).
 */

const CHOC = "#7A4A33";

export function ProductCluster({ kind, className }: { kind: "snack" | "drink" | "combo" | "coffee"; className?: string }) {
  const base = 152;
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden="true" focusable="false">
      <ellipse cx={110} cy={154} rx={98} ry={6} fill={P.ink} opacity={0.16} />
      {kind === "snack" && (
        <>
          <Bar x={22} base={base} w={42} h={112} color={CHOC} accent={P.mustard} />
          <Bag x={58} base={base} w={88} h={124} color={P.paprika} />
          <Pouch x={140} base={base} w={64} h={86} color={P.forestPack} accent={P.mustard} />
        </>
      )}
      {kind === "drink" && (
        <>
          <Bottle x={28} base={base} w={50} h={138} color={P.sky} accent={P.cream} />
          <Can x={86} base={base} w={56} h={96} color={P.paprika} />
          <Bottle x={150} base={base} w={46} h={124} color={P.mustard} accent={P.cream} />
        </>
      )}
      {kind === "coffee" && (
        <>
          <Pouch x={18} base={base} w={66} h={92} color="#6B4330" accent="#2E1A10" />
          <Steam cx={118} y={40} size={34} color={P.forest} />
          <PaperCup x={88} base={base} w={62} h={104} />
          <CeramicCup cx={182} base={base} w={46} foam />
        </>
      )}
      {kind === "combo" && (
        <>
          <Bag x={16} base={base} w={82} h={114} color={P.mustard} accent={P.ink} />
          <Can x={104} base={base} w={50} h={88} color={P.berry} />
          <Bottle x={160} base={base} w={44} h={128} color={P.sky} accent={P.cream} />
        </>
      )}
    </svg>
  );
}
