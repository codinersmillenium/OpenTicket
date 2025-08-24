import TypCommon "../common/type";
import Bool "mo:base/Bool";

module {

    public type Event = {
		id               : TypCommon.EventId;
        ownerId          : TypCommon.UserId;
        name             : Text;
        desc             : Text;
        dateStart        : Int;
		dateEnd          : Int;
        location         : Text;
        image            : ?Text;
        tags             : Text;
        isOver           : Bool;
        // Todo Image
    };

    // MARK: if the activity is with a seat type
    public type Seat = {
		id                     : TypCommon.SeatId;
        eventId                : TypCommon.EventId;
        name                   : Text;
        participantTotal       : Nat;
        priceTicket            : Nat;
        priceTicketMax         : Nat; // percentage max from ticket price (exp. 20% from normal price)
        royaltiTicketResale    : Nat; // percentage
        // Todo Image
    };

    public type EventResponse = {
        id               : TypCommon.EventId;
        ownerId          : TypCommon.UserId;
        name             : Text;
        desc             : Text;
        dateStart        : Int;
		dateEnd          : Int;
        location         : Text;
        image            : ?Text;
        tags             : Text;
        isOver           : Bool;
        seat             : [Seat];
    };

    public type EventRequest = {
        id               : TypCommon.EventId;
        name             : Text;
        desc             : Text;
        dateStart        : Int;
		dateEnd          : Int;
        tags             : Text;
        location         : Text;
        image            : ?Text;
        seat             : [Seat];
    };

};