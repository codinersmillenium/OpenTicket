import TypCommon "../common/type";

module {

    public type InvoiceStatus = { 
        #paid; #unpaid; #expired
    };

    public type PayMethod = { 
        #token; #qris; #va
    };

    public type Invoice = {
        id         : TypCommon.InvoiceId;
        userId     : TypCommon.UserId;
        seatId     : TypCommon.SeatId;
        createdAt  : Int;
        updateAt   : Int;
        total      : Nat;
        status     : InvoiceStatus;
        payMethod  : ?PayMethod;
    };

};