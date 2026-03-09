import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Condition, ExternalBlob, Listing, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useIsRegistered() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isUserRegistered"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isUserRegistered();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBrowseFeed(startIndex = 0) {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["browseFeed", startIndex],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBrowseFeed(BigInt(startIndex), 10n);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["myListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["allListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyInterests() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["myInterests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyInterests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInterestedBuyers(listingId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[import("@icp-sdk/core/principal").Principal, string]>>(
    {
      queryKey: ["interestedBuyers", listingId.toString()],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getInterestedBuyers(listingId);
      },
      enabled: !!actor && !isFetching,
    },
  );
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.registerUser(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isUserRegistered"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      cardName: string;
      cardSet: string;
      condition: Condition;
      priceCents: bigint;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createListing(
        params.cardName,
        params.cardSet,
        params.condition,
        params.priceCents,
        params.image,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["browseFeed"] });
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["browseFeed"] });
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
    },
  });
}

export function useMarkAsSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.markListingAsSold(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}

export function useSwipeRight() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.swipeRightOnListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInterests"] });
    },
  });
}
