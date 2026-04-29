import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactForm() {
  const formRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    console.log("Contact form submitted");
    setStatusMessage("Sending message...");

    const serviceId = "service_mjwaxgi";
    const templateId = "template_qzcjtj8q";
    const publicKey = "iKBFwxrnh8YaBao_j";

    const hasMissingConfig =
      !serviceId ||
      !templateId ||
      !publicKey ||
      serviceId.includes("your_") ||
      templateId.includes("your_") ||
      publicKey.includes("your_");

    if (hasMissingConfig) {
      console.error("Missing EmailJS config", {
        serviceId,
        templateId,
        publicKey,
      });
      setStatusMessage("Email service is not configured yet.");
      return;
    }

    const form = formRef.current;

    if (!form) {
      setStatusMessage("Contact form is not ready. Please refresh and try again.");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatusMessage("Please fill out the required fields.");
      return;
    }

    const formData = new FormData(form);

    const templateParams = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    };

    setIsSending(true);

    try {
      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey,
      });

      setStatusMessage("Message sent successfully.");
      form.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      setStatusMessage(
        error?.text ||
          error?.message ||
          "Message failed to send. Please check your EmailJS settings."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form ref={formRef} className="contact-card" onSubmit={handleSubmit} noValidate>
      <h3>Contact Us</h3>

      <div className="form-row">
        <input name="first_name" placeholder="First name *" required />
        <input name="last_name" placeholder="Last name *" required />
      </div>

      <input name="email" type="email" placeholder="Email *" required />
      <input name="phone" type="tel" placeholder="Phone number" />

      <button
        className="submit-btn"
        type="button"
        disabled={isSending}
        onClick={handleSubmit}
      >
        {isSending ? "Sending..." : "Submit"}
      </button>

      <p className="contact-status-message">
        {statusMessage || "Fill out the form and click Submit."}
      </p>
    </form>
  );
}