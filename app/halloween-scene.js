function Bat({ className }) {
  return (
    <svg className={className} viewBox="0 0 160 80" fill="currentColor" focusable="false">
      <path d="M80 31 71 17 68 31C52 26 32 9 8 6c4 17 2 29-6 42 17-4 29 0 35 14 9-7 20-6 29 5l14 11 14-11c9-11 20-12 29-5 6-14 18-18 35-14-8-13-10-25-6-42-24 3-44 20-60 25l-3-14Z" />
    </svg>
  );
}

function Web({ className }) {
  return (
    <svg className={className} viewBox="0 0 180 180" fill="none" stroke="currentColor" strokeWidth="1.3" focusable="false">
      <path d="M0 0 175 0M0 0 165 62M0 0 127 127M0 0 62 165M0 0 0 175M40 0Q30 8 37 14Q24 15 28 28Q15 24 14 37Q8 30 0 40M80 0Q65 18 75 28Q48 32 56 56Q32 48 28 75Q18 65 0 80M120 0Q98 25 112 42Q72 48 84 84Q48 72 42 112Q25 98 0 120M160 0Q130 33 150 56Q96 65 112 112Q65 96 56 150Q33 130 0 160" />
    </svg>
  );
}

export function Pumpkin({ className }) {
  return (
    <svg className={className} viewBox="0 0 130 120" focusable="false" aria-hidden="true">
      <path d="M63 27Q57 8 75 6l2 10q-11 0-7 13" fill="#739553" />
      <path d="M65 31C12 8-10 84 28 108c18 12 27 3 37 3s19 9 37-3c38-24 16-100-37-77Z" fill="#ed862e" />
      <ellipse cx="65" cy="71" rx="33" ry="44" fill="#ffac4f" />
      <path d="m29 62 21-12 1 19Zm72 0L80 50l-1 19ZM55 78l10-14 10 14ZM29 83l20 6 5-6 12 8 10-8 5 6 20-6c-9 29-61 29-72 0Z" fill="#251329" />
    </svg>
  );
}

function Skeleton() {
  return (
    <svg className="decoracao-esqueletinho" viewBox="0 0 100 180" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" focusable="false">
      <path d="M31 49C8 7 88 2 70 49l-7 12H39Z" fill="currentColor" strokeWidth="3" />
      <circle cx="39" cy="35" r="6" fill="#191022" stroke="none" /><circle cx="61" cy="35" r="6" fill="#191022" stroke="none" />
      <path d="M50 65v57M31 75l19 7 19-7M30 89l20 7 20-7M35 103l15 6 15-6M25 73 8 99l14 18M75 73l17 26-14 18M34 125h32M40 129l-9 25 5 18M60 129l9 25-5 18" />
    </svg>
  );
}

export default function HalloweenScene() {
  return (
    <div className="halloween-cenario" aria-hidden="true">
      <Web className="teia teia-esquerda" />
      <Web className="teia teia-direita" />
      <Bat className="morcego morcego-um" />
      <Bat className="morcego morcego-dois" />
      <div className="lua" />
      <Pumpkin className="decoracao-abobora" />
      <Skeleton />
    </div>
  );
}
