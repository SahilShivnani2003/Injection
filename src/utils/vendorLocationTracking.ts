import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
      ensureLocationReady,
      startTrackingVendorLocation,
      stopTrackingVendorLocation,
      LocationPermissionDeniedError,
      LocationServicesDisabledError,
} from './deviceLocation';
import { Coordinates, coordinatesToAddress } from './geocoding';
import { vendorAPI } from '@/service/apis/vendorService'; 
import { userApi } from '@/service/apis/userService';
import { useAuthStore } from "@/store/useAuthStore";

export type VendorLocationFlowState =
      | 'checking'
      | 'permission_denied'
      | 'services_disabled'
      | 'tracking'
      | 'error';

export function useVendorLocationTracking() {
      const [state, setState] = useState<VendorLocationFlowState>('checking');
      const stateRef = useRef(state);
      const watchIdRef = useRef<number | null>(null);
      const { user } = useAuthStore();
      const role = user?.role;

      useEffect(() => {
            stateRef.current = state;
      }, [state]);

      const startFlow = useCallback(async () => {
            setState('checking');
            try {
                  const coords = await ensureLocationReady();
                  setState('tracking');

                  const sendLocationUpdate = async (nextCoords: Coordinates) => {
                        try {
                              const geoCodded = await coordinatesToAddress(nextCoords);
                              const payload = {
                                    latitude: nextCoords.latitude,
                                    longitude: nextCoords.longitude,
                                    currentLocation: `${nextCoords.latitude},${nextCoords.longitude}`,
                                    address: geoCodded?.addressLine,
                                    city: geoCodded?.city,
                                    state: geoCodded?.state,
                                    pincode: geoCodded?.pincode,
                              };
                              //condition wise api calling for vendor and user
                              if (role === 'vendor') {
                                    const response = await vendorAPI.updateVendorCoords(payload);
                                    console.log('vendor location updated', response.data);
                              } else {
                                    await userApi.updateUserCoords(payload);
                              }
                        } catch {
                              // swallow — next watchPosition tick retries automatically
                        }
                  };

                  // send the very first fix immediately
                  sendLocationUpdate(coords);

                  watchIdRef.current = startTrackingVendorLocation(
                        nextCoords => sendLocationUpdate(nextCoords),
                        // swallow network errors here — the next watchPosition tick
                        // will retry the update automatically.
                        () => setState('error'),
                  );
            } catch (err) {
                  if (err instanceof LocationPermissionDeniedError) {
                        setState('permission_denied');
                  } else if (err instanceof LocationServicesDisabledError) {
                        setState('services_disabled');
                  } else {
                        setState('error');
                  }
            }
      }, []);

      useEffect(() => {
            startFlow();

            const subscription = AppState.addEventListener(
                  'change',
                  (next: AppStateStatus) => {
                        const blockedByPermission = stateRef.current === 'permission_denied';
                        const blockedByServices = stateRef.current === 'services_disabled';
                        if (next === 'active' && (blockedByPermission || blockedByServices)) {
                              startFlow();
                        }
                  },
            );

            return () => {
                  subscription.remove();
                  if (watchIdRef.current !== null) {
                        stopTrackingVendorLocation(watchIdRef.current);
                  }
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return { state, retry: startFlow };
}