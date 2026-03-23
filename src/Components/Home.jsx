export default function Home() {
  return (
    <section id="homepage" className="homepage">
      <div className="homepage-overlay">
        <div className="homepage-text">
          <h1>
            NEW AGE
            <br />
            TIRE
            <br />
            TRACKING
            <br />
            SOFTWARE
          </h1>
        </div>

        <div className="contact-card">
          <h2>Contact Us</h2>

          <div className="form-row">
            <input type="text" placeholder="First name *" />
            <input type="text" placeholder="Last name *" />
          </div>

          <input type="email" placeholder="Email *" />
          <input type="text" placeholder="Phone number" />

          <button className="submit-btn">Submit</button>
        </div>
      </div>
    </section>
  )
}