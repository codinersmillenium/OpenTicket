import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Nat "mo:base/Nat";

import TypCommon "../common/type";
import TypEvent "type";

import SvcEvent "service";
import SvcToken "canister:token";

persistent actor {
    private var nextEventId   : TypCommon.EventId = 1;
    private var nextSeatId   : TypCommon.SeatId = 1;

    private var stableEvents         : [SvcEvent.StableEvents]         = [];
    private var stableSeats          : [SvcEvent.StableSeats]         = [];

    transient let event = SvcEvent.Event(
        nextEventId,
        nextSeatId,
        stableEvents,
        stableSeats,
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

    // MARK: Get all events by owned
    public query func getEventsByOwned(userId: TypCommon.UserId) 
    : async Result.Result<[TypEvent.EventResponse], ()> {
        var result : [TypEvent.EventResponse] = event.getEventByOwned(userId);
        return #ok(result);
    };

    // MARK: Get seat by id
    public query func getSeatById(id: Nat) 
    : async Result.Result<TypEvent.Seat, ()> {
        switch (event.getSeatById(id)) {
            case null { return #err(); };
            case (?seat) { return #ok(seat); };
        };
    };

    // MARK: Create or Update event
    public shared ({caller}) func updateorCreateEvent(
        req : TypEvent.EventRequest
    ) : async Result.Result<{status: Text; message: Text}, Text> {
        try {
            let balance: Nat = await SvcToken.balanceOf(caller);
            var total: Nat = 0;
            for(i in req.seat.vals()) {
                total += (i.priceTicket * i.participantTotal)
            };
            let fee: Nat = total * 6 / 100;
            let convertBalance = await SvcToken.convertToken(fee);
            if (balance < convertBalance) {
                return #ok({
                    status = "insufficient";
                    message = Nat.toText(convertBalance);
                });
            } else {
                let _ = event.updateorCreateEvent(caller, req);
                return #ok({
                    status = "success";
                    message = "#update event successfull...";
                })
            }
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
    };

    system func postupgrade() {
        stableEvents         := [];
    };

}