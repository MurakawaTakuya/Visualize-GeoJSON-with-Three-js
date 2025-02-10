"use client";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { data } from "@/const/const";
import { FocusContext } from "@/context/FocusContext";
import { useEffect, useState } from "react";
import styles from "./PlaceSelection.module.scss";

interface PlaceSelectionProps {
  children: React.ReactNode;
}

export default function PlaceSelection({ children }: PlaceSelectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // focusName: 現在表示しているCarouselItemのkey
  const dataKeys = Object.keys(data);
  const focusName = current > 0 ? dataKeys[current - 1] : undefined;

  return (
    <>
      <div className={styles.selectionWrap}>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
          }}
          className="w-full max-w-sm"
        >
          <CarouselContent>
            {Object.keys(data).map((key, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card
                    className={styles.selectionCard}
                    style={{
                      background: `linear-gradient(rgba(30, 30, 30, 0.2), rgba(30, 30, 30, 0.2)), url(/PlaceImages/${key}.webp)`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  >
                    <a href={data[key].rootPath}>
                      <p className="text-2xl font-semibold">{data[key].name}</p>
                      <p>3Dで見に行く</p>
                    </a>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className={styles.selectionArrow} />
          <CarouselNext className={styles.selectionArrow} />
        </Carousel>
        {current !== 0 && count !== 0 && (
          <p style={{ paddingTop: "3px", textAlign: "center" }}>
            {current} / {count}
          </p>
        )}
      </div>
      <FocusContext.Provider value={focusName}>
        {children}
      </FocusContext.Provider>
    </>
  );
}
