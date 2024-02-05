function HeroSectionMouseScroll() {
  return (
    <div className="absolute bottom-10 right-10 z-[3000] mx-auto w-6 opacity-80">
      <div className="mouse relative h-10 w-6 rounded-2xl border-2 border-white">
        <div className="animate-mouse-wheel relative mx-auto my-1 block h-1 w-1 rounded-full bg-white"></div>
      </div>
    </div>
  );
}

export default HeroSectionMouseScroll;
