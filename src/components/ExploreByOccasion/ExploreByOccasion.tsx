import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./ExploreByOccasion.css";

interface Occasion {
  id: string;
  title: string;
  tagline: string;
  image: string;
}

type CardSize = "tall" | "regular";

// All image URLs verified to load — real Unsplash CDN links.
// Order matters here: the grid uses dense auto-placement, so earlier
// items claim earlier slots. Anniversary is placed last on purpose so it
// naturally lands in the bottom row instead of getting pulled into an
// early gap near the top.
const occasions: (Occasion & { size: CardSize })[] = [
  {
    id: "wedding",
    title: "Wedding",
    tagline: "Rings that begin forever",
    image:
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?fm=jpg&q=85&w=1000&auto=format&fit=crop",
    // Narrow but tall — biggest by height, not width.
    size: "tall",
  },
  {
    id: "birthday",
    title: "Birthday",
    tagline: "Sparkle made for celebrating",
    image:
      "https://images.unsplash.com/photo-1654700194896-6318cdc3b184?fm=jpg&q=85&w=1000&auto=format&fit=crop",
    size: "regular",
  },
  {
    id: "festive",
    title: "Festive",
    tagline: "Tradition, dressed in gold",
    image:
      "https://images.unsplash.com/photo-1549315309-f0857a904065?fm=jpg&q=85&w=1000&auto=format&fit=crop",
    size: "regular",
  },
  {
    id: "engagement",
    title: "Engagement",
    tagline: "The moment before yes",
    image:
      "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?fm=jpg&q=85&w=1000&auto=format&fit=crop",
    // Also narrow-but-tall — the other "biggest" card, alongside Wedding.
    size: "tall",
  },
  {
    id: "casual",
    title: "Casual",
    tagline: "Everyday, effortlessly worn",
    image:
      "https://images.unsplash.com/photo-1641290748359-1d944fc8359a?fm=jpg&q=85&w=1000&auto=format&fit=crop",
    size: "regular",
  },
  {
    id: "anniversary",
    title: "Anniversary",
    tagline: "Marking the years that matter",
    image:
      "https://images.unsplash.com/photo-1680200256120-8ac04eb6f01d?fm=jpg&q=85&w=1000&auto=format&fit=crop",
    size: "regular",
  },
];

const sizeClass: Record<CardSize, string> = {
  tall: "occ2-card--tall",
  regular: "occ2-card--regular",
};

const OccasionCard = ({
  occasion,
  index,
}: {
  occasion: Occasion & { size: CardSize };
  index: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    // Decorative only — these used to be <a href="#id"> links to sections
    // that don't exist. No navigation, just a presented card.
    <motion.div
      ref={ref}
      className={`occ2-card ${sizeClass[occasion.size]} occ2-card--${occasion.id}`}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
        mass: 0.9,
        delay: index * 0.1,
      }}
    >
      <img
        src={occasion.image}
        alt={occasion.title}
        className="occ2-card__image"
        loading="lazy"
      />
      {/* Diagonal light-sweep — a gleam that crosses the image on hover,
          like light catching a polished surface. Purely CSS-driven (see
          .occ2-card__sheen), no JS needed. */}
      <div className="occ2-card__sheen" />
      <div className="occ2-card__scrim" />
      <div className="occ2-card__label">
        <span className="occ2-card__title">{occasion.title}</span>
        <span className="occ2-card__tagline">{occasion.tagline}</span>
        <span className="occ2-card__underline" />
      </div>
    </motion.div>
  );
};

const ExploreByOccasion = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="occ2-section">
      <div className="occ2-container">
        <div ref={headerRef} className="occ2-header">
          <motion.span
            className="occ2-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Curated Just For You
          </motion.span>
          <motion.h2
            className="occ2-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            Explore by Occasion
          </motion.h2>
          <motion.p
            className="occ2-subheading"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            From the first ring to the last dance — find the piece that fits your moment.
          </motion.p>
        </div>

        {/* .occ2-grid:has(:hover) dims non-hovered cards — see CSS. Group
            hover state lives entirely in CSS via :has(), no JS needed. */}
        <div className="occ2-grid">
          {occasions.map((occasion, i) => (
            <OccasionCard occasion={occasion} index={i} key={occasion.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreByOccasion;