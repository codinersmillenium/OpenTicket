import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

import TypCommon "../common/type";
import TypInvoice "type";

import SvcInvoice "service";

import Utl "../utils/helper";

persistent actor {

    private var stableInvoice          : [SvcInvoice.StableInvoice]         = [];

    transient let invoice = SvcInvoice.Invoice(
        stableInvoice
    );

    // MARK: Get invoice By User
    public query func getInvoiceByUser(
        userId: TypCommon.UserId,
        seatId: TypCommon.SeatId
    ) 
    : async Result.Result<[TypInvoice.Invoice], ()> {
        let result : [TypInvoice.Invoice] = invoice.getInvoice([userId], seatId);
        return #ok(result);
    };

    // MARK: Get invoice By Seat
    public query func getInvoiceBySeat(
        seatId: TypCommon.SeatId
    ) 
    : async Result.Result<[TypInvoice.Invoice], ()> {
        let result : [TypInvoice.Invoice] = invoice.getInvoiceBySeat(seatId);
        return #ok(result);
    };

    // MARK: Create invoice
    public shared ({caller}) func createInvoice(
        req : {
            seatId: Nat;
            total: Nat;
            payMethod: ?TypInvoice.PayMethod;
        }
    ) : async Result.Result<TypInvoice.Invoice, Text> {
        try {
            let code: Text = await Utl.generateCode("#IVC-", 6);
            let result = invoice.createInvoice(code, caller, req);
            return #ok(result);
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#get invoice failed...");
        };
	};

    // MARK: Update invoice
    public shared func updateInvoice(
        id: TypCommon.InvoiceId,
        req: TypInvoice.Invoice
    ) : async Result.Result<Text, Text> {
        try {
            let _ = invoice.updateInvoice(id, req);
            return #ok("#resale invoice successfull...");
        } catch (err) {
            Debug.print("Caught error: " # Error.message(err));
            return #err("#resale invoice failed...");
        };
	};



    // MARK: System
    system func preupgrade() {
        stableInvoice         := Iter.toArray(invoice.invoice.entries());
    };

    system func postupgrade() {
        stableInvoice         := [];
    };

}