const brandGreen = "#8CBF45";

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        backgroundColor: "white",
        borderColor: "white",
        position: "sticky",
        top: "100vh",
      }}
    >
      {/* Green line */}
      <div style={{ height: "4px", backgroundColor: brandGreen }}></div>

      {/* Contact details */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "10px 0",
          fontSize: "14px",
          color: "#BFAFAF",
        }}
      >
        {/* Email */}
        <a
          href="mailto:info@managementproperties.co.uk"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          info@managementproperties.co.uk
        </a>

        {/* Address */}
        <a
          href="https://www.google.com/maps?q=15+Malvern+Road,+London,+NW6+5PS"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "inherit", textAlign: "center" }}
        >
          15 Malvern Road, London, NW6 5PS
          <br />
          020 7624 7665
        </a>

        {/* Website */}
        <a
          href="https://www.managementproperties.co.uk"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          www.managementproperties.co.uk
        </a>
      </div>
    </footer>
  );
}
