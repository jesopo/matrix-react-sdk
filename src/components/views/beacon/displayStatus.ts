/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { BeaconLocationState } from "matrix-js-sdk/src/content-helpers";

import { LocationShareError } from "../../../utils/location";

export enum BeaconDisplayStatus {
    Loading = 'Loading',
    Error = 'Error',
    Stopped = 'Stopped',
    Active = 'Active',
    UseMapFallback = 'UseMapFallback',
}
export const getBeaconDisplayStatus = (
    isLive: boolean,
    latestLocationState?: BeaconLocationState,
    error?: Error,
    waitingToStart?: boolean,
): BeaconDisplayStatus => {
    if (
        error?.message === LocationShareError.MapStyleUrlNotConfigured ||
        error?.message === LocationShareError.MapStyleUrlNotReachable
    ) {
        return BeaconDisplayStatus.UseMapFallback;
    }
    if (error) {
        return BeaconDisplayStatus.Error;
    }
    if (waitingToStart) {
        return BeaconDisplayStatus.Loading;
    }
    if (!isLive) {
        return BeaconDisplayStatus.Stopped;
    }
    if (!latestLocationState) {
        return BeaconDisplayStatus.Loading;
    }
    if (latestLocationState) {
        return BeaconDisplayStatus.Active;
    }
};
