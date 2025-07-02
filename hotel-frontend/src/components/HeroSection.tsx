function HeroSection() {
  return (
    <div style={{
      backgroundImage: "url('/hero.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "250px",
      position: "relative",
      marginTop: "20px"
    }}>
      <div style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h2 style={{ color: "white", fontSize: "24px" }}>Welcome to Hotel Booking</h2>
      </div>
    </div>
  );
}

export default HeroSection;
