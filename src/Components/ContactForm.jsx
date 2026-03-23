export default function ContactForm() {
  return (
    <div className="contact-card">
      <h3>Contact Us</h3>

      <div className="form-row">
        <input placeholder="First name *" />
        <input placeholder="Last name *" />
      </div>

      <input placeholder="Email *" />
      <input placeholder="Phone number" />
      <button className="submit-btn">Submit</button>
    </div>
  )
}