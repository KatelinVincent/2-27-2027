import React from "react"

const maps = query => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

const stays = [
  {
    name: "Embassy Suites San Marcos",
    area: "San Marcos · ~10 min",
    body: "Full-service hotel with two-room suites, a spa, and a pool. The easy, close-by pick.",
    href: maps("Embassy Suites by Hilton San Marcos Hotel Conference Center 1001 E McCarty Ln San Marcos TX"),
  },
  {
    name: "Fairfield Inn & Suites San Marcos",
    area: "San Marcos · ~10 min",
    body: "Clean, reliable, and budget-friendly, with breakfast included and quick I-35 access.",
    href: maps("Fairfield Inn & Suites Austin San Marcos TX"),
  },
  {
    name: "Gruene Mansion Inn",
    area: "Gruene · ~25 min",
    body: "A historic 1870s inn above the Guadalupe River, a short walk from Gruene Hall and the Gristmill.",
    href: maps("Gruene Mansion Inn New Braunfels TX"),
  },
  {
    name: "Hotel Faust",
    area: "New Braunfels · ~25 min",
    body: "Charming boutique hotel from 1929 in downtown New Braunfels, with a brewery downstairs.",
    href: maps("Hotel Faust New Braunfels TX"),
  },
  {
    name: "Vacation Rentals",
    area: "San Marcos & Wimberley",
    body: "Traveling with a group? Hill Country houses and cabins are a great way to stay together.",
    links: [
      { label: "Airbnb", href: "https://www.airbnb.com/s/San-Marcos--TX/homes" },
      { label: "VRBO",   href: "https://www.vrbo.com/search?destination=San%20Marcos%2C%20Texas" },
    ],
  },
]

const eats = [
  {
    name: "Palmer's Restaurant Bar & Courtyard",
    area: "San Marcos",
    body: "A San Marcos staple. Texas comfort food in a big shady courtyard.",
    href: maps("Palmer's Restaurant Bar & Courtyard 218 Moore St San Marcos TX"),
  },
  {
    name: "Gil's Broiler & Manske Roll Bakery",
    area: "San Marcos",
    body: "Great burgers, and you can't leave without a Manske roll, the giant cinnamon roll San Marcos is famous for.",
    href: maps("Gil's Broiler 328 N LBJ Dr San Marcos TX"),
    image: { src: "/manske-rolls.jpg", alt: "Manske rolls from Gil's Broiler" },
  },
  {
    name: "Don Japanese Kitchen",
    area: "San Marcos",
    body: "Comforting Japanese rice bowls, katsu, and curry. Quick, affordable, and so good.",
    href: maps("Don Japanese Kitchen 829 N LBJ Dr San Marcos TX"),
  },
  {
    name: "Kerbey Lane Cafe",
    area: "San Marcos",
    body: "The Austin classic, right on the San Marcos River. Pancakes and queso any time of day.",
    href: maps("Kerbey Lane Cafe 221 Sessom Dr San Marcos TX"),
  },
  {
    name: "Taproom Pub & Grub",
    area: "San Marcos",
    body: "An old-school downtown pub since 1994. Cold beer, a long tap list, and excellent burgers.",
    href: maps("Taproom Pub & Grub 129 E Hopkins St San Marcos TX"),
  },
  {
    name: "The Salt Lick BBQ",
    area: "Driftwood · ~25 min",
    body: "Legendary Hill Country barbecue cooked over an open pit. Bring cash and your own drinks.",
    href: maps("The Salt Lick BBQ Driftwood TX"),
  },
  {
    name: "Gristmill River Restaurant",
    area: "Gruene · ~25 min",
    body: "Burgers and chicken-fried steak on terraces above the river, right next to Gruene Hall.",
    href: maps("Gristmill River Restaurant & Bar Gruene New Braunfels TX"),
  },
  {
    name: "The Leaning Pear",
    area: "Wimberley · ~25 min",
    body: "Fresh, seasonal food in a pretty creekside setting. Worth the drive.",
    href: maps("The Leaning Pear Wimberley TX"),
  },
]

const cardStyle = {
  background: "rgba(255, 253, 248, 0.85)",
  border: "0.5px solid var(--sage-light)",
  borderRadius: 8,
  padding: "1.5rem",
  textAlign: "left",
}

const linkStyle = {
  display: "inline-block",
  marginTop: "0.75rem",
  marginRight: "1rem",
  fontSize: "0.65rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--sage)",
  textDecoration: "none",
  borderBottom: "0.5px solid var(--sage-light)",
}

function PlaceCard({ name, area, body, href, links, image }) {
  return (
    <div style={cardStyle}>
      {image && (
        // Served from static/; hides itself if the photo hasn't been added yet
        <img
          src={image.src}
          alt={image.alt}
          onError={e => { e.currentTarget.style.display = "none" }}
          style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6, marginBottom: "1rem", display: "block" }}
        />
      )}
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.2rem", fontWeight: 400,
        color: "var(--text)", marginBottom: "0.2rem",
      }}>
        {name}
      </h3>
      <span style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--dusty)" }}>
        {area}
      </span>
      <p style={{ fontSize: "0.8rem", color: "var(--dusty)", lineHeight: 1.6, marginTop: "0.6rem" }}>
        {body}
      </p>
      {(links || [{ label: "View on map", href }]).map(link => (
        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {link.label} →
        </a>
      ))}
    </div>
  )
}

function PlaceGrid({ heading, places }) {
  return (
    <>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.5rem", fontWeight: 400, fontStyle: "italic",
        color: "var(--sage)", marginTop: "3rem", marginBottom: "1.25rem",
      }}>
        {heading}
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
      }}>
        {places.map(place => <PlaceCard key={place.name} {...place} />)}
      </div>
    </>
  )
}

export default function Travel() {
  return (
    <section id="travel" style={{ padding: "5rem 2rem", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
      <span className="section-label">Coming from out of town?</span>
      <h2 className="section-title">Stay & <em>Eat</em></h2>
      <div className="divider-ornament">— N —</div>

      <p style={{ fontSize: "0.85rem", color: "var(--dusty)", lineHeight: 1.8, marginTop: "1.5rem" }}>
        The wedding is at Windemere Farm in San Marcos, Texas. Here are some of our favorite places nearby to rest up and eat well.
      </p>

      <PlaceGrid heading="Places to Stay" places={stays} />
      <PlaceGrid heading="Good Eats" places={eats} />
    </section>
  )
}
