import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type PriceCents = bigint;
export type ListingId = bigint;
export interface Listing {
    id: ListingId;
    cardName: string;
    isSold: boolean;
    seller: Principal;
    image: ExternalBlob;
    cardSet: string;
    priceCents: PriceCents;
    sellerUsername: string;
    condition: Condition;
}
export type Username = string;
export interface UserProfile {
    username: Username;
}
export enum Condition {
    good = "good",
    mint = "mint",
    poor = "poor",
    nearMint = "nearMint",
    excellent = "excellent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(cardName: string, cardSet: string, condition: Condition, priceCents: PriceCents, image: ExternalBlob): Promise<ListingId>;
    deleteListing(listingId: ListingId): Promise<void>;
    getAllListings(): Promise<Array<Listing>>;
    getBrowseFeed(startIndex: bigint, count: bigint): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDisplayName(user: Principal): Promise<string | null>;
    getInterestedBuyers(listingId: ListingId): Promise<Array<[Principal, string]>>;
    getMyInterests(): Promise<Array<ListingId>>;
    getMyListings(): Promise<Array<Listing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isListingSwipedByCaller(listingId: ListingId): Promise<boolean>;
    isUserRegistered(): Promise<boolean>;
    markListingAsSold(listingId: ListingId): Promise<void>;
    registerUser(username: string): Promise<void>;
    resetUsers(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    swipeRightOnListing(listingId: ListingId): Promise<void>;
}
