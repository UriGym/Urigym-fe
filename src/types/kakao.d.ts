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

  namespace services {
    enum Status {
      OK = "OK",
      ZERO_RESULT = "ZERO_RESULT",
      ERROR = "ERROR",
    }

    enum SortBy {
      DISTANCE = "distance",
      ACCURACY = "accuracy",
    }

    interface AddressSearchResult {
      address_name: string;
      y: string;
      x: string;
    }

    class Geocoder {
      addressSearch(address: string, callback: (result: AddressSearchResult[], status: Status) => void): void;
    }

    interface PlacesSearchResult {
      id: string;
      place_name: string;
      category_name: string;
      category_group_code: string;
      category_group_name: string;
      phone: string;
      address_name: string;
      road_address_name: string;
      x: string;
      y: string;
      place_url: string;
      distance: string;
    }

    interface PlacesSearchOptions {
      location?: LatLng;
      radius?: number;
      sort?: SortBy;
    }

    class Places {
      keywordSearch(
        keyword: string,
        callback: (result: PlacesSearchResult[], status: Status) => void,
        options?: PlacesSearchOptions
      ): void;
    }
  }

  function load(callback: () => void): void;
}

interface Window {
  kakao: {
    maps: typeof kakao.maps;
  };
}
