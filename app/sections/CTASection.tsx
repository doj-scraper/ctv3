"use client";

import { useEffect, useRef, useState } from "react";

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitStatus("success");
    setEmail("");

    // Reset status after 3 seconds
    setTimeout(() => setSubmitStatus("idle"), 3000);
  };

  return (
    <section ref={sectionRef} id="quote" className="section-pinned flex items-center" style={{ zIndex: 120 }}>
      <div className="w-full px-6 lg:px-12">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h2
            className={`heading-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-ct-text mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            STOCK YOUR
            <br />
            <span className="text-ct-accent">BENCH TODAY</span>
          </h2>

          <p
            className={`text-ct-text-secondary text-base lg:text-lg max-w-md mb-10 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Get access to wholesale pricing, bulk quotes, and same-day dispatch.
          </p>

          <form
            onSubmit={handleSubmit}
            className={`flex flex-col sm:flex-row gap-4 max-w-md w-full mb-6 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="input-dark flex-1"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Get Access"}
            </button>
          </form>

          {submitStatus === "success" && (
            <p className="text-ct-accent mb-4">Thanks! We&apos;ll be in touch soon.</p>
          )}

          <p
            className={`text-micro text-ct-text-secondary transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            No minimum first order • Unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  );
}
