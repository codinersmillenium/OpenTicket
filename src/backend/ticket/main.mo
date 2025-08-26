import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

import TypCommon "../common/type";
import TypTicket "type";

import SvcTicket "service";

import Utl "../utils/helper";

persistent actor {

    private var stableTicket          : [SvcTicket.StableTicket]         = [];
    private var stableResaleTicket    : [SvcTicket.StableTicketResale]   = [];
    private var stableTicketsResponse : [SvcTicket.StableTicketResp]     = [];

    transient let ticket = SvcTicket.Ticket(
        stableTicket,
        stableResaleTicket,
        stableTicketsResponse
    );

    // MARK: Get ticket
    public query func getTickets(
        ownedId: TypCommon.UserId,
        seatId: TypCommon.SeatId
    ) 
    : async Result.Result<[TypTicket.TicketResponse], ()> {
        let result : [TypTicket.TicketResponse] = ticket.getTickets([ownedId], seatId);
        return #ok(result);
    };

    // MARK: Check ticket
    public query func checkTicketByCode(
        code: Text
    ) : async Result.Result<?TypTicket.TicketResponse, ()> {
        let result = ticket.getTicketByCode(code);
        return #ok(result);
    };

    // MARK: Get count ticket on event
    public query func getTicketQty(
        seatId: TypCommon.SeatId
    ) 
    : async Result.Result<Nat, ()> {
        let result : Nat = ticket.getTotalTicket(seatId);
        return #ok(result);
    };

    // MARK: Check ticket
    public query func checkTicket(
        code: Text
    ) : async Bool {
        return ticket.checkVerifiedTicket(code);
	};

    // MARK: Create ticket
    public shared ({caller}) func createTicket(
        req : TypTicket.Ticket
    ) : async Result.Result<TypTicket.Ticket, Text> {
        try {
            let code: Text = await Utl.generateCode("#TCT-", 8);
            let result = ticket.createTicket(code, caller, req);
            return #ok(result);
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#get ticket failed...");
        };
	};

    // MARK: Create ticket resale
    public shared func updateSignTicket(
        id: TypCommon.TicketId,
        signature: Text
    ) : async Result.Result<Text, Text> {
        try {
            let _ = ticket.updateSignTicket(id, signature);
            return #ok("#resale ticket successfull...");
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#resale ticket failed...");
        };
	};

    // MARK: Create ticket resale
    public shared func resaleTicket(
        id: TypCommon.TicketId
    ) : async Result.Result<Text, Text> {
        try {
            let _ = ticket.updateResaleTicket(id);
            return #ok("#resale ticket successfull...");
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#resale ticket failed...");
        };
	};

    // MARK: Update ticket
    public shared ({caller}) func createResaleTicket(
        req : TypTicket.ResaleTicket
    ) : async Result.Result<TypTicket.ResaleTicket, Text> {
        try {
            let code: Text = await Utl.generateCode("#TCT-", 8);
            let result = ticket.resaleTicket(code, caller, req);
            return #ok(result);
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#get ticket failed...");
        };
	};



    // MARK: System

    system func preupgrade() {
        stableTicket         := Iter.toArray(ticket.ticket.entries());
        stableResaleTicket   := Iter.toArray(ticket.ticketResale.entries());
    };

    system func postupgrade() {
        stableTicket         := [];
        stableResaleTicket    := [];
    };

}