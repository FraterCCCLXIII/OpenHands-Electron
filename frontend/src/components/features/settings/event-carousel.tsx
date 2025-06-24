import React from "react";
import AllHands1 from "#/assets/branding/allhands-1.svg?react";
import AllHands2 from "#/assets/branding/allhands-2.svg?react";
import AllHands3 from "#/assets/branding/allhands-3.svg?react";
import AllHands4 from "#/assets/branding/allhands-4.svg?react";

interface CarouselSlide {
  imageComponent: React.ComponentType<any>;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}

const slides: CarouselSlide[] = [
  {
    imageComponent: AllHands1,
    title: "All Hands Hackathon 2026",
    description: "Join our global hackathon and build the future of AI-powered development. Prizes, workshops, and more!",
    buttonText: "Register",
    buttonHref: "https://all-hands.dev/hackathon",
  },
  {
    imageComponent: AllHands2,
    title: "How OpenHands Works",
    description: "Read our latest article on how OpenHands is democratizing AI for all developers.",
    buttonText: "Read Article",
    buttonHref: "https://blog.all-hands.dev/openhands-works",
  },
  {
    imageComponent: AllHands3,
    title: "Community Slack",
    description: "Join our Slack to connect with thousands of developers, get help, and share your projects.",
    buttonText: "Join Slack",
    buttonHref: "https://join.slack.com/t/openhands-ai/shared_invite/zt-34zm4j0gj-Qz5kRHoca8DFCbqXPS~f_A",
  },
  {
    imageComponent: AllHands4,
    title: "OpenHands Platform",
    description: "Experience the power of AI-driven development with our comprehensive platform.",
    buttonText: "Learn More",
    buttonHref: "https://docs.all-hands.dev",
  },
];

export function EventCarousel() {
  const [current, setCurrent] = React.useState(0);
  const goTo = (idx: number) => setCurrent(idx);

  const getColorWrapper = (Component: React.ComponentType<any>) => {
    if (Component === AllHands1) {
      return (
        <div className="[&_.st0]:fill-[#231f20] [&_.st1]:fill-[#f3e9e4] [&_.st2]:fill-[#fcde6c] [&_.st3]:fill-[#ea6e6c] [&_.st4]:fill-[#fdd749]">
          <Component className="w-full h-full" />
        </div>
      );
    } else if (Component === AllHands2) {
      return (
        <div className="[&_.st0]:fill-[#cf7b6b] [&_.st1]:fill-[#231f20] [&_.st2]:fill-[#f9af8b] [&_.st3]:fill-[#c28e66] [&_.st4]:fill-[#fdd749]">
          <Component className="w-full h-full" />
        </div>
      );
    } else if (Component === AllHands3) {
      return (
        <div className="[&_.st0]:fill-[#ef4650] [&_.st1]:fill-[#afb4b6] [&_.st2]:fill-[#fcde6c] [&_.st3]:fill-[#dfe1e1] [&_.st4]:fill-[#fdd749] [&_.st5]:fill-[#18171c]">
          <Component className="w-full h-full" />
        </div>
      );
    } else if (Component === AllHands4) {
      return (
        <div className="[&_.st0]:fill-[#e7e7e5] [&_.st1]:fill-[#231f20] [&_.st2]:fill-[#afb4b6] [&_.st3]:fill-[#fff] [&_.st4]:fill-[#fdd749] [&_.st5]:fill-[#c3c5c4]">
          <Component className="w-full h-full" />
        </div>
      );
    }
    return <Component className="w-full h-full" />;
  };

  return (
    <div
      className="w-full mx-auto bg-[#3887f6] rounded-2xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden"
      style={{ height: "508px" }}
    >
      <div className="flex flex-col items-center flex-1 justify-start max-w-sm pt-4 transition-all duration-500 ease-in-out">
        <div className="w-32 h-32 mb-6 transition-all duration-500 ease-in-out">
          {getColorWrapper(slides[current].imageComponent)}
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3 leading-tight text-center transition-all duration-500 ease-in-out">
          {slides[current].title}
        </h3>
        <p className="text-sm text-black/80 mb-6 text-center leading-relaxed transition-all duration-500 ease-in-out">
          {slides[current].description}
        </p>
        {slides[current].buttonText && slides[current].buttonHref && (
          <a
            href={slides[current].buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-black text-white font-semibold text-base shadow hover:bg-neutral-800 transition-all duration-500 ease-in-out"
          >
            {slides[current].buttonText}
          </a>
        )}
      </div>
      {/* Carousel dots sticky to bottom */}
      <div className="flex gap-2 mt-auto pt-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out ${
              idx === current
                ? "bg-white scale-110"
                : "bg-gray-400/60 hover:bg-gray-400/80 hover:scale-105"
            }`}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
