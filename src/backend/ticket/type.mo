import TypCommon "../common/type";

module {

    public type TicketStatus = { #sale; #resale };

    public type TicketBase = {
        id         : TypCommon.TicketId;
        createdAt  : Int;
        createdBy  : TypCommon.UserId;
        signature  : Text;
    };

    public type Ticket = TicketBase and {
        seatId : TypCommon.SeatId;
        status : TicketStatus;
    };

    public type ResaleTicket = TicketBase and {
        code    : Text;
        buyAt   : ?Int;
        ownedBy : TypCommon.UserId;
    };

    public type TicketResponse = Ticket and {
        resale : [?ResaleTicket];
    };

    public type Invoice = {
        id         : TypCommon.InvoiceId;
        userId     : TypCommon.UserId;
        seatId     : TypCommon.SeatId;
        createdAt  : Int;
    };

};