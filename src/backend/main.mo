import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  //////////////////
  // Types
  //////////////////

  type Username = Text;
  type ListingId = Nat;
  type PriceCents = Nat;
  type Timestamp = Int;

  module Timestamp {
    public func compare(a : Timestamp, b : Timestamp) : Order.Order {
      Int.compare(a, b);
    };
  };

  public type Condition = {
    #mint;
    #nearMint;
    #excellent;
    #good;
    #poor;
  };

  public type Listing = {
    id : ListingId;
    seller : Principal;
    sellerUsername : Text;
    cardName : Text;
    cardSet : Text;
    condition : Condition;
    priceCents : PriceCents;
    image : Storage.ExternalBlob;
    isSold : Bool;
  };

  module Listing {
    public func compareByPrice(listing1 : Listing, listing2 : Listing) : Order.Order {
      Nat.compare(listing1.priceCents, listing2.priceCents);
    };
  };

  public type UserProfile = {
    username : Username;
  };

  public type SwipedListing = {
    buyer : Principal;
    listing : ListingId;
    timestamp : Timestamp;
  };

  public type Interest = {
    buyer : Principal;
    buyerUsername : Username;
    listing : ListingId;
    timestamp : Timestamp;
  };

  //////////////////
  // State
  //////////////////

  let listings = Map.empty<ListingId, Listing>();
  let users = Map.empty<Principal, UserProfile>();
  let swipedListings = Map.empty<ListingId, SwipedListing>();
  let interests = Map.empty<ListingId, Interest>();

  var nextListingId = 0;

  //////////////////
  // Authorization
  //////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //////////////////
  // User Profile Management (Required by Frontend)
  //////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  //////////////////
  // User Handling
  //////////////////

  public query ({ caller }) func getDisplayName(user : Principal) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view display names");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?profile) { ?profile.username };
    };
  };

  // Checks if user exists, otherwise must call registerUser
  public query ({ caller }) func isUserRegistered() : async Bool {
    users.containsKey(caller);
  };

  // Initial registration setting username - allows guests to register
  public shared ({ caller }) func registerUser(username : Text) : async () {
    if (users.containsKey(caller)) {
      Runtime.trap("User already registered. You cannot change your username.");
    };
    let newUser = {
      username;
    };
    users.add(caller, newUser);
  };

  // Debug admin endpoint to reset all users. Not for production system
  public shared ({ caller }) func resetUsers() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    users.clear();
  };

  //////////////////
  // Listings
  //////////////////

  public query ({ caller }) func getAllListings() : async [Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view listings");
    };
    let listingsIter = listings.values();
    listingsIter.toArray();
  };

  public query ({ caller }) func getMyListings() : async [Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view listings");
    };
    let results = listings.filter(
      func(_, listing) { listing.seller == caller }
    );
    results.values().toArray();
  };

  public shared ({ caller }) func createListing(
    cardName : Text,
    cardSet : Text,
    condition : Condition,
    priceCents : PriceCents,
    image : Storage.ExternalBlob,
  ) : async ListingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("Must register before listing cards") };
      case (?userProfile) {
        let listing = {
          id = nextListingId;
          seller = caller;
          sellerUsername = userProfile.username;
          cardName;
          cardSet;
          condition;
          priceCents;
          image;
          isSold = false;
        };
        listings.add(nextListingId, listing);
        nextListingId += 1;
        listing.id;
      };
    };
  };

  public shared ({ caller }) func markListingAsSold(listingId : ListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller != caller) { Runtime.trap("You can only update your own listings") };
        listings.add(listingId, { listing with isSold = true });
      };
    };
  };

  public shared ({ caller }) func deleteListing(listingId : ListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller != caller) { Runtime.trap("You can only delete your own listings") };
        listings.remove(listingId);
      };
    };
  };

  //////////////////
  // Interest
  //////////////////

  public shared ({ caller }) func swipeRightOnListing(listingId : ListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can swipe on listings");
    };
    // Check listing exists and isn't sold
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller == caller) { Runtime.trap("Can't swipe own listing") };
        if (listing.isSold) { Runtime.trap("Listing already sold") };

        // Check user exists
        switch (users.get(caller)) {
          case (null) { Runtime.trap("You must register before swiping right") };
          case (?userProfile) {
            // Only add if not already interested and not already swiped
            if (not interests.containsKey(listingId)) {
              let newInterest = {
                buyer = caller;
                buyerUsername = userProfile.username;
                listing = listingId;
                timestamp = Time.now();
              };
              interests.add(listingId, newInterest);
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getInterestedBuyers(listingId : ListingId) : async [(Principal, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interested buyers");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller != caller) { Runtime.trap("Only seller can see interested buyers") };
        let filteredInterests = interests.filter(
          func(_, interest) { interest.listing == listingId }
        );
        filteredInterests.values().toArray().map(
          func(interest) { (interest.buyer, interest.buyerUsername) }
        );
      };
    };
  };

  public query ({ caller }) func getMyInterests() : async [ListingId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interests");
    };
    let filteredInterests = interests.filter(
      func(_, interest) { interest.buyer == caller }
    );
    filteredInterests.values().toArray().map(
      func(interest) { interest.listing }
    );
  };

  public query ({ caller }) func isListingSwipedByCaller(listingId : ListingId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check swipe status");
    };
    switch (swipedListings.get(listingId)) {
      case (null) { false };
      case (?swiped) { swiped.buyer == caller };
    };
  };

  public query ({ caller }) func getBrowseFeed(startIndex : Nat, count : Nat) : async [Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can browse listings");
    };
    let allListings = listings.values().toArray().sort(Listing.compareByPrice);

    // Filter out listings user has interacted with (swiped, interested) and own listings
    let filteredListings = allListings.filter(
      func(listing) {
        listing.seller != caller and
        (not interests.containsKey(listing.id)) and
        (not swipedListings.containsKey(listing.id)) and
        not listing.isSold
      }
    );

    // Handle pagination manually by skipping startIndex and taking count elements
    if (startIndex >= filteredListings.size()) { return [] };

    let endIndex = if (startIndex + count > filteredListings.size()) {
      filteredListings.size();
    } else {
      startIndex + count;
    };

    filteredListings.sliceToArray(startIndex, endIndex);
  };
};
