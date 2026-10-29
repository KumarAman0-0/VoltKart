import { useRef } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    city: 'Bangalore',
    role: 'Parent of 8-year-old Aarav',
    edition: 'VoltKart Kids',
    editionColor: '#00d4aa',
    rating: 5,
    device: 'Pixel 6a · 128GB (Grade A+)',
    review: 'VoltKart Kids gave me total peace of mind. Aarav cannot download YouTube Shorts or addictive games without my approval, and the bedtime lock turns the screen off at 8:30 PM automatically without daily arguments.',
  },
  {
    id: 2,
    name: 'Rahul Mukherjee',
    city: 'Hyderabad',
    role: 'Principal Security Engineer',
    edition: 'VoltKart Adult',
    editionColor: '#2ed573',
    rating: 5,
    device: 'Pixel 7 · 128GB (Grade A+)',
    review: 'Radical data minimization at its best. Zero telemetry beacons sent to Google, sandboxed permissions, and clean hardware root verified with Titan M2. The device arrived looking brand new with 94% battery capacity.',
  },
  {
    id: 3,
    name: 'Tanvi Kulkarni',
    city: 'Pune',
    role: 'Class 11 Student',
    edition: 'VoltKart Teen',
    editionColor: '#6c63ff',
    rating: 5,
    device: 'Pixel 6 · 128GB (Grade A)',
    review: 'Study Focus mode during term exams blocks Instagram and gaming automatically. What I respect most is transparency—my parents and I agreed on the rules together, and I can see exactly what limits are active.',
  },
  {
    id: 4,
    name: 'Col. O.P. Sharma (Retd.)',
    city: 'Chandigarh',
    role: 'Grandparent',
    edition: 'VoltKart Senior',
    editionColor: '#ffa502',
    rating: 5,
    device: 'Pixel 7a · 128GB (Grade A+)',
    review: 'Large high-contrast tiles and one-tap video calling to my daughter. No pop-ups, no spam notifications, and the dedicated red SOS button with GPS sharing gives my family total reassurance.',
  },
  {
    id: 5,
    name: 'Dr. Vikram Patel',
    city: 'Ahmedabad',
    role: 'Cardiologist',
    edition: 'VoltKart Adult',
    editionColor: '#2ed573',
    rating: 5,
    device: 'Pixel 8 · 128GB (Grade A+)',
    review: 'The segregated Work and Personal profile keeps hospital records and patient chats strictly isolated. The 6-month warranty and NIST 800-88 storage wipe certificate gave me the confidence to buy refurbished.',
  },
];

const CustomerReviews = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="avrel-reviews-section">
      <div className="container">
        {/* Header with Title & Navigation Arrows */}
        <div className="avrel-reviews-header">
          <div>
            <span className="avrel-eyebrow">VERIFIED REVIEWS</span>
            <h2 className="avrel-section-title" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', margin: '0.2rem 0 0.5rem' }}>
              Our Happy Customers.
            </h2>
            <p className="avrel-section-desc" style={{ margin: 0 }}>
              Hear how parents, professionals, students, and seniors use their tailored VoltKart OS editions every day.
            </p>
          </div>

          <div className="avrel-reviews-nav-arrows">
            <button
              onClick={() => scroll('left')}
              className="avrel-review-nav-btn"
              title="Previous reviews"
              aria-label="Previous reviews"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="avrel-review-nav-btn"
              title="Next reviews"
              aria-label="Next reviews"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Testimonials Carousel Track */}
        <div ref={scrollRef} className="avrel-reviews-track">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="avrel-review-card">
              {/* Star Rating & Verified Badge */}
              <div className="avrel-review-top">
                <div className="avrel-star-rating">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#f0a12c" color="#f0a12c" />
                  ))}
                </div>
                <div className="avrel-verified-buyer-badge">
                  <CheckCircle2 size={13} color="#20bf6b" />
                  <span>Verified Buyer</span>
                </div>
              </div>

              {/* Customer Quote */}
              <p className="avrel-review-quote">
                "{rev.review}"
              </p>

              {/* Reviewer Details */}
              <div className="avrel-review-bottom">
                <div className="avrel-reviewer-info">
                  <h4 className="avrel-reviewer-name">{rev.name}</h4>
                  <span className="avrel-reviewer-sub">{rev.role} · {rev.city}</span>
                </div>

                <div className="avrel-review-tags">
                  <span
                    className="avrel-review-edition-pill"
                    style={{
                      background: `${rev.editionColor}18`,
                      borderColor: `${rev.editionColor}40`,
                      color: rev.editionColor,
                    }}
                  >
                    <span>{rev.edition}</span>
                  </span>
                  <span className="avrel-review-hardware-tag">
                    {rev.device}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
