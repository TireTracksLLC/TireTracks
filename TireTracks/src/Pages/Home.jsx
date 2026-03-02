import ContactForm from "../Components/ContactForm.jsx";
import React, {useState} from "react";

export default function Home() {
    return (
    <section className="homepage">
      <div className="homepage-overlay">
        <div className="homepage-text">
          <h1>
            NEW AGE <br />
            TIRE TRACKING <br />
            SOFTWARE
          </h1>
          <p>A Solution For Your Unique Tire Tracking Needs</p>
        </div>

        <ContactForm />
      </div>
    </section>
    );      
        
}
