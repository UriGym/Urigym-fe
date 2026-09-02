/** Minimal typings for the parts of the Kakao Maps SDK this app uses. */

declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level?: number });
    setCenter(latlng: LatLng): void;
    getLevel(): number;
    setLevel(level: number): void;
    setBounds(bounds: LatLngBounds): void;
    relayout(): void;
  }

  class Marker {
    constructor(options: { position: LatLng; map?: Map; title?: string; image?: MarkerImage });
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class CustomOverlay {
    constructor(options: {
      position: LatLng;
      content: string | HTMLElement;
      map?: Map;
      yAnchor?: number;
      xAnchor?: number;
      clickable?: boolean;
      zIndex?: number;
    });
    setMap(map: Map | null): void;
  }

  namespace event {
    function addListener(target: unknown, type: string, handler: (...args: unknown[]) => void): void;
  }

  function load(callback: () => void): void;
}

interface Window {
  kakao: {
    maps: typeof kakao.maps;
  };
}
