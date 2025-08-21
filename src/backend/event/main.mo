import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

import TypCommon "../common/type";
import TypEvent "type";

import SvcEvent "service";

persistent actor {
    private var nextEventId   : TypCommon.EventId = 1;
    private var nextSeatId   : TypCommon.SeatId = 1;

    private var stableEvents         : [SvcEvent.StableEvents]         = [];
    private var stableSeats          : [SvcEvent.StableSeats]         = [];
    private var stableSeatEvents     : [SvcEvent.StableSeatEvents]         = [];
    private var stableOwnerEvents    : [SvcEvent.StableOwnerEvents]    = [];

    transient let event = SvcEvent.Event(
        nextEventId,
        nextSeatId,
        stableEvents,
        stableSeats,
        stableSeatEvents,
        stableOwnerEvents
    );

    // MARK: Get all events
    public query func getEvents(id: Nat) 
    : async Result.Result<[TypEvent.EventResponse], ()> {
        var result : [TypEvent.EventResponse] = event.getEvents();
        if (id > 0) {
            result := event.getEventByIds([id]);
        };
        return #ok(result);
    };

    // MARK: Get all events
    public query func getEventsByOwned(userId: TypCommon.UserId) 
    : async Result.Result<[TypEvent.EventResponse], ()> {
        var result : [TypEvent.EventResponse] = event.getEventByOwned(userId);
        return #ok(result);
    };

    // MARK: Create or Update event
    public shared ({caller}) func updateorCreateEvent(
        req : TypEvent.EventRequest
    ) : async Result.Result<Text, Text> {
        try {
            let _ = event.updateorCreateEvent(caller, req);
            return #ok("#update event successfull...");
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#update event failed...");
        };
	};

    // MARK: update status when participants are met
    public shared func updateStatusEvent(
        id : TypCommon.EventId,
        status: Bool
    ) : async Result.Result<Text, Text> {
        try {
            let _ = event.updateStatus(id, status);
            return #ok("#update event successfull...");
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#update event failed...");
        };
	};


    // MARK: System

    system func preupgrade() {
        stableEvents         := Iter.toArray(event.events.entries());
        stableOwnerEvents    := Iter.toArray(event.ownerEvents.entries());
    };

    system func postupgrade() {
        stableEvents         := [];
        stableOwnerEvents    := [];
    };

}