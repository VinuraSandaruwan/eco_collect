function Footer() {
  return (
    <footer
      className="bg-white text-center py-3 shadow-sm"
      style={{
        fontSize:"13px"
      }}
    >
      <span className="text-muted">
        © {new Date().getFullYear()} Municipal Council. All Rights Reserved.
      </span>
    </footer>
  );
}
export default Footer;