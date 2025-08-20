import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

import TypCommon "../common/type";
import TypEvent "type";

import Utl "../utils/helper";
// import CanUser "canister:user";


module {
    private type EventHashKey       = Blob;
    private type SeatEventHashKey   = Blob;

    public type StableEvents        = (EventHashKey, TypEvent.Event);
    public type StableSeats         = (SeatEventHashKey, TypEvent.Seat);
    public type StableSeatEvents    = (EventHashKey, TypEvent.EventResponse);
    public type StableOwnerEvents   = (TypCommon.UserId, [TypCommon.EventId]);

    public class Event(
        eventId            : Nat,
        seatId             : Nat,
        dataEvents         : [StableEvents],
        dataSeats          : [StableSeats],
        dataSeatsEvents    : [StableSeatEvents],
        dataOwnerEvents    : [StableOwnerEvents],
    ) {
        public var nextEventId    = eventId;
        public var nextSeatId     = seatId;
        public let events         = HashMap.HashMap<EventHashKey, TypEvent.Event>(dataEvents.size(), Blob.equal, Blob.hash);
        public let seats          = HashMap.HashMap<SeatEventHashKey, TypEvent.Seat>(dataSeats.size(), Blob.equal, Blob.hash);
        public let eventsResp     = HashMap.HashMap<EventHashKey, TypEvent.EventResponse>(dataSeatsEvents.size(), Blob.equal, Blob.hash);
        public let ownerEvents    = HashMap.HashMap<TypCommon.UserId, [TypCommon.EventId]>(dataOwnerEvents.size(), Principal.equal, Principal.hash);

        public func getEventPrimaryId(): Nat {
            let id = nextEventId;
            nextEventId += 1;
            return id;
        };
        public func getSeatPrimaryId(): Nat {
            let id = nextSeatId;
            nextSeatId += 1;
            return id;
        };

        // MARK: Get event by id
        public func getEventByIds(ids: [Nat]) : [TypEvent.EventResponse] {
            let data = Buffer.Buffer<TypEvent.EventResponse>(ids.size());
            for (id in ids.vals()) {
                if (findSeatById(id) != null or findSeatById(id) == null) {
                    switch (findEventById(id)) {
                        case (?t) { data.add(t) };
                        case null {};
                    };
                };
            };
            return Buffer.toArray(data);
        };

        // MARK: Find event by id {private func}
        private func findEventById(eventId : TypCommon.EventId) : ?TypEvent.EventResponse {
            return switch (eventsResp.get(Utl.natToBlob(eventId))) {
                case (null) { return null; };
                case (e) { return e; };
            };
        };

        // MARK: Find seat by id {private func}
        private func findSeatById(seatId : TypCommon.SeatId) : ?TypEvent.Seat {
            return switch (seats.get(Utl.natToBlob(seatId))) {
                case (null) { return null; };
                case (e) { return e; };
            };
        };

        // MARK: Get events
        public func getEvents() : [TypEvent.EventResponse] {
            return Iter.toArray(eventsResp.vals())
        };
        
        

        // MARK: Create or update project
        public func updateorCreateEvent(
            ownerId     : TypCommon.UserId,
            req         : TypEvent.EventRequest
        ) : TypEvent.EventResponse {
            let id : Nat = if (req.id < 1) { getEventPrimaryId() } else { req.id };
            let dataEvent = {
                id               = id;
                ownerId          = ownerId;
                name             = req.name;
                desc             = req.desc;
                dateStart        = req.dateStart;
                dateEnd          = req.dateEnd;
                latitude         = req.latitude;
                longitude        = req.longitude;
                publish          = req.publish;
                isOver           = req.isOver;
            };

            events.put(Utl.natToBlob(dataEvent.id), dataEvent);

            let dataSeats = Array.map<TypEvent.Seat, TypEvent.Seat>(req.seat, func(obj) {
                let idSeat = if (obj.id < 1) { getSeatPrimaryId() } else { obj.id };
                let dataSeat = {
                    id                  = idSeat;
                    eventId             = id;
                    name                = obj.name;
                    desc                = obj.desc;
                    participantTotal    = obj.participantTotal;
                    priceTicketToken    = obj.priceTicketToken;
                    priceTicketMax      = obj.priceTicketMax; // percentage max from ticket price (exp. 20% from normal price)
                    royaltiTicketResale = obj.royaltiTicketResale; // percentage
                };
                seats.put(Utl.natToBlob(idSeat), dataSeat);
                dataSeat
            });

            if (dataSeats.size() < 1) {
                deleteSeats(dataEvent.id);
            };

            { dataEvent with seat = dataSeats }
        };

        // MARK: delete seats
        public func deleteSeats(eventId : Nat) : () {
            for ((key, seat) in seats.entries()) {
                if (seat.eventId == eventId) {
                    seats.delete(key);
                };
            };
        };

        // MARK: Update status
        public func updateStatus(
            eventId : TypCommon.EventId,
            reqStatus : Bool
        ) : ?TypEvent.Event {
            switch (events.get(Utl.natToBlob(eventId))) {
                case (null) { return null; };
                case (?e) {
                    let updated = { e with isOver = reqStatus };
                    events.put(Utl.natToBlob(eventId), updated);
                    return ?updated;
                }
            }
        }
    }

}