import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 origin-left z-50">
      <div 
        className="h-full bg-gradient-to-r from-[#8B9D83] via-[#D4A89F] to-[#8B9D83] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
