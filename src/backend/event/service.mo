import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

import TypCommon "../common/type";
import TypEvent "type";

import Utl "../utils/helper";


module {
    private type EventHashKey       = Blob;
    private type SeatEventHashKey   = Blob;

    public type StableEvents        = (EventHashKey, TypEvent.Event);
    public type StableSeats         = (SeatEventHashKey, TypEvent.Seat);

    public class Event(
        eventId            : Nat,
        seatId             : Nat,
        dataEvents         : [StableEvents],
        dataSeats          : [StableSeats]
    ) {
        public var nextEventId    = eventId;
        public var nextSeatId     = seatId;
        public let events         = HashMap.HashMap<EventHashKey, TypEvent.Event>(dataEvents.size(), Blob.equal, Blob.hash);
        public let ownerEvents    = HashMap.HashMap<TypCommon.UserId, [TypCommon.EventId]>(dataEvents.size(), Principal.equal, Principal.hash);
        public let seats          = HashMap.HashMap<SeatEventHashKey, TypEvent.Seat>(dataSeats.size(), Blob.equal, Blob.hash);

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

        // MARK: Find event by id
        public func getEventByIds(ids: [Nat]) : [TypEvent.EventResponse] {
            Array.mapFilter<Nat, TypEvent.EventResponse>(
                ids,
                func(id) {
                    switch (events.get(Utl.natToBlob(id))) {
                        case (?e) { ?mappedToResponse(e) };
                        case null { null };
                    }
                }
            )
        };

        // MARK: Find event by owned
        public func getEventByOwned(owner: TypCommon.UserId) : [TypEvent.EventResponse] {
            Array.mapFilter<TypEvent.Event, TypEvent.EventResponse>(
                Iter.toArray(events.vals()),
                func(e) {
                    if (e.ownerId == owner) {
                        ?mappedToResponse(e)
                    } else {
                        null
                    }
                }
            )
        };

        // MARK: Get events
        public func getEvents() : [TypEvent.EventResponse] {
            return Array.map<TypEvent.Event, TypEvent.EventResponse>(
                Iter.toArray(events.vals()),
                mappedToResponse
            );
        };

        // MARK: Get seat by id
        public func getSeatById(id: Nat) : ?TypEvent.Seat {
            switch (seats.get(Utl.natToBlob(id))) {
                case (null)  { return null; };
                case (?data) {
                    return ?data;
                };
            };
        };

         // MARK: Mapped to data response
        private func mappedToResponse(event : TypEvent.Event) : TypEvent.EventResponse {
            let filteredSeats = Array.filter<TypEvent.Seat>(
                Iter.toArray(seats.vals()), 
                func(obj) { obj.eventId == event.id
            });
            {
                id         = event.id;
                ownerId    = event.ownerId;
                name       = event.name;
                desc       = event.desc;
                dateStart  = event.dateStart;
                dateEnd    = event.dateEnd;
                tags       = event.tags;
                location   = event.location;
                image      = event.image;
                isOver     = event.isOver;
                seat       = filteredSeats;
            }
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
                tags             = req.tags;
                location         = req.location;
                image            = req.image;
                isOver           = false;
            };

            events.put(Utl.natToBlob(dataEvent.id), dataEvent);

            let dataSeats = Array.map<TypEvent.Seat, TypEvent.Seat>(req.seat, func(obj) {
                let idSeat = if (obj.id < 1) { getSeatPrimaryId() } else { obj.id };
                let dataSeat = {
                    id                  = idSeat;
                    eventId             = id;
                    name                = obj.name;
                    participantTotal    = obj.participantTotal;
                    priceTicket         = obj.priceTicket;
                    priceTicketMax      = obj.priceTicketMax; // percentage max from ticket price (exp. 20% from normal price)
                    royaltiTicketResale = obj.royaltiTicketResale; // percentage
                };
                seats.put(Utl.natToBlob(idSeat), dataSeat);
                dataSeat
            });

            if (dataSeats.size() < 1) {
                deleteSeats(dataEvent.id);
            };
            mappedToResponse(dataEvent)
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