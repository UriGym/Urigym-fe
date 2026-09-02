import { useCallback, useEffect, useState } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Seoul City Hall — used until the browser grants a real position. */
export const DEFAULT_CENTER: Coordinates = { lat: 37.5665, lng: 126.978 };

interface GeolocationState {
  position: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: true,
  });

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ position: null, error: '이 브라우저는 위치 정보를 지원하지 않습니다.', isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setState({
          position: { lat: coords.latitude, lng: coords.longitude },
          error: null,
          isLoading: false,
        }),
      (error) =>
        setState({
          position: null,
          error:
            error.code === error.PERMISSION_DENIED
              ? '위치 권한이 거부되어 기본 위치를 표시합니다.'
              : '현재 위치를 가져오지 못했습니다.',
          isLoading: false,
        }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return {
    ...state,
    /** Real position when available, Seoul City Hall otherwise. */
    center: state.position ?? DEFAULT_CENTER,
    refresh: locate,
  };
}

/** Great-circle distance in kilometres. */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
