'use client'

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

type HeroSliderProps = {
  slides?: Slide[]
  autoPlayMs?: number
}

export default function HeroSlider({
  slides = [
    {
      src: "/benh-vien-mat-tmh-rhm-an-giang-1739439979-fmvo.jpg",
      alt: "Bệnh viện Mắt-TMH-RHM An Giang",
      width: 1920,
      height: 1080,
      priority: true,
    },
    {
      src: "/benh-vien-mat-tmh-rhm-an-giang-1750151330-nrphb.jpg", 
      alt: "Lịch làm việc",
      width: 1920,
      height: 1080,
    },
    {
      src: "/benh-vien-moi-1739926798-hruj0.png",
      alt: "Hình ảnh bệnh viện mới", 
      width: 1920,
      height: 1080,
    },
  ],
  autoPlayMs = 5000,
}: HeroSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)
  const count = slides.length

  // Scroll to a specific slide (snap)
  const scrollTo = (index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  // Mỗi khi active thay đổi, scroll đến slide tương ứng
  useEffect(() => {
    scrollTo(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Observe scroll position to update active dot (chỉ khi user kéo tay)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let isUserScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const onScroll = () => {
      if (!isUserScrolling) return;
      const { scrollLeft, clientWidth } = el;
      const idx = Math.round(scrollLeft / clientWidth);
      setActive(idx);
    };

    const onPointerDown = () => {
      isUserScrolling = true;
    };
    const onPointerUp = () => {
      scrollTimeout = setTimeout(() => { isUserScrolling = false; }, 300);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Auto play with pause on hover/focus (fix: scroll and setActive đồng bộ)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let paused = false
    const onEnter = () => (paused = true)
    const onLeave = () => (paused = false)

    el.addEventListener("mouseenter", onEnter)
    el.addEventListener("mouseleave", onLeave)
    el.addEventListener("focusin", onEnter)
    el.addEventListener("focusout", onLeave)

    const id = setInterval(() => {
      if (paused) return;
      setActive((prev) => (prev + 1) % count);
    }, autoPlayMs);

    return () => {
      clearInterval(id)
      el.removeEventListener("mouseenter", onEnter)
      el.removeEventListener("mouseleave", onLeave)
      el.removeEventListener("focusin", onEnter)
      el.removeEventListener("focusout", onLeave)
    }
  }, [autoPlayMs, count, active])

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        const next = (active + 1) % count
        scrollTo(next)
        setActive(next)
      } else if (e.key === "ArrowLeft") {
        const prev = (active - 1 + count) % count
        scrollTo(prev)
        setActive(prev)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, count])

  const sizes = useMemo(
    () => "(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px",
    []
  )

  return (
    <section className="relative w-full max-w-[2000px] mx-auto">
      {/* Slider viewport */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl shadow-xl border border-gray-200"
        aria-roledescription="carousel"
        aria-label="Slider giới thiệu bệnh viện"
      >
        <div 
          className="flex w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="relative w-full flex-shrink-0"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} / ${count}`}
            >
              <Image
                src={s.src || "/placeholder.svg"}
                alt={s.alt}
                width={s.width}
                height={s.height}
                priority={s.priority}
                sizes={sizes}
                className="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] w-full object-cover rounded-2xl transition-all duration-500"
                style={{ 
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                  opacity: i === active ? 1 : 0.8,
                  transform: `scale(${i === active ? 1 : 0.95})`
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 md:p-6">
                <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold">{s.alt}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 md:px-6">
        <Button
          size="icon"
          variant="secondary"
          className="pointer-events-auto rounded-full shadow-lg md:h-14 md:w-14 h-10 w-10 bg-white/90 hover:bg-primary/90 border border-gray-300 transition-all duration-300 transform hover:scale-105"
          onClick={() => {
            const prev = (active - 1 + count) % count;
            setActive(prev);
          }}
          aria-label="Slide trước"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-primary hover:text-white transition-colors" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="pointer-events-auto rounded-full shadow-lg md:h-14 md:w-14 h-10 w-10 bg-white/90 hover:bg-primary/90 border border-gray-300 transition-all duration-300 transform hover:scale-105"
          onClick={() => {
            const next = (active + 1) % count;
            setActive(next);
          }}
          aria-label="Slide tiếp theo"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-primary hover:text-white transition-colors" />
        </Button>
      </div>

      {/* Pagination dots */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-lg rounded-full px-4 py-2.5 shadow-lg border border-gray-200 transform translate-y-1/2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Chuyển tới slide ${i + 1}`}
            className={`h-3 w-3 rounded-full transition-all duration-300 border-2 hover:scale-125 ${
              i === active 
                ? "bg-primary border-primary scale-125" 
                : "bg-gray-200 border-gray-300 hover:bg-primary/50 hover:border-primary/50"
            }`}
            onClick={() => setActive(i)}
          >
            <span className="sr-only">{`Dot ${i + 1}`}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
