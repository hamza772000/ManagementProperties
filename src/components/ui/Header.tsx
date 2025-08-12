import headerImg from "../../assets/header.jpg";
import { NavLink } from "react-router-dom";

export default function Header() {
  const brandGreen = "#8CBF45";
  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: brandGreen }}>
      <div className="w-full" style={{ backgroundColor: "white" }}>
        <img src={headerImg} alt="Management Properties — Sales, Lettings & Management" className="mx-auto object-contain" style={{ height: "90px" }} />
      </div>
      <nav className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 text-sm text-white" style={{ backgroundColor: brandGreen }}>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Home</NavLink>
        <NavLink to="/for-sale" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>For Sale</NavLink>
        <NavLink to="/for-rent" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>For Rent</NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Contact</NavLink>
        <NavLink to="/services" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>Services & Fees</NavLink>
      </nav>
    </header>
  );
}
