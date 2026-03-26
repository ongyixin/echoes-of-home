export default function AccessibilityFooter() {
  return (
    <footer className="px-6 py-12 border-t border-[#f9d5d3]/60" role="contentinfo">
      <div className="max-w-2xl mx-auto">
        {/* Accessibility badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { icon: "♿", label: "WCAG 2.1 AA" },
            { icon: "🎙️", label: "Voice-first" },
            { icon: "🔤", label: "Screen reader friendly" },
            { icon: "🎨", label: "High contrast text" },
            { icon: "⌨️", label: "Keyboard navigable" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#f9d5d3] text-xs text-[#7a5c4e] font-medium shadow-sm"
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Brand tagline */}
        <div className="text-center mb-6">
          <p className="font-serif text-lg text-[#7a5c4e] italic">
            "A voice for the moments shared with you."
          </p>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#c4b4ae]">
          <span>© 2026 Echoes of Home</span>
          <span aria-hidden="true">·</span>
          <span>Built with Vapi &amp; Cartesia</span>
          <span aria-hidden="true">·</span>
          <span>Powered by GPT-4o Vision</span>
        </div>

        <p className="text-center text-xs text-[#d4b4ae] mt-4 max-w-md mx-auto">
          Echoes of Home is designed for visually impaired users and their families.
          All media is processed securely and never shared without your consent.
        </p>
      </div>
    </footer>
  );
}
