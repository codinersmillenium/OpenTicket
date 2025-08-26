import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

import TypCommon "../common/type";
import TypInvoice "type";

import UtlDate "../utils/date";


module {
    private type InvoiceHashKey         = TypCommon.InvoiceId;

    public type StableInvoice         = (InvoiceHashKey, TypInvoice.Invoice);

    public class Invoice(
        dataInvoice         : [StableInvoice]
    ) {
        public let invoice  = HashMap.HashMap<InvoiceHashKey, TypInvoice.Invoice>(dataInvoice.size(), Text.equal, Text.hash);

        // MARK: Get event by user
        public func getInvoice(userIds: [TypCommon.UserId], seatId: Nat) : [TypInvoice.Invoice] {
            let data = Buffer.Buffer<TypInvoice.Invoice>(userIds.size());
            for (uid in userIds.vals()) {
                switch (findInvoiceByUser(uid)) {
                    case (null) {};
                    case (?inv) {
                        if (seatId == inv.seatId or seatId < 1) {
                            data.add(inv);
                        };
                    };
                };
            };

            return Buffer.toArray(data);
        };

        public func getInvoiceStatusById(id: TypCommon.InvoiceId) : TypInvoice.InvoiceStatus {
            switch (invoice.get(id)) {
                case (null) { return #expired; };
                case (?inv) { return inv.status; };
            };
        };

        public func getInvoiceBySeat(seatId: Nat) : [TypInvoice.Invoice] {
            let data = Buffer.Buffer<TypInvoice.Invoice>(0);
            for (i in invoice.vals()) {
                if (i.seatId == seatId) {
                    data.add(i)
                };
            };
            return Buffer.toArray(data);
        };

        // MARK: Find invoice by userId
        private func findInvoiceByUser(userId : TypCommon.UserId) : ?TypInvoice.Invoice {
            for (inv in invoice.vals()) {
                if (inv.userId == userId) {
                    return ?inv;
                };
            };
            return null;
        };
        
        // MARK: Create invoice
        public func createInvoice(
            code: Text,
            userId : TypCommon.UserId,
            req    : {
                seatId: Nat;
                total: Nat;
                payMethod: ?TypInvoice.PayMethod;
            }
        ) : TypInvoice.Invoice {
            let data = {
                id               = code;
                seatId           = req.seatId;
                userId           = userId;
                createdAt        = UtlDate.now();
                updateAt         = UtlDate.now();
                total            = req.total;
                status           = #unpaid;
                payMethod        = req.payMethod;
            };

            invoice.put(data.id, data);
            return data;
        };

        // MARK: update invoice
        public func updateInvoice(
            id : TypCommon.InvoiceId,
            req: TypInvoice.Invoice
        ) : ?TypInvoice.Invoice {
            switch (invoice.get(id)) {
                case null {
                    return null;
                };
                case (?oldTicket) {
                    let updated = { 
                        oldTicket with 
                        status = req.status;
                        updateAt = UtlDate.now();
                        payMethod = req.payMethod;
                    };
                    invoice.put(id, updated);
                    return ?updated;
                };
            };
        };

    }

}