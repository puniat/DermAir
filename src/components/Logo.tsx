export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { container: "w-12 h-12", svg: "w-8 h-8", rounded: "rounded-xl" },
    md: { container: "w-32 h-32", svg: "w-20 h-20", rounded: "rounded-3xl" },
    lg: { container: "w-40 h-40", svg: "w-24 h-24", rounded: "rounded-3xl" }
  };

  const { container, svg, rounded } = dimensions[size];

  return (
    <div className="relative flex-shrink-0">
      {/* Animated background circles */}
      <div className={`absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 ${rounded} animate-pulse opacity-20 blur-xl`}></div>
      
      {/* Main logo container */}
      <div className={`relative ${container} bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 ${rounded} shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
        {/* Logo SVG - Skin care themed */}
        <svg className={svg} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield shape representing protection */}
          <path d="M50 10 L80 25 L80 55 Q80 75, 50 90 Q20 75, 20 55 L20 25 Z" 
                fill="white" opacity="0.95"/>
          
          {/* Heart in the center representing health */}
          <path d="M50 42 Q50 35, 45 32 Q40 30, 37 33 Q35 35, 35 38 Q35 45, 50 55 Q65 45, 65 38 Q65 35, 63 33 Q60 30, 55 32 Q50 35, 50 42 Z" 
                fill="#14B8A6" className="animate-pulse"/>
          
          {/* Sparkles representing AI/care */}
          <circle cx="30" cy="45" r="2" fill="#14B8A6" opacity="0.7" className="animate-pulse"/>
          <circle cx="70" cy="45" r="2" fill="#14B8A6" opacity="0.7" className="animate-pulse"/>
          <circle cx="50" cy="65" r="2" fill="#14B8A6" opacity="0.7" className="animate-pulse"/>
        </svg>
      </div>
    </div>
  );
}
