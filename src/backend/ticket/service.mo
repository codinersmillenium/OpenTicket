import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

import TypCommon "../common/type";
import TypTicket "type";

import UtlDate "../utils/date";
// import CanUser "canister:user";


module {
    private type TicketHashKey         = Text;
    private type TicketRespHashKey     = Principal;

    public type StableTicket         = (TicketHashKey, TypTicket.Ticket);
    public type StableTicketResale   = (TicketHashKey, TypTicket.ResaleTicket);
    public type StableTicketResp     = (TypCommon.UserId, TypTicket.Ticket);

    public class Ticket(
        dataTickets         : [StableTicket],
        dataResaleTickets   : [StableTicketResale],
        dataTicketsResponse : [StableTicketResp]
    ) {
        public let ticket        = HashMap.HashMap<TicketHashKey, TypTicket.Ticket>(dataTickets.size(), Text.equal, Text.hash);
        public let ticketResale  = HashMap.HashMap<TicketHashKey, TypTicket.ResaleTicket>(dataResaleTickets.size(), Text.equal, Text.hash);
        public let ticketResp    = HashMap.HashMap<TicketRespHashKey, TypTicket.TicketResponse>(dataTicketsResponse.size(), Principal.equal, Principal.hash);

        // MARK: Get event by user
        public func getTickets(ids: [TypCommon.UserId], seatId: Nat) : [TypTicket.TicketResponse] {
            let data = Buffer.Buffer<TypTicket.TicketResponse>(ids.size());
            for (id in ids.vals()) {
                switch (findTicketByUser(id)) {
                    case (null) {};
                    case (?e)   {
                        if (seatId == e.seatId) {
                            switch (findTicketBySeat(e.seatId)) {
                                case (null) {};
                                case (_) {
                                    data.add(e);
                                };
                            };
                        } else {
                            data.add(e);
                        }
                    };
                }
            };
            return Buffer.toArray(data);
        };

        // MARK: Find event by id {private func}
        private func findTicketByUser(userId : TypCommon.UserId) : ?TypTicket.TicketResponse {
            return switch (ticketResp.get(userId)) {
                case (null)    { return null; };
                case (result) { return result; };
            };
        };

        // MARK: Find event by id {private func}
        private func findTicketBySeat(seatId : TypCommon.SeatId) : ?TypTicket.TicketResponse {
            let id = Principal.fromText(Nat.toText(seatId));
            return switch (ticketResp.get(id)) {
                case (null)    { return null; };
                case (result) { return result; };
            };
        };

         // MARK: Get total ticket by user
        public func getTotalTicket(id: TypCommon.SeatId) : Nat {
            var total : Nat = 0;
            for ((_, t) in ticket.entries()) {
                if (t.seatId == id) {
                    total += 1;
                };
            };
            return total;
        };
        
        // MARK: Create ticket
        public func createTicket(
            code: Text,
            userId : TypCommon.UserId,
            req    : TypTicket.Ticket,
        ) : TypTicket.Ticket {
            let data = {
                id               = code;
                seatId           = req.seatId;
                createdAt        = UtlDate.now();
                createdBy        = userId;
                status           = #sale;
            };

            ticket.put(data.id, data);
            return data;
        };

        // MARK: check ticket
        public func checkVerifiedTicket(
            code : Text
        ) : Bool {
            return switch (ticket.get(code)) {
                case (null)    { 
                    return switch (ticketResale.get(code)) {
                        case (null) { return false; };
                        case (_) { return true; };
                    };
                };
                case (?e) { 
                    if (e.status == #resale) {
                        return switch (ticket.get(code)) {
                            case (null)    { return false; };
                            case (?e) { 
                                if (e.status == #resale) {
                                    return switch (ticketResale.get(code)) {
                                        case (null) { return false; };
                                        case (_) { return true; };
                                    };
                                };
                                return true;
                            };
                        };
                    };
                    return true;
                };
            };
        };

        // MARK: update resale ticket
        public func updateResaleTicket(
            ticketId : TypCommon.TicketId,
        ) : ?TypTicket.Ticket {
            switch (ticket.get(ticketId)) {
                case null {
                    return null;
                };
                case (?oldTicket) {
                    let updated = { oldTicket with status = #resale };
                    ticket.put(ticketId, updated);
                    return ?updated;
                };
            };
        };

        // MARK: Resale ticket
        public func resaleTicket(
            code: Text,
            userId : TypCommon.UserId,
            req    : TypTicket.ResaleTicket,
        ) : TypTicket.ResaleTicket {
            let data = {
                id        = req.id;
                code      = code;
                buyAt     = req.buyAt;
                ownedBy   = userId;
                createdAt = UtlDate.now();
                createdBy = userId;
            };

            ticketResale.put(data.id, data);
            return data;
        };

    }

}