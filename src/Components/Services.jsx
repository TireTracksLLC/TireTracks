export default function Services() {
  const services = [
    {
      icon: "📦",
      title: "Inventory Tracking",
      text: "TireTracks lets you keep all of your tire inventory in one place. You can store tire size, brand, model, condition, quantity, and price so your stock stays organized and easy to manage.",
    },
    {
      icon: "🔍",
      title: "Fast Search",
      text: "The system makes it easy to search inventory by tire size and quickly find what is available. This helps shops save time and avoid manually digging through inventory.",
    },
    {
      icon: "➕",
      title: "Quantity Management",
      text: "Instead of creating duplicate entries, TireTracks updates the quantity of existing tires. This keeps the inventory cleaner and makes stock counts more accurate.",
    },
    {
      icon: "🚗",
      title: "Fitment Lookup",
      text: "TireTracks includes vehicle fitment lookup so users can match vehicles with the correct tire sizes. This helps connect customer needs with the right products faster.",
    },
    {
      icon: "📈",
      title: "Business Efficiency",
      text: "By reducing manual inventory work, TireTracks helps businesses work more efficiently. Employees can update stock faster and spend more time helping customers.",
    },
    {
      icon: "🤝",
      title: "Better Organization",
      text: "TireTracks gives your business a more reliable way to manage stock, reduce confusion, and keep important inventory information consistent across the system.",
    },
  ];

  return (
    <section id="Services" className="Services-Section">
      <div className="Services-Container">
        <h1 className="Services-Main-Title">What TireTracks Does</h1>
        <p className="Services-Intro">
          TireTracks is built to help tire shops and businesses organize stock,
          search inventory faster, and manage products more efficiently.
        </p>

        <div className="Services-Grid">
          {services.map((service, index) => (
            <div className="Services-Card" key={index}>
              <div className="Services-Icon">{service.icon}</div>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}