export default function About() {
  return (
    <section id="About" className="About-Section">
      <div className="About-Container">
        <h1>How we differ from the rest</h1>

        <div className="About-Grid">
          <div className="About-Card">
            <h2>Performance</h2>
            <p>
              We know the struggles of trying to keep a proper inventory, so we
              take that struggle out of your hands. With TireTracks, tracking
              your inventory has never been easier.
            </p>
          </div>

          <div className="About-Card About-Card-Center">
            <img src="/services_2.webp" alt="Tire warehouse" />
            <h2>Growth</h2>
            <p>
              We at TireTracks try to make it as easy as possible for your
              company to grow. We provide the tools that allow your inventory to
              expand and work more efficiently.
            </p>
          </div>

          <div className="About-Card">
            <h2>Communication</h2>
            <p>
              We want an open line of communication that allows you to give us
              feedback on what is good and what is not. Help us help you and
              watch your changes make an impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}