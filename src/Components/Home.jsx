import ContactForm from "./ContactForm.jsx";

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

        <ContactForm />
      </div>
    </section>
  );
}