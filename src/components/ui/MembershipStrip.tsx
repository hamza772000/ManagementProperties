import cmpLogo from "../../assets/logos/cmp.png";
import dpsLogo from "../../assets/logos/dps.png";
import prsLogo from "../../assets/logos/prs.jpg";

const MEMBERSHIP_LOGOS = [
  { href: "https://www.ukala.org.uk/client-money-protection/", alt: "CMP Certified – Client Money Protection", src: cmpLogo },
  { href: "https://www.depositprotection.com/", alt: "DPS – Deposit Protection Service", src: dpsLogo },
  { href: "https://www.theprs.co.uk/", alt: "PRS – Property Redress Scheme", src: prsLogo },
];

export default function MembershipStrip() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text mb-4">Management Properties is a Member of:</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {MEMBERSHIP_LOGOS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" aria-label={l.alt} className="shrink-0">
              <img src={l.src} alt={l.alt} className="h-14 md:h-35 object-contain transition" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
