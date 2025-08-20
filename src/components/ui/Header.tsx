import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Header() {
  const brandGreen = "#8CBF45";

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top white section - centered logo block */}
      <div
        style={{
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          padding: "12px 0",
          width: "100%",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <img
            src={logo}
            alt="Management Properties Logo"
            style={{ height: "65px", width: "auto" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Main title */}
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#9B3D3D",
                lineHeight: "1.1", // tighter spacing
              }}
            >
              MANAGEMENT PROPERTIES
            </span>

            {/* Subtitle - centered under title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "2px", // reduced gap
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#9B3D3D",
                  lineHeight: "1.1", // tighter spacing
                }}
              >
                SALES, LETTINGS & MANAGEMENT
              </span>
              <div
                style={{
                  height: "2px",
                  backgroundColor: brandGreen,
                  width: "100%",
                  maxWidth: "220px",
                  marginTop: "3px", // slightly smaller underline gap
                }}
              ></div>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation bar */}
      <nav
        className="flex items-center gap-6 text-sm"
        style={{
          backgroundColor: brandGreen,
          color: "white",
          justifyContent: "center",
          padding: "8px 0",
          width: "100%",
        }}
      >
        <NavLink to="/" end className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Home
        </NavLink>
        <NavLink to="/for-sale" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Sale
        </NavLink>
        <NavLink to="/for-rent" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Rent
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Contact
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => (isActive ? "underline" : "hover:underline")}>
          Services & Fees
        </NavLink>
      </nav>
    </header>
  );
}
