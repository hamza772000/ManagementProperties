import footerImg from "../../assets/footer.jpg";

export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ backgroundColor: "white", borderColor: "white", position: "sticky", top: "100vh" }}>
      <img src={footerImg} alt="Management Properties — Contact details" className="w-full" style={{ height: "120px", objectFit: "contain", objectPosition: "center" }} />
    </footer>
  );
}
